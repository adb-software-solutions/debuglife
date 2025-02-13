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
from apps.blog.apis.seo import seo_nlp_router as seo_nlp_router
from authentication.api import auth_router as auth_router
from pydantic import ValidationError
import logging

logger = logging.getLogger(__name__)

api = NinjaAPI(
    title="DebugLife Blog API",
    version="1.0",
    description="API for the DebugLife Blog",
)

@api.exception_handler(ValidationError)
def custom_validation_errors(request, exc):
    # Log detailed information
    logger.info(f"Validation error on {request.method} {request.path}")
    logger.info(f"Request body: {request.body.decode('utf-8')}")
    logger.info(f"Validation errors: {exc.errors}")

    # Return the standard 422 response
    return api.create_response(
        request,
        {"detail": exc.errors},
        status=422,
    )


blog_router = Router(tags=["Blog"])
blog_router.add_router("/", post_router)
blog_router.add_router("/", category_router)
blog_router.add_router("/", tag_router)
blog_router.add_router("/", author_router)
blog_router.add_router("/", gallery_router)
blog_router.add_router("/", seo_nlp_router)

api.add_router("/blog", blog_router)
api.add_router("/auth", auth_router)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
