"""
URL configuration for epicbargainsanddeals project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from typing import List, Union

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import URLPattern, URLResolver, path
from django.urls.conf import include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from apps.shop.feeds import PinterestBoardFeed
from apps.shop.views import (
    AffiliateCategoryByAmazonID,
    AffiliateProductByAmazonID,
    AffiliateProductRedirectView,
)
from authentication.urls import urlpatterns as auth_urlpatterns
from epicbargainsanddeals.routers import urlpatterns as api_urlpatterns

URL = Union[URLPattern, URLResolver]
URLList = List[URL]

urlpatterns: URLList = [
    path("admin/", admin.site.urls),
    path("api/auth/", include(auth_urlpatterns)),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("api/", include(api_urlpatterns)),
    path(
        "api/shop/affiliate_categories/by_amazon_id/<str:amazon_category_id>/",
        AffiliateCategoryByAmazonID.as_view(),
        name="affiliate-category-by-amazon-id",
    ),
    path(
        "api/shop/affiliate_products/by_amazon_id/<str:amazon_product_id>/",
        AffiliateProductByAmazonID.as_view(),
        name="affiliate-product-by-amazon-id",
    ),

    path(
        "feeds/pinterest-board/<uuid:board_id>/", PinterestBoardFeed(), name="pinterest_board_feed"
    ),
    path(
        "shop/products/<uuid:product_id>/rd/",
        AffiliateProductRedirectView.as_view(),
        name="affiliate_product_redirect",
    ),
    path("jet/", include("jet.urls", "jet")),
    path("jet/dashboard/", include("jet.dashboard.urls", "jet-dashboard")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
