# blog/views.py (or wherever your endpoints are defined)
from ninja import Form, Router, Query, File, UploadedFile
from typing import List, Optional
from django.shortcuts import get_object_or_404
from uuid import UUID
from datetime import datetime
import logging
from django.utils.text import slugify

from apps.blog.models import Blog, Category, Tag, GalleryImage, Author
from apps.blog.schema import (
    AuthorOut,
    AuthorIn,
    CategoryOut,
    CategoryIn,
    TagOut,
    TagIn,
    GalleryImageOut,
    BlogOut,
    BlogIn,
    BlogPatch,
    GalleryImageIn,
    BlogSEOAnalysisIn,
    PaginatedBlogResponse,
    PaginatedCategoryResponse,
    PaginatedTagResponse,
    PaginatedAuthorResponse,
    PaginatedGalleryResponse,
)
from apps.blog.schemas.bulk import BulkPostIDs, BulkPostCategory, BulkPostTag
from authentication.ninja_auth import django_auth_is_staff

logger = logging.getLogger(__name__)

# Create separate routers for each section.
post_router = Router(tags=["Post"])
category_router = Router(tags=["Category"])
tag_router = Router(tags=["Tag"])
author_router = Router(tags=["Author"])
gallery_router = Router(tags=["Gallery"])

# ------------------------
# Helper Pagination Function
# ------------------------
def paginate_queryset(qs, page: int, page_size: int):
    total_items = qs.count()
    total_pages = (total_items + page_size - 1) // page_size
    start = (page - 1) * page_size
    end = start + page_size
    return qs[start:end], total_items, total_pages

# ------------------------
# Serialization Helpers
# ------------------------
def serialize_category(category: Category) -> dict:
    return {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
    }

def serialize_tag(tag: Tag) -> dict:
    return {
        "id": tag.id,
        "name": tag.name,
        "slug": tag.slug,
    }

def serialize_author(author: Author) -> dict:
    return {
        "id": author.id,
        "full_name": author.user.get_full_name(),
        "bio": author.bio,
        "instagram": author.instagram,
        "facebook": author.facebook,
        "x": author.x,
        "linkedin": author.linkedin,
        "github": author.github,
        "pinterest": author.pinterest,
        "threads": author.threads,
        "bluesky": author.bluesky,
        "youtube": author.youtube,
        "tiktok": author.tiktok,
    }

def serialize_gallery_image(request, image: GalleryImage) -> dict:
    return {
        "id": image.id,
        "image": request.build_absolute_uri(image.image.url),
        "alt_text": image.alt_text,
        "caption": image.caption,
        "uploaded_at": image.uploaded_at.isoformat() if image.uploaded_at else None,
    }

def serialize_blog(request, blog: Blog) -> dict:
    return {
        "id": blog.id,
        "title": blog.title,
        "slug": blog.slug,
        "excerpt": blog.excerpt,
        "content": blog.content,
        "featured_image": request.build_absolute_uri(blog.featured_image.url) if blog.featured_image else None,
        "published": blog.published,
        "created_at": blog.created_at.isoformat() if blog.created_at else None,
        "updated_at": blog.updated_at.isoformat() if blog.updated_at else None,
        "category": serialize_category(blog.category) if blog.category else None,
        "tags": [serialize_tag(tag) for tag in blog.tags.all()],
        "author": serialize_author(blog.author) if blog.author else None,
        "keyphrase": blog.keyphrase,
        "cornerstone_content": blog.cornerstone_content,
        "seo_score": blog.seo_score,
        "readability_score": blog.readability_score,
    }

@post_router.get("/posts", response=PaginatedBlogResponse)
def list_blogs(
    request,
    published: Optional[bool] = None,
    category: Optional[UUID] = None,
    author: Optional[UUID] = None,
    # Tags can be provided multiple times: e.g. ?tags=<uuid>&tags=<uuid>
    tags: Optional[List[UUID]] = Query(None),
    page: int = 1,
    page_size: int = 25,
    sort_by: Optional[str] = "title",  # Field to sort by
    order: Optional[str] = "asc",        # "asc" or "desc"
):
    logger.info(
        f"Fetched blogs with filters: published={published}, category={category}, author={author}, tags={tags}"
    )
    logger.info(f"Sorting by: {sort_by} ({order})")
    qs = Blog.objects.all()

    # For non-admin users, force published=True.
    if not (request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)):
        qs = qs.filter(published=True)
    else:
        if published is not None:
            qs = qs.filter(published=published)

    if category is not None:
        qs = qs.filter(category_id=category)
    if author is not None:
        qs = qs.filter(author_id=author)
    if tags:
        qs = qs.filter(tags__id__in=tags).distinct()

    # --- Compute Available Filters on the Filtered Data using field-specific distinct ---
    # Explicitly order by the same fields as in distinct() to satisfy PostgreSQL requirements.
    available_categories = qs.filter(category__isnull=False)\
        .values("category__id", "category__name")\
        .order_by("category__id", "category__name")\
        .distinct("category__id", "category__name")
    available_authors = qs.filter(author__isnull=False)\
        .values("author__id", "author__user__first_name", "author__user__last_name")\
        .order_by("author__id", "author__user__first_name", "author__user__last_name")\
        .distinct("author__id", "author__user__first_name", "author__user__last_name")
    available_tags = qs.filter(tags__isnull=False)\
        .values("tags__id", "tags__name")\
        .order_by("tags__id", "tags__name")\
        .distinct("tags__id", "tags__name")

    categories_list = [
        {"id": row["category__id"], "name": row["category__name"]}
        for row in available_categories
    ]
    authors_list = [
        {
            "id": row["author__id"],
            "full_name": f"{row['author__user__first_name']} {row['author__user__last_name']}".strip(),
        }
        for row in available_authors
    ]
    tags_list = [
        {"id": row["tags__id"], "name": row["tags__name"]}
        for row in available_tags
    ]

    available_filters = {
        "categories": categories_list,
        "authors": authors_list,
        "tags": tags_list,
    }

    # --- Sorting ---
    allowed_sort_fields = [
        "title",
        "slug",
        "published",
        "created_at",
        "updated_at",
        "category__name",
        "author__user__last_name",
    ]
    if sort_by not in allowed_sort_fields:
        sort_by = "title"

    sort_order = f"-{sort_by}" if order.lower() == "desc" else sort_by
    qs = qs.order_by(sort_order)

    # --- Pagination ---
    items, total_items, total_pages = paginate_queryset(qs, page, page_size)
    serialized_items = [serialize_blog(request, item) for item in items]
    pagination = {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "has_next_page": page < total_pages,
        "has_previous_page": page > 1,
        "next_page": page + 1 if page < total_pages else None,
        "previous_page": page - 1 if page > 1 else None,
    }

    return {
        "results": serialized_items,
        "pagination": pagination,
        "available_filters": available_filters,
    }



@post_router.get("/posts/{uuid:post_id}", response=BlogOut)
def get_blog(request, post_id: UUID):
    blog = get_object_or_404(Blog, id=post_id)
    return serialize_blog(request, blog)


@post_router.post("/posts", response=BlogOut, auth=django_auth_is_staff)
def create_blog(request, payload: BlogIn, file: File[UploadedFile]):

    # Look up the category using the UUID from the payload.
    category = get_object_or_404(Category, id=payload.category_id)

    # Check for an existing blog with the same slug if provided.
    if payload.slug:
        blog = Blog.objects.filter(slug=payload.slug).first()
        if blog:
            return {"detail": "A blog with this slug already exists."}
    else:
        payload.slug = slugify(payload.title)

    # Create the blog instance using the data from the payload.
    blog = Blog.objects.create(
        slug=payload.slug,
        title=payload.title,
        excerpt=payload.excerpt,
        content=payload.content,
        category=category,
        published=payload.published,
        keyphrase=payload.keyphrase,
        cornerstone_content=payload.cornerstone_content,
        seo_score=payload.seo_score,
        seo_analysis=payload.seo_analysis,
        readability_score=payload.readability_score,
        readability_analysis=payload.readability_analysis,
    )

    # Link the author if available.
    if request.user.is_authenticated:
        try:
            blog.author = request.user.author_profile
        except Author.DoesNotExist:
            blog.author = None
    blog.save()

    # Set tags if provided.
    if payload.tag_ids:
        tags = Tag.objects.filter(id__in=payload.tag_ids)
        blog.tags.set(tags)

    # Handle the featured image from the file parameter.
    if file:
        blog.featured_image = file
        blog.save()

    return serialize_blog(request,blog)


@post_router.put("/posts/{uuid:post_id}", response=BlogOut, auth=django_auth_is_staff)
def update_blog(request, post_id: UUID, payload: BlogIn):

    blog = get_object_or_404(Blog, id=post_id)
    if payload.slug:
        check_blog = Blog.objects.filter(slug=payload.slug).exclude(id=post_id).first()
        if check_blog:
            return {"detail": "A blog with this slug already exists."}
        blog.slug = payload.slug

    blog.title = payload.title
    blog.excerpt = payload.excerpt
    blog.content = payload.content
    blog.published = payload.published
    blog.keyphrase = payload.keyphrase
    blog.seo_score = payload.seo_score
    blog.seo_analysis = payload.seo_analysis
    blog.readability_score = payload.readability_score
    blog.readability_analysis = payload.readability_analysis
    blog.cornerstone_content = payload.cornerstone_content
    blog.category = get_object_or_404(Category, id=payload.category_id)
    if payload.tag_ids:
        tags = Tag.objects.filter(id__in=payload.tag_ids)
        blog.tags.set(tags)
    else:
        blog.tags.clear()
    
    blog.save()
    
    return serialize_blog(request,blog)

@post_router.post("/posts/{post_id}/featured-image", response=BlogOut, auth=django_auth_is_staff)
def update_featured_image(
    request,
    post_id: UUID,
    file: UploadedFile = File(...),
):
    blog = get_object_or_404(Blog, id=post_id)
    blog.featured_image = file
    blog.save()
    return serialize_blog(request, blog)


@post_router.patch("/posts/{uuid:post_id}", response=BlogOut, auth=django_auth_is_staff)
def patch_blog(request, post_id: UUID, payload: BlogPatch):
    blog = get_object_or_404(Blog, id=post_id)

    if payload.slug is not None:
        check_blog = Blog.objects.filter(slug=payload.slug).exclude(id=post_id).first()
        if check_blog:
            return {"detail": "A blog with this slug already exists."}
        blog.slug = payload.slug

    # Only update fields if they are provided.
    if payload.title is not None:
        blog.title = payload.title
    if payload.excerpt is not None:
        blog.excerpt = payload.excerpt
    if payload.content is not None:
        blog.content = payload.content
    if payload.published is not None:
        blog.published = payload.published
    if payload.keyphrase is not None:
        blog.keyphrase = payload.keyphrase
    if payload.cornerstone_content is not None:
        blog.cornerstone_content = payload.cornerstone_content
    if payload.seo_score is not None:
        blog.seo_score = payload.seo_score
    if payload.seo_analysis is not None:
        blog.seo_analysis = payload.seo_analysis
    if payload.readability_score is not None:
        blog.readability_score = payload.readability_score
    if payload.readability_analysis is not None:
        blog.readability_analysis = payload.readability_analysis
    if payload.category_id is not None:
        blog.category = get_object_or_404(Category, id=payload.category_id)
    if payload.author_id is not None:
        blog.author = get_object_or_404(Author, id=payload.author_id)
    if payload.tag_ids is not None:
        if payload.tag_ids:
            tags = Tag.objects.filter(id__in=payload.tag_ids)
            blog.tags.set(tags)
        else:
            blog.tags.clear()

    # Save the blog after applying partial updates.
    blog.save()
    return serialize_blog(request,blog)


@post_router.post("/posts/{post_id}/seo", response=BlogOut, auth=django_auth_is_staff)
def update_seo_analysis(request, post_id: UUID, payload: BlogSEOAnalysisIn):
    blog = get_object_or_404(Blog, id=post_id)
    blog.seo_score = payload.seo_score
    blog.seo_analysis = payload.seo_analysis
    blog.readability_score = payload.readability_score
    blog.readability_analysis = payload.readability_analysis
    blog.save()
    return serialize_blog(request,blog)


@post_router.delete("/posts/{uuid:post_id}", auth=django_auth_is_staff)
def delete_blog(request, post_id: UUID):
    blog = get_object_or_404(Blog, id=post_id)
    blog.delete()
    return {"detail": "Deleted successfully."}


@post_router.get("/posts/{post_id}/related", response=List[BlogOut])
def related_blogs(request, post_id: UUID):
    blog = get_object_or_404(Blog, id=post_id)
    related = blog.get_related_posts()
    return [serialize_blog(request,item) for item in related]


# Dedicated endpoints for filtering by category or tag (with pagination)
@post_router.get("/posts/by_category/{category_id}", response=PaginatedBlogResponse)
def blogs_by_category(request, category_id: UUID, page: int = 1, page_size: int = 25):
    qs = Blog.objects.filter(category_id=category_id)
    items, total_items, total_pages = paginate_queryset(qs, page, page_size)
    serialized_items = [serialize_blog(request,item) for item in items]
    pagination = {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "has_next_page": page < total_pages,
        "has_previous_page": page > 1,
        "next_page": page + 1 if page < total_pages else None,
        "previous_page": page - 1 if page > 1 else None,
    }
    return {"results": serialized_items, "pagination": pagination}


@post_router.get("/posts/by_tag/{tag_id}", response=PaginatedBlogResponse)
def blogs_by_tag(request, tag_id: UUID, page: int = 1, page_size: int = 25):
    qs = Blog.objects.filter(tags__id=tag_id).distinct()
    items, total_items, total_pages = paginate_queryset(qs, page, page_size)
    serialized_items = [serialize_blog(request,item) for item in items]
    pagination = {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "has_next_page": page < total_pages,
        "has_previous_page": page > 1,
        "next_page": page + 1 if page < total_pages else None,
        "previous_page": page - 1 if page > 1 else None,
    }
    return {"results": serialized_items, "pagination": pagination}


# ------------------------
# Bulk Post Endpoints
# ------------------------

@post_router.delete("/posts/bulk-delete", auth=django_auth_is_staff)
def bulk_delete_posts(request, payload: BulkPostIDs):
    qs = Blog.objects.filter(id__in=payload.post_ids)
    count = qs.count()
    qs.delete()
    return {"detail": f"Deleted {count} posts successfully."}


@post_router.patch("/posts/bulk-publish", auth=django_auth_is_staff)
def bulk_publish_posts(request, payload: BulkPostIDs):
    qs = Blog.objects.filter(id__in=payload.post_ids)
    updated = qs.update(published=True)
    return {"detail": f"Published {updated} posts successfully."}


@post_router.patch("/posts/bulk-draft", auth=django_auth_is_staff)
def bulk_draft_posts(request, payload: BulkPostIDs):
    qs = Blog.objects.filter(id__in=payload.post_ids)
    updated = qs.update(published=False)
    return {"detail": f"Set {updated} posts to draft successfully."}


@post_router.patch("/posts/bulk-cornerstone", auth=django_auth_is_staff)
def bulk_cornerstone_posts(request, payload: BulkPostIDs):
    qs = Blog.objects.filter(id__in=payload.post_ids)
    updated = qs.update(cornerstone_content=True)
    return {"detail": f"Marked {updated} posts as cornerstone successfully."}


@post_router.patch("/posts/bulk-not-cornerstone", auth=django_auth_is_staff)
def bulk_not_cornerstone_posts(request, payload: BulkPostIDs):
    qs = Blog.objects.filter(id__in=payload.post_ids)
    updated = qs.update(cornerstone_content=False)
    return {"detail": f"Marked {updated} posts as not cornerstone successfully."}


@post_router.patch("/posts/bulk-add-category", auth=django_auth_is_staff)
def bulk_add_category(request, payload: BulkPostCategory):
    category = get_object_or_404(Category, id=payload.category_id)
    qs = Blog.objects.filter(id__in=payload.post_ids)
    updated = qs.update(category=category)
    return {"detail": f"Assigned category to {updated} posts successfully."}


@post_router.patch("/posts/bulk-remove-category", auth=django_auth_is_staff)
def bulk_remove_category(request, payload: BulkPostCategory):
    qs = Blog.objects.filter(id__in=payload.post_ids, category_id=payload.category_id)
    updated = qs.update(category=None)
    return {"detail": f"Removed category from {updated} posts successfully."}


@post_router.patch("/posts/bulk-add-tag", auth=django_auth_is_staff)
def bulk_add_tag(request, payload: BulkPostTag):
    qs = Blog.objects.filter(id__in=payload.post_ids)
    tags = list(Tag.objects.filter(id__in=payload.tag_ids))
    count = 0
    for blog in qs:
        blog.tags.add(*tags)
        count += 1
    return {"detail": f"Added tags to {count} posts successfully."}


@post_router.patch("/posts/bulk-remove-tag", auth=django_auth_is_staff)
def bulk_remove_tag(request, payload: BulkPostTag):
    qs = Blog.objects.filter(id__in=payload.post_ids)
    count = 0
    for blog in qs:
        blog.tags.remove(*payload.tag_ids)
        count += 1
    return {"detail": f"Removed tags from {count} posts successfully."}



# ------------------------
# Category Endpoints (with pagination)
# ------------------------
@category_router.get("/categories", response=PaginatedCategoryResponse)
def list_categories(request, page: int = 1, page_size: int = 25):
    qs = Category.objects.all()
    items, total_items, total_pages = paginate_queryset(qs, page, page_size)
    serialized_items = [serialize_category(cat) for cat in items]
    pagination = {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "has_next_page": page < total_pages,
        "has_previous_page": page > 1,
        "next_page": page + 1 if page < total_pages else None,
        "previous_page": page - 1 if page > 1 else None,
    }
    return {"results": serialized_items, "pagination": pagination}


@category_router.post("/categories", response=CategoryOut, auth=django_auth_is_staff)
def create_category(request, payload: CategoryIn):
    category = Category.objects.create(name=payload.name)
    return serialize_category(category)


@category_router.put(
    "/categories/{category_id}", response=CategoryOut, auth=django_auth_is_staff
)
def update_category(request, category_id: UUID, payload: CategoryIn):
    category = get_object_or_404(Category, id=category_id)
    category.name = payload.name
    category.save()
    return serialize_category(category)


@category_router.delete("/categories/{category_id}", auth=django_auth_is_staff)
def delete_category(request, category_id: UUID):
    category = get_object_or_404(Category, id=category_id)
    category.delete()
    return {"detail": "Category deleted successfully."}


# ------------------------
# Tag Endpoints (with pagination)
# ------------------------
@tag_router.get("/tags", response=PaginatedTagResponse)
def list_tags(request, page: int = 1, page_size: int = 25):
    qs = Tag.objects.all()
    items, total_items, total_pages = paginate_queryset(qs, page, page_size)
    serialized_items = [serialize_tag(tag) for tag in items]
    pagination = {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "has_next_page": page < total_pages,
        "has_previous_page": page > 1,
        "next_page": page + 1 if page < total_pages else None,
        "previous_page": page - 1 if page > 1 else None,
    }
    return {"results": serialized_items, "pagination": pagination}


@tag_router.post("/tags", response=TagOut, auth=django_auth_is_staff)
def create_tag(request, payload: TagIn):
    tag = Tag.objects.create(name=payload.name)
    return serialize_tag(tag)


@tag_router.put("/tags/{tag_id}", response=TagOut, auth=django_auth_is_staff)
def update_tag(request, tag_id: UUID, payload: TagIn):
    tag = get_object_or_404(Tag, id=tag_id)
    tag.name = payload.name
    tag.save()
    return serialize_tag(tag)


@tag_router.delete("/tags/{tag_id}", auth=django_auth_is_staff)
def delete_tag(request, tag_id: UUID):
    tag = get_object_or_404(Tag, id=tag_id)
    tag.delete()
    return {"detail": "Tag deleted successfully."}


# ------------------------
# Gallery Endpoints (with pagination)
# ------------------------
@gallery_router.get("/gallery", response=PaginatedGalleryResponse)
def list_gallery(request, page: int = 1, page_size: int = 25):
    qs = GalleryImage.objects.all()
    items, total_items, total_pages = paginate_queryset(qs, page, page_size)
    serialized_items = [serialize_gallery_image(img) for img in items]
    pagination = {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "has_next_page": page < total_pages,
        "has_previous_page": page > 1,
        "next_page": page + 1 if page < total_pages else None,
        "previous_page": page - 1 if page > 1 else None,
    }
    return {"results": serialized_items, "pagination": pagination}


@gallery_router.post("/gallery", response=GalleryImageOut, auth=django_auth_is_staff)
def upload_image(request, payload: GalleryImageIn, file: File[UploadedFile]):
    image = GalleryImage.objects.create(
        image=file,
        alt_text=payload.alt_text,
        caption=payload.caption,
    )
    return serialize_gallery_image(request, image)


# ------------------------
# Author Endpoints (with pagination)
# ------------------------
@author_router.get("/authors", response=PaginatedAuthorResponse)
def list_authors(request, page: int = 1, page_size: int = 25):
    qs = Author.objects.all()
    items, total_items, total_pages = paginate_queryset(qs, page, page_size)
    results = []
    for author in items:
        results.append(
            {
                "id": author.id,
                "full_name": author.user.get_full_name(),
                "bio": author.bio,
                "instagram": author.instagram,
                "facebook": author.facebook,
                "x": author.x,
                "linkedin": author.linkedin,
                "github": author.github,
                "pinterest": author.pinterest,
                "threads": author.threads,
                "bluesky": author.bluesky,
                "youtube": author.youtube,
                "tiktok": author.tiktok,
            }
        )
    pagination = {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "has_next_page": page < total_pages,
        "has_previous_page": page > 1,
        "next_page": page + 1 if page < total_pages else None,
        "previous_page": page - 1 if page > 1 else None,
    }
    return {"results": results, "pagination": pagination}


@author_router.get("/authors/{author_id}", response=AuthorOut)
def get_author(request, author_id: UUID):
    author = get_object_or_404(Author, id=author_id)
    return {
        "id": author.id,
        "full_name": author.user.get_full_name(),
        "bio": author.bio,
        "instagram": author.instagram,
        "facebook": author.facebook,
        "x": author.x,
        "linkedin": author.linkedin,
        "github": author.github,
        "pinterest": author.pinterest,
        "threads": author.threads,
        "bluesky": author.bluesky,
        "youtube": author.youtube,
        "tiktok": author.tiktok,
    }


# Use our custom auth on updates for authors.
@author_router.put("/authors/{author_id}", response=AuthorOut, auth=django_auth_is_staff)
def update_author(request, author_id: UUID, payload: AuthorIn):
    author = get_object_or_404(Author, id=author_id)
    if payload.bio is not None:
        author.bio = payload.bio
    if payload.instagram is not None:
        author.instagram = payload.instagram
    if payload.facebook is not None:
        author.facebook = payload.facebook
    if payload.x is not None:
        author.x = payload.x
    if payload.linkedin is not None:
        author.linkedin = payload.linkedin
    if payload.github is not None:
        author.github = payload.github
    if payload.pinterest is not None:
        author.pinterest = payload.pinterest
    if payload.threads is not None:
        author.threads = payload.threads
    if payload.bluesky is not None:
        author.bluesky = payload.bluesky
    if payload.youtube is not None:
        author.youtube = payload.youtube
    if payload.tiktok is not None:
        author.tiktok = payload.tiktok

    author.save()
    return {
        "id": author.id,
        "full_name": author.user.get_full_name(),
        "bio": author.bio,
        "instagram": author.instagram,
        "facebook": author.facebook,
        "x": author.x,
        "linkedin": author.linkedin,
        "github": author.github,
        "pinterest": author.pinterest,
        "threads": author.threads,
        "bluesky": author.bluesky,
        "youtube": author.youtube,
        "tiktok": author.tiktok,
    }
