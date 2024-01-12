from rest_framework import serializers

from apps.shop.models import AffiliateProduct, AffiliateProgram, ProductCategory, ProductSubCategory


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = "__all__"


class ProductSubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSubCategory
        fields = "__all__"


class AffiliateProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = AffiliateProgram
        fields = "__all__"


class AffiliateProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = AffiliateProduct
        fields = "__all__"
