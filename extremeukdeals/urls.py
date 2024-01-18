"""
URL configuration for extremeukdeals project.

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
from apps.shop.views import AffiliateProductRedirectView
from authentication.urls import urlpatterns as auth_urlpatterns
from extremeukdeals.routers import urlpatterns as api_urlpatterns

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
        "feeds/pinterest-board/<uuid:board_id>/", PinterestBoardFeed(), name="pinterest_board_feed"
    ),
    path(
        "shop/products/<uuid:product_id>/rd/",
        AffiliateProductRedirectView.as_view(),
        name="affiliate_product_redirect",
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
