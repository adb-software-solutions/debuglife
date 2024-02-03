from rest_framework import serializers

from apps.shop.models import AffiliateProduct, AffiliateProgram, AffiliateCategory


class AffiliateProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = AffiliateProgram
        fields = "__all__"


class AffiliateProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = AffiliateProduct
        fields = "__all__"


class AffiliateCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AffiliateCategory
        fields = "__all__"


class PinterestBoardFeedSerializer(serializers.Serializer):
    board_name = serializers.CharField(read_only=True)
    feed_url = serializers.CharField(read_only=True)
