from django.urls import include, path
from rest_framework_nested.routers import NestedSimpleRouter, SimpleRouter

from apps.shop.views import (
    AffiliateProductSubCategoryViewSet,
    AffiliateProductViewSet,
    AffiliateProgramViewSet,
    ProductCategoryViewSet,
    ProductSubCategoryViewSet,
)

router = SimpleRouter()
router.register(r"shop/product_categories", ProductCategoryViewSet, basename="product_categories")
## Generates:
# GET /shop/product_categories/ - list
# POST /shop/product_categories/ - create
# GET /shop/product_categories/<id>/ - retrieve
# PUT /shop/product_categories/<id>/ - update

product_categories_router = NestedSimpleRouter(
    router, r"shop/product_categories", lookup="product_category"
)
product_categories_router.register(
    r"product_sub_categories",
    ProductSubCategoryViewSet,
    basename="product_category-product_sub_categories",
)
## Generates:
# GET /shop/product_categories/<product_category_id>/product_sub_categories/ - list
# POST /shop/product_categories/<product_category_id>/product_sub_categories/ - create
# GET /shop/product_categories/<product_category_id>/product_sub_categories/<id>/ - retrieve
# PUT /shop/product_categories/<product_category_id>/product_sub_categories/<id>/ - update

product_sub_categories_router = NestedSimpleRouter(
    product_categories_router, r"product_sub_categories", lookup="product_sub_category"
)
product_sub_categories_router.register(
    r"affiliate_products",
    AffiliateProductSubCategoryViewSet,
    basename="product_category-product_sub_category-affiliate_products",
)
## Generates:
# GET /shop/product_categories/<product_category_id>/product_sub_categories/<product_sub_category_id>/affiliate_products/ - list
# POST /shop/product_categories/<product_category_id>/product_sub_categories/<product_sub_category_id>/affiliate_products/ - create
# GET /shop/product_categories/<product_category_id>/product_sub_categories/<product_sub_category_id>/affiliate_products/<id>/ - retrieve
# PUT /shop/product_categories/<product_category_id>/product_sub_categories/<product_sub_category_id>/affiliate_products/<id>/ - update

router.register(r"shop/affiliate_programs", AffiliateProgramViewSet)
## Generates:
# GET /shop/affiliate_programs/ - list
# POST /shop/affiliate_programs/ - create
# GET /shop/affiliate_programs/<id>/ - retrieve
# PUT /shop/affiliate_programs/<id>/ - update

router.register(r"shop/affiliate_products", AffiliateProductViewSet)
## Generates:
# GET /shop/affiliate_products/ - list
# POST /shop/affiliate_products/ - create
# GET /shop/affiliate_products/<id>/ - retrieve
# PUT /shop/affiliate_products/<id>/ - update


urlpatterns = [
    path("", include(router.urls)),
    path("", include(product_categories_router.urls)),
    path("", include(product_sub_categories_router.urls)),
]
