from typing import Any
from django.contrib import admin
from django.db.models.query import QuerySet
from django.http.request import HttpRequest

from .models import (
    AffiliateCategory,
    AffiliateProduct,
    AffiliateProgram,
    PinterestBoard,
    PinterestPin,
)


class AffiliateProgramAdmin(admin.ModelAdmin[AffiliateProgram]):
    list_display = ("program_name",)
    ordering = ("program_name",)
    search_fields = ("program_name",)


class AffiliateProductAdmin(admin.ModelAdmin[AffiliateProduct]):
    def get_queryset(self, request: HttpRequest) -> QuerySet[Any]:
        qs = self.model.all_objects.get_queryset()
        ordering = self.ordering or ()
        if ordering:
            qs = qs.order_by(*ordering)
        return qs

    list_display = (
        "product_name",
        "product_price",
        "previous_price",
        "amazon_category",
        "affiliate_program",
        "affiliate_link",
        "product_image",
        "updated_at",
    )
    ordering = ("-updated_at",)
    list_filter = ("affiliate_program", "amazon_category", "updated_at", "previous_price", "product_price")
    search_fields = ("product_name", "product_description", "affiliate_link", "amazon_product_id")


class AffiliateCategoryAdmin(admin.ModelAdmin[AffiliateCategory]):
    list_display = ("category_name", "amazon_category_id")
    ordering = ("category_name",)
    search_fields = ("category_name", "amazon_category_id")


class PinterestBoardAdmin(admin.ModelAdmin[PinterestBoard]):
    list_display = ("board_name", "id")
    ordering = ("board_name",)


class PinterestPinAdmin(admin.ModelAdmin[PinterestPin]):
    list_display = (
        "pin_name",
        "pin_description",
        "pin_image",
        "pin_price",
        "pin_link",
        "pin_board",
    )
    ordering = ("pin_name", "pin_price", "pin_board")
    sortable_by = ("pin_name", "pin_price", "pin_board")


admin.site.register(AffiliateProgram, AffiliateProgramAdmin)
admin.site.register(AffiliateProduct, AffiliateProductAdmin)
admin.site.register(AffiliateCategory, AffiliateCategoryAdmin)
admin.site.register(PinterestBoard, PinterestBoardAdmin)
admin.site.register(PinterestPin, PinterestPinAdmin)
