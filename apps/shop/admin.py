from django.contrib import admin

from .models import AffiliateProduct, AffiliateProgram, ProductCategory, ProductSubCategory


class ProductCategoryAdmin(admin.ModelAdmin[ProductCategory]):
    list_display = ("category_name",)
    ordering = ("category_name",)


class ProductSubCategoryAdmin(admin.ModelAdmin[ProductSubCategory]):
    list_display = ("sub_category_name", "product_category")
    ordering = ("sub_category_name",)


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
        "product_sub_category",
    )
    ordering = ("product_name", "product_price", "affiliate_program", "product_sub_category")
    sortable_by = ("product_name", "product_price", "affiliate_program", "product_sub_category")


admin.site.register(ProductCategory, ProductCategoryAdmin)
admin.site.register(ProductSubCategory, ProductSubCategoryAdmin)
admin.site.register(AffiliateProgram, AffiliateProgramAdmin)
admin.site.register(AffiliateProduct, AffiliateProductAdmin)
