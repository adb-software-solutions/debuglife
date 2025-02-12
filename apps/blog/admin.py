from django.contrib import admin
from unfold.admin import ModelAdmin

from apps.blog.models import Author, Category, Tag, Blog, GalleryImage


class AuthorAdmin(ModelAdmin[Author]):
    list_display = (
        "id",
        "get_full_name",
    )
    search_fields = (
        "user__first_name",
        "user__last_name",
        "user__email",
    )

    def get_full_name(self, obj: Author) -> str:
        return obj.user.get_full_name()
    
    get_full_name.short_description = "Full Name"


class CategoryAdmin(ModelAdmin[Category]):
    list_display = (
        "id",
        "name",
        "slug",
    )
    search_fields = (
        "name",
        "slug",
    )
    list_editable = (
        "name",
        "slug",
    )


class TagAdmin(ModelAdmin[Tag]):
    list_display = (
        "id",
        "name",
        "slug",
    )
    search_fields = (
        "name",
        "slug",
    )
    list_editable = (
        "name",
        "slug",
    )


class BlogAdmin(ModelAdmin[Blog]):
    list_display = (
        "id",
        "title",
        "slug",
        "author",
        "category",
        "published",
        "created_at",
        "updated_at",
    )
    search_fields = (
        "title",
        "slug",
        "author__user__first_name",
        "author__user__last_name",
        "category__name",
        "tags__name",
    )
    list_filter = (
        "published",
        "created_at",
        "updated_at",
        "category",
        "tags",
    )
    list_editable = (
        "title",
        "slug",
        "author",
        "category",
        "published",
    )


class GalleryImageAdmin(ModelAdmin[GalleryImage]):
    list_display = (
        "id",
        "image",
        "alt_text",
        "caption",
        "uploaded_at",
    )
    search_fields = (
        "alt_text",
        "caption",
    )
    list_filter = (
        "uploaded_at",
    )


admin.site.register(Author, AuthorAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(Blog, BlogAdmin)
admin.site.register(GalleryImage, GalleryImageAdmin)