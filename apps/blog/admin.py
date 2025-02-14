from django.contrib import admin
from django.contrib.admin.helpers import ACTION_CHECKBOX_NAME
from django.db import transaction
from unfold.admin import ModelAdmin
from django.template.response import TemplateResponse
from django.shortcuts import redirect

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

from django import forms

class DuplicateBlogForm(forms.Form):
    _selected_action = forms.CharField(widget=forms.MultipleHiddenInput)
    duplicates = forms.IntegerField(
        min_value=1,
        initial=1,
        label="Number of duplicates per blog",
        help_text="Enter how many copies to create for each selected blog.",
        widget=forms.NumberInput(attrs={
            'class': 'input input-bordered w-32 px-3 py-2 rounded dark:bg-base-800 dark:text-white',
            'placeholder': 'e.g., 2'
        })
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
    actions = ['duplicate_blog']

    @transaction.atomic
    def duplicate_blog(self, request, queryset):
        if 'apply' in request.POST:
            form = DuplicateBlogForm(request.POST)
            if form.is_valid():
                duplicates = form.cleaned_data['duplicates']
                for blog in queryset:
                    original_slug = blog.slug
                    original_title = blog.title
                    for _ in range(duplicates):
                        # Generate unique slug
                        new_slug = original_slug
                        counter = 1
                        while self.model.objects.filter(slug=new_slug).exists():
                            new_slug = f"{original_slug}-{counter}"
                            counter += 1
                        # Generate unique title
                        new_title = original_title
                        counter = 1
                        while self.model.objects.filter(title=new_title).exists():
                            new_title = f"{original_title} {counter}"
                            counter += 1
                        # Duplicate blog instance
                        blog.pk = None  # Reset primary key to create new instance
                        blog.slug = new_slug
                        blog.title = new_title
                        blog.save()
                self.message_user(request, "Selected blog(s) duplicated successfully.")
                return redirect(request.get_full_path())
        else:
            form = DuplicateBlogForm(initial={
                '_selected_action': request.POST.getlist(ACTION_CHECKBOX_NAME)
            })

        context = {
            'blogs': queryset,
            'form': form,
            'title': "Duplicate Blogs",
            'action_checkbox_name': ACTION_CHECKBOX_NAME,
            'opts': self.model._meta,
            'media': self.media,
            **self.admin_site.each_context(request),
        }
        return TemplateResponse(request, "admin/duplicate_blog.html", context)

    duplicate_blog.short_description = "Duplicate selected blogs with incremented slug and title"




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