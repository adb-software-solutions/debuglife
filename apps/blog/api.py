# # blog/api.py
# from ninja import Router, Query
# from typing import List, Optional
# from django.shortcuts import get_object_or_404
# from uuid import UUID


# from apps.blog.models import Blog, Category, Tag, GalleryImage, Author
# from apps.blog.schema import (
#     AuthorOut, AuthorIn,
#     CategoryOut, CategoryIn,
#     TagOut, TagIn,
#     GalleryImageOut,
#     BlogOut, BlogIn,
# )

# post_router = Router(tags=["Post"])
# category_router = Router(tags=["Category"])
# tag_router = Router(tags=["Tag"])
# author_router = Router(tags=["Author"])
# gallery_router = Router(tags=["Gallery"])


# # ------------------------
# # Blog Endpoints
# # ------------------------
# @post_router.get("/blogs", response=List[BlogOut])
# def list_blogs(
#     request,
#     published: Optional[bool] = True,
#     category: Optional[UUID] = None,
#     author: Optional[UUID] = None,
#     # Tags can be provided multiple times in the query string: ?tags=1&tags=3
#     tags: Optional[List[UUID]] = Query(None)
# ):
#     qs = Blog.objects.all()
    
#     # Only allow unpublished blogs for staff or superusers.
#     if not (request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)):
#         qs = qs.filter(published=True)
#     else:
#         if published is not None:
#             qs = qs.filter(published=published)
    
#     if category is not None:
#         qs = qs.filter(category_id=category)
#     if author is not None:
#         qs = qs.filter(author_id=author)
#     if tags:
#         qs = qs.filter(tags__id__in=tags).distinct()
    
#     return qs

# @post_router.get("/blogs/{blog_id}", response=BlogOut)
# def get_blog(request, blog_id: UUID):
#     blog = get_object_or_404(Blog, id=blog_id)
#     return blog

# @post_router.post("/blogs", response=BlogOut, auth=staff_auth)
# def create_blog(request, payload: BlogIn):
#     category = get_object_or_404(Category, id=payload.category_id)
#     blog = Blog.objects.create(
#         title=payload.title,
#         excerpt=payload.excerpt,
#         content=payload.content,
#         category=category,
#         published=payload.published,
#     )
#     # Link the author if available.
#     if request.user.is_authenticated:
#         try:
#             blog.author = request.user.author_profile
#         except Author.DoesNotExist:
#             blog.author = None
#     blog.save()
#     if payload.tag_ids:
#         tags = Tag.objects.filter(id__in=payload.tag_ids)
#         blog.tags.set(tags)
#     return blog

# @post_router.put("/blogs/{blog_id}", response=BlogOut, auth=staff_auth)
# def update_blog(request, blog_id: UUID, payload: BlogIn):
#     blog = get_object_or_404(Blog, id=blog_id)
#     blog.title = payload.title
#     blog.excerpt = payload.excerpt
#     blog.content = payload.content
#     blog.published = payload.published
#     blog.category = get_object_or_404(Category, id=payload.category_id)
#     blog.save()
#     if payload.tag_ids:
#         tags = Tag.objects.filter(id__in=payload.tag_ids)
#         blog.tags.set(tags)
#     else:
#         blog.tags.clear()
#     return blog

# @post_router.delete("/blogs/{blog_id}", auth=staff_auth)
# def delete_blog(request, blog_id: UUID):
#     blog = get_object_or_404(Blog, id=blog_id)
#     blog.delete()
#     return {"detail": "Deleted successfully."}

# @post_router.get("/blogs/{blog_id}/related", response=List[BlogOut])
# def related_blogs(request, blog_id: UUID):
#     blog = get_object_or_404(Blog, id=blog_id)
#     return blog.get_related_posts()

# # Endpoints to filter blogs by Category or Tag
# @post_router.get("/blogs/by_category/{category_id}", response=List[BlogOut])
# def blogs_by_category(request, category_id: UUID):
#     return Blog.objects.filter(category_id=category_id)

# @post_router.get("/blogs/by_tag/{tag_id}", response=List[BlogOut])
# def blogs_by_tag(request, tag_id: UUID):
#     return Blog.objects.filter(tags__id=tag_id).distinct()

# # ------------------------
# # Category Endpoints
# # ------------------------
# @category_router.get("/categories", response=List[CategoryOut])
# def list_categories(request):
#     return Category.objects.all()

# @category_router.post("/categories", response=CategoryOut, auth=staff_auth)
# def create_category(request, payload: CategoryIn):
#     category = Category.objects.create(name=payload.name)
#     return category

# @category_router.put("/categories/{category_id}", response=CategoryOut, auth=staff_auth)
# def update_category(request, category_id: UUID, payload: CategoryIn):
#     category = get_object_or_404(Category, id=category_id)
#     category.name = payload.name
#     category.save()
#     return category

# @category_router.delete("/categories/{category_id}", auth=staff_auth)
# def delete_category(request, category_id: UUID):
#     category = get_object_or_404(Category, id=category_id)
#     category.delete()
#     return {"detail": "Category deleted successfully."}

# # ------------------------
# # Tag Endpoints
# # ------------------------
# @tag_router.get("/tags", response=List[TagOut])
# def list_tags(request):
#     return Tag.objects.all()

# @tag_router.post("/tags", response=TagOut, auth=staff_auth)
# def create_tag(request, payload: TagIn):
#     tag = Tag.objects.create(name=payload.name)
#     return tag

# @tag_router.put("/tags/{tag_id}", response=TagOut, auth=staff_auth)
# def update_tag(request, tag_id: UUID, payload: TagIn):
#     tag = get_object_or_404(Tag, id=tag_id)
#     tag.name = payload.name
#     tag.save()
#     return tag

# @tag_router.delete("/tags/{tag_id}", auth=staff_auth)
# def delete_tag(request, tag_id: UUID):
#     tag = get_object_or_404(Tag, id=tag_id)
#     tag.delete()
#     return {"detail": "Tag deleted successfully."}

# # ------------------------
# # Gallery Endpoints
# # ------------------------
# @gallery_router.post("/gallery", response=GalleryImageOut, auth=staff_auth)
# def upload_image(request):
#     if "file" not in request.FILES:
#         return {"detail": "No file uploaded."}
#     file = request.FILES["file"]
#     alt_text = request.POST.get("alt_text", "")
#     caption = request.POST.get("caption", None)
#     gallery_image = GalleryImage.objects.create(image=file, alt_text=alt_text, caption=caption)
#     return gallery_image

# @gallery_router.get("/gallery", response=List[GalleryImageOut])
# def list_gallery(request):
#     return GalleryImage.objects.all()

# # ------------------------
# # Author Endpoints
# # ------------------------
# @author_router.get("/authors", response=List[AuthorOut])
# def list_authors(request):
#     authors = Author.objects.all()
#     results = []
#     for author in authors:
#         results.append({
#             "id": author.id,
#             "username": author.user.username,
#             "full_name": author.user.get_full_name(),
#             "bio": author.bio,
#             "instagram": author.instagram,
#             "facebook": author.facebook,
#             "x": author.x,
#             "linkedin": author.linkedin,
#             "github": author.github,
#             "pinterest": author.pinterest,
#             "threads": author.threads,
#             "bluesky": author.bluesky,
#             "youtube": author.youtube,
#             "tiktok": author.tiktok,
#         })
#     return results

# @author_router.get("/authors/{author_id}", response=AuthorOut)
# def get_author(request, author_id: UUID):
#     author = get_object_or_404(Author, id=author_id)
#     return {
#          "id": author.id,
#          "username": author.user.username,
#          "full_name": author.user.get_full_name(),
#          "bio": author.bio,
#          "instagram": author.instagram,
#          "facebook": author.facebook,
#          "x": author.x,
#          "linkedin": author.linkedin,
#          "github": author.github,
#          "pinterest": author.pinterest,
#          "threads": author.threads,
#          "bluesky": author.bluesky,
#          "youtube": author.youtube,
#          "tiktok": author.tiktok,
#     }

# @author_router.put("/authors/{author_id}", response=AuthorOut, auth=staff_auth)
# def update_author(request, author_id: UUID, payload: AuthorIn):
#     author = get_object_or_404(Author, id=author_id)
#     if payload.bio is not None:
#          author.bio = payload.bio
#     # Update each social link field if provided
#     if payload.instagram is not None:
#          author.instagram = payload.instagram
#     if payload.facebook is not None:
#          author.facebook = payload.facebook
#     if payload.x is not None:
#          author.x = payload.x
#     if payload.linkedin is not None:
#          author.linkedin = payload.linkedin
#     if payload.github is not None:
#          author.github = payload.github
#     if payload.pinterest is not None:
#          author.pinterest = payload.pinterest
#     if payload.threads is not None:
#          author.threads = payload.threads
#     if payload.bluesky is not None:
#          author.bluesky = payload.bluesky
#     if payload.youtube is not None:
#          author.youtube = payload.youtube
#     if payload.tiktok is not None:
#          author.tiktok = payload.tiktok

#     author.save()
#     return {
#          "id": author.id,
#          "username": author.user.username,
#          "full_name": author.user.get_full_name(),
#          "bio": author.bio,
#          "instagram": author.instagram,
#          "facebook": author.facebook,
#          "x": author.x,
#          "linkedin": author.linkedin,
#          "github": author.github,
#          "pinterest": author.pinterest,
#          "threads": author.threads,
#          "bluesky": author.bluesky,
#          "youtube": author.youtube,
#          "tiktok": author.tiktok,
#     }
from ninja import Router, Query
from typing import List, Optional
from django.shortcuts import get_object_or_404
from uuid import UUID

from apps.blog.models import Blog, Category, Tag, GalleryImage, Author
from apps.blog.schema import (
    AuthorOut, AuthorIn,
    CategoryOut, CategoryIn,
    TagOut, TagIn,
    GalleryImageOut,
    BlogOut, BlogIn,
)
# Instead of importing a custom staff_auth from .auth, we now import our new one.
from authentication.ninja_auth import django_auth_superuser_or_staff

# Create separate routers for each section.
post_router = Router(tags=["Post"])
category_router = Router(tags=["Category"])
tag_router = Router(tags=["Tag"])
author_router = Router(tags=["Author"])
gallery_router = Router(tags=["Gallery"])

# ------------------------
# Blog Endpoints
# ------------------------
@post_router.get("/blogs", response=List[BlogOut])
def list_blogs(
    request,
    published: Optional[bool] = True,
    category: Optional[UUID] = None,
    author: Optional[UUID] = None,
    # Tags can be provided multiple times in the query string: ?tags=1&tags=3
    tags: Optional[List[UUID]] = Query(None)
):
    qs = Blog.objects.all()
    
    # Only allow unpublished blogs for staff or superusers.
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
    
    return qs

@post_router.get("/blogs/{blog_id}", response=BlogOut)
def get_blog(request, blog_id: UUID):
    blog = get_object_or_404(Blog, id=blog_id)
    return blog

@post_router.post("/blogs", response=BlogOut, auth=django_auth_superuser_or_staff)
def create_blog(request, payload: BlogIn):
    category = get_object_or_404(Category, id=payload.category_id)
    blog = Blog.objects.create(
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
    return blog

@post_router.put("/blogs/{blog_id}", response=BlogOut, auth=django_auth_superuser_or_staff)
def update_blog(request, blog_id: UUID, payload: BlogIn):
    blog = get_object_or_404(Blog, id=blog_id)
    blog.title = payload.title
    blog.excerpt = payload.excerpt
    blog.content = payload.content
    blog.published = payload.published
    blog.category = get_object_or_404(Category, id=payload.category_id)
    blog.save()
    if payload.tag_ids:
        tags = Tag.objects.filter(id__in=payload.tag_ids)
        blog.tags.set(tags)
    else:
        blog.tags.clear()
    return blog

@post_router.delete("/blogs/{blog_id}", auth=django_auth_superuser_or_staff)
def delete_blog(request, blog_id: UUID):
    blog = get_object_or_404(Blog, id=blog_id)
    blog.delete()
    return {"detail": "Deleted successfully."}

@post_router.get("/blogs/{blog_id}/related", response=List[BlogOut])
def related_blogs(request, blog_id: UUID):
    blog = get_object_or_404(Blog, id=blog_id)
    return blog.get_related_posts()

# Dedicated endpoints for filtering by category or tag
@post_router.get("/blogs/by_category/{category_id}", response=List[BlogOut])
def blogs_by_category(request, category_id: UUID):
    return Blog.objects.filter(category_id=category_id)

@post_router.get("/blogs/by_tag/{tag_id}", response=List[BlogOut])
def blogs_by_tag(request, tag_id: UUID):
    return Blog.objects.filter(tags__id=tag_id).distinct()

# ------------------------
# Category Endpoints
# ------------------------
@category_router.get("/categories", response=List[CategoryOut])
def list_categories(request):
    return Category.objects.all()

@category_router.post("/categories", response=CategoryOut, auth=django_auth_superuser_or_staff)
def create_category(request, payload: CategoryIn):
    category = Category.objects.create(name=payload.name)
    return category

@category_router.put("/categories/{category_id}", response=CategoryOut, auth=django_auth_superuser_or_staff)
def update_category(request, category_id: UUID, payload: CategoryIn):
    category = get_object_or_404(Category, id=category_id)
    category.name = payload.name
    category.save()
    return category

@category_router.delete("/categories/{category_id}", auth=django_auth_superuser_or_staff)
def delete_category(request, category_id: UUID):
    category = get_object_or_404(Category, id=category_id)
    category.delete()
    return {"detail": "Category deleted successfully."}

# ------------------------
# Tag Endpoints
# ------------------------
@tag_router.get("/tags", response=List[TagOut])
def list_tags(request):
    return Tag.objects.all()

@tag_router.post("/tags", response=TagOut, auth=django_auth_superuser_or_staff)
def create_tag(request, payload: TagIn):
    tag = Tag.objects.create(name=payload.name)
    return tag

@tag_router.put("/tags/{tag_id}", response=TagOut, auth=django_auth_superuser_or_staff)
def update_tag(request, tag_id: UUID, payload: TagIn):
    tag = get_object_or_404(Tag, id=tag_id)
    tag.name = payload.name
    tag.save()
    return tag

@tag_router.delete("/tags/{tag_id}", auth=django_auth_superuser_or_staff)
def delete_tag(request, tag_id: UUID):
    tag = get_object_or_404(Tag, id=tag_id)
    tag.delete()
    return {"detail": "Tag deleted successfully."}

# ------------------------
# Gallery Endpoints
# ------------------------
@gallery_router.post("/gallery", response=GalleryImageOut, auth=django_auth_superuser_or_staff)
def upload_image(request):
    if "file" not in request.FILES:
        return {"detail": "No file uploaded."}
    file = request.FILES["file"]
    alt_text = request.POST.get("alt_text", "")
    caption = request.POST.get("caption", None)
    gallery_image = GalleryImage.objects.create(image=file, alt_text=alt_text, caption=caption)
    return gallery_image

@gallery_router.get("/gallery", response=List[GalleryImageOut])
def list_gallery(request):
    return GalleryImage.objects.all()

# ------------------------
# Author Endpoints
# ------------------------
@author_router.get("/authors", response=List[AuthorOut])
def list_authors(request):
    authors = Author.objects.all()
    results = []
    for author in authors:
        results.append({
            "id": author.id,
            "username": author.user.username,
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
    return results

@author_router.get("/authors/{author_id}", response=AuthorOut)
def get_author(request, author_id: UUID):
    author = get_object_or_404(Author, id=author_id)
    return {
         "id": author.id,
         "username": author.user.username,
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

# Use our custom auth on updates.
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
         "username": author.user.username,
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
