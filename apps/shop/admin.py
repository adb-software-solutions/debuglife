from django.contrib import admin

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


class AffiliateProductAdmin(admin.ModelAdmin[AffiliateProduct]):
    list_display = (
        "product_name",
        "product_description",
        "product_image",
        "product_price",
        "affiliate_link",
        "affiliate_program",
    )
    ordering = ("product_name", "product_price", "affiliate_program")
    sortable_by = ("product_name", "product_price", "affiliate_program")


class AffiliateCategoryAdmin(admin.ModelAdmin[AffiliateCategory]):
    list_display = ("category_name", "amazon_category_id")
    ordering = ("category_name",)


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
