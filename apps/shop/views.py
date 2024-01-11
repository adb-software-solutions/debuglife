from django.shortcuts import render

from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from apps.shop.models import ProductCategory, ProductSubCategory, AffiliateProgram, AffiliateProduct
from apps.shop.serializers import ProductCategorySerializer, ProductSubCategorySerializer, AffiliateProgramSerializer, AffiliateProductSerializer
from utils.viewsets import CustomModelViewSet


class ProductCategoryViewSet(CustomModelViewSet):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ProductSubCategoryViewSet(CustomModelViewSet):
    def get_queryset(self):
        return ProductSubCategory.objects.filter(product_category=self.kwargs["product_category_pk"])
    serializer_class = ProductSubCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class AffiliateProgramViewSet(CustomModelViewSet):
    queryset = AffiliateProgram.objects.all()
    serializer_class = AffiliateProgramSerializer
    permission_classes = [IsAuthenticated]

class AffiliateProductSubCategoryViewSet(CustomModelViewSet):
    def get_queryset(self):
        return AffiliateProduct.objects.filter(product_sub_category=self.kwargs["product_sub_category_pk"])
    http_method_names = ["get", "post"]
    serializer_class = AffiliateProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class AffiliateProductViewSet(CustomModelViewSet):
    queryset = AffiliateProduct.objects.all()
    serializer_class = AffiliateProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]