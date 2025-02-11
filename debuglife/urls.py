# debuglife/urls.py
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from ninja import NinjaAPI, Router
from apps.blog.api import post_router as post_router
from apps.blog.api import category_router as category_router
from apps.blog.api import tag_router as tag_router
from apps.blog.api import author_router as author_router
from apps.blog.api import gallery_router as gallery_router
from authentication.api import auth_router as auth_router

api = NinjaAPI(
    title="DebugLife Blog API",
    version="1.0",
    description="API for the DebugLife Blog",
)

blog_router = Router(tags=["Blog"])
blog_router.add_router("/auth", auth_router)
blog_router.add_router("/posts", post_router)
blog_router.add_router("/categories", category_router)
blog_router.add_router("/tags", tag_router)
blog_router.add_router("/authors", author_router)
blog_router.add_router("/gallery", gallery_router)

api.add_router("/blog", blog_router)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
