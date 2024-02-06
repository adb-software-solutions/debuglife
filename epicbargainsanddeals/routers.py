from django.urls import include, path
from rest_framework_nested.routers import SimpleRouter, NestedSimpleRouter

from apps.shop.views import (
    AffiliateCategoryViewSet,
    AffiliateProductViewSet,
    AffiliateProgramViewSet,
    PinterestBoardViewSet,
)

router = SimpleRouter()
router.register(r"shop/affiliate_programs", AffiliateProgramViewSet)
## Generates:
# GET /shop/affiliate_programs/ - list
# POST /shop/affiliate_programs/ - create
# GET /shop/affiliate_programs/<id>/ - retrieve
# PUT /shop/affiliate_programs/<id>/ - update

router.register(r"shop/affiliate_categories", AffiliateCategoryViewSet)
## Generates:
# GET /shop/affiliate_categories/ - list
# POST /shop/affiliate_categories/ - create
# GET /shop/affiliate_categories/<id>/ - retrieve
# PUT /shop/affiliate_categories/<id>/ - update


affiliate_categories_router = NestedSimpleRouter(router, r'shop/affiliate_categories', lookup='affiliate_category')
affiliate_categories_router.register(r'affiliate_products', AffiliateProductViewSet, basename='affiliate_category-products')
## Generates:
# GET /shop/affiliate_categories/{pk}/affiliate_products/ - list
# POST /shop/affiliate_categories/{pk}/affiliate_products/ - create
# GET /shop/affiliate_categories/{pk}/affiliate_products/{id}/ - retrieve
# PUT /shop/affiliate_categories/{pk}/affiliate_products/{id}/ - update


router.register(r"shop/affiliate_products", AffiliateProductViewSet)
## Generates:
# GET /shop/affiliate_products/ - list
# POST /shop/affiliate_products/ - create
# GET /shop/affiliate_products/<id>/ - retrieve
# PUT /shop/affiliate_products/<id>/ - update

router.register(r"feeds/pinterest_boards", PinterestBoardViewSet, basename="pinterest_boards")
## Generates:
# GET /feeds/pinterest_boards/ - list
# GET /feeds/pinterest_boards/<id>/ - retrieve


urlpatterns = [
    path("", include(router.urls)),
    path("", include(affiliate_categories_router.urls)),
]
