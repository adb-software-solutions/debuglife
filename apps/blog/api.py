from ninja import Router, Query, Schema
from typing import List, Optional
from django.shortcuts import get_object_or_404
from uuid import UUID
from datetime import datetime
import logging
from django.utils.text import slugify

from apps.blog.models import Blog, Category, Tag, GalleryImage, Author
from apps.blog.schema import (
    AuthorOut, AuthorIn,
    CategoryOut, CategoryIn,
    TagOut, TagIn,
    GalleryImageOut,
    BlogOut, BlogIn, BlogPatch,
)
from authentication.ninja_auth import django_auth_superuser_or_staff

logger = logging.getLogger(__name__)

# Create separate routers for each section.
post_router = Router(tags=["Post"])
category_router = Router(tags=["Category"])
tag_router = Router(tags=["Tag"])
author_router = Router(tags=["Author"])
gallery_router = Router(tags=["Gallery"])

# ------------------------
# Pagination Schemas
# ------------------------
class Pagination(Schema):
    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next_page: bool
    has_previous_page: bool
    next_page: Optional[int] = None
    previous_page: Optional[int] = None

class PaginatedBlogResponse(Schema):
    results: List[BlogOut]
    pagination: Pagination

class PaginatedCategoryResponse(Schema):
    results: List[CategoryOut]
    pagination: Pagination

class PaginatedTagResponse(Schema):
    results: List[TagOut]
    pagination: Pagination

class PaginatedGalleryResponse(Schema):
    results: List[GalleryImageOut]
    pagination: Pagination

class PaginatedAuthorResponse(Schema):
    results: List[AuthorOut]
    pagination: Pagination

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
    # Here we extract fields from the related user.
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

def serialize_gallery_image(image: GalleryImage) -> dict:
    return {
        "id": image.id,
        "image": image.image.url if image.image else None,
        "alt_text": image.alt_text,
        "caption": image.caption,
        "uploaded_at": image.uploaded_at.isoformat() if image.uploaded_at else None,
    }

def serialize_blog(blog: Blog) -> dict:
    return {
        "id": blog.id,
        "title": blog.title,
        "slug": blog.slug,
        "excerpt": blog.excerpt,
        "content": blog.content,
        "featured_image": blog.featured_image.url if blog.featured_image else None,
        "published": blog.published,
        "created_at": blog.created_at.isoformat() if blog.created_at else None,
        "updated_at": blog.updated_at.isoformat() if blog.updated_at else None,
        "category": serialize_category(blog.category) if blog.category else None,
        "tags": [serialize_tag(tag) for tag in blog.tags.all()],
        "author": serialize_author(blog.author) if blog.author else None,
    }

# ------------------------
# Blog Endpoints (with pagination, filtering, and sorting)
# ------------------------
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
    sort_by: Optional[str] = "title",  # New: field to sort by
    order: Optional[str] = "asc",      # New: "asc" or "desc"
):
    logger.info(f"Fetched blogs with filters: published={published}, category={category}, author={author}, tags={tags}")
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
    
    # --- Sorting ---
    # Define allowed sort fields for security.
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
    serialized_items = [serialize_blog(item) for item in items]
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

@post_router.get("/posts/{post_id}", response=BlogOut)
def get_blog(request, post_id: UUID):
    blog = get_object_or_404(Blog, id=post_id)
    return serialize_blog(blog)

@post_router.post("/posts", response=BlogOut, auth=django_auth_superuser_or_staff)
def create_blog(request, payload: BlogIn):
    category = get_object_or_404(Category, id=payload.category_id)
    if payload.slug:
        blog = Blog.objects.filter(slug=payload.slug).first()
        if blog:
            return {"detail": "A blog with this slug already exists."}    
    else:
        payload.slug = slugify(payload.title)
    blog = Blog.objects.create(
        slug=payload.slug,
        title=payload.title,
        excerpt=payload.excerpt,
        content=payload.content,
        category=category,
        published=payload.published,
    )
    # Link the author if available.
    if request.user.is_authenticated:
        try:
            blog.author = request.user.author_profile
        except Author.DoesNotExist:
            blog.author = None
    blog.save()
    if payload.tag_ids:
        tags = Tag.objects.filter(id__in=payload.tag_ids)
        blog.tags.set(tags)
    return serialize_blog(blog)

@post_router.put("/posts/{post_id}", response=BlogOut, auth=django_auth_superuser_or_staff)
def update_blog(request, post_id: UUID, payload: BlogIn):
    logger.info(f"Blog Payload: {payload}")

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
    blog.category = get_object_or_404(Category, id=payload.category_id)
    blog.author = get_object_or_404(Author, id=payload.author_id) if payload.author_id else None
    blog.save()
    if payload.tag_ids:
        tags = Tag.objects.filter(id__in=payload.tag_ids)
        blog.tags.set(tags)
    else:
        blog.tags.clear()
    return serialize_blog(blog)

@post_router.patch("/posts/{post_id}", response=BlogOut, auth=django_auth_superuser_or_staff)
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
    return serialize_blog(blog)

@post_router.delete("/posts/{post_id}", auth=django_auth_superuser_or_staff)
def delete_blog(request, post_id: UUID):
    blog = get_object_or_404(Blog, id=post_id)
    blog.delete()
    return {"detail": "Deleted successfully."}

@post_router.get("/posts/{post_id}/related", response=List[BlogOut])
def related_blogs(request, post_id: UUID):
    blog = get_object_or_404(Blog, id=post_id)
    related = blog.get_related_posts()
    return [serialize_blog(item) for item in related]

# Dedicated endpoints for filtering by category or tag (with pagination)
@post_router.get("/posts/by_category/{category_id}", response=PaginatedBlogResponse)
def blogs_by_category(request, category_id: UUID, page: int = 1, page_size: int = 25):
    qs = Blog.objects.filter(category_id=category_id)
    items, total_items, total_pages = paginate_queryset(qs, page, page_size)
    serialized_items = [serialize_blog(item) for item in items]
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
    serialized_items = [serialize_blog(item) for item in items]
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

@category_router.post("/categories", response=CategoryOut, auth=django_auth_superuser_or_staff)
def create_category(request, payload: CategoryIn):
    category = Category.objects.create(name=payload.name)
    return serialize_category(category)

@category_router.put("/categories/{category_id}", response=CategoryOut, auth=django_auth_superuser_or_staff)
def update_category(request, category_id: UUID, payload: CategoryIn):
    category = get_object_or_404(Category, id=category_id)
    category.name = payload.name
    category.save()
    return serialize_category(category)

@category_router.delete("/categories/{category_id}", auth=django_auth_superuser_or_staff)
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

@tag_router.post("/tags", response=TagOut, auth=django_auth_superuser_or_staff)
def create_tag(request, payload: TagIn):
    tag = Tag.objects.create(name=payload.name)
    return serialize_tag(tag)

@tag_router.put("/tags/{tag_id}", response=TagOut, auth=django_auth_superuser_or_staff)
def update_tag(request, tag_id: UUID, payload: TagIn):
    tag = get_object_or_404(Tag, id=tag_id)
    tag.name = payload.name
    tag.save()
    return serialize_tag(tag)

@tag_router.delete("/tags/{tag_id}", auth=django_auth_superuser_or_staff)
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

@gallery_router.post("/gallery", response=GalleryImageOut, auth=django_auth_superuser_or_staff)
def upload_image(request):
    if "file" not in request.FILES:
        return {"detail": "No file uploaded."}
    file = request.FILES["file"]
    alt_text = request.POST.get("alt_text", "")
    caption = request.POST.get("caption", None)
    gallery_image = GalleryImage.objects.create(image=file, alt_text=alt_text, caption=caption)
    return serialize_gallery_image(gallery_image)

# ------------------------
# Author Endpoints (with pagination)
# ------------------------
@author_router.get("/authors", response=PaginatedAuthorResponse)
def list_authors(request, page: int = 1, page_size: int = 25):
    qs = Author.objects.all()
    items, total_items, total_pages = paginate_queryset(qs, page, page_size)
    results = []
    for author in items:
        results.append({
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
        })
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
@author_router.put("/authors/{author_id}", response=AuthorOut, auth=django_auth_superuser_or_staff)
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
