from django.http import Http404, HttpRequest
from django.views.generic import RedirectView
from drf_spectacular.utils import extend_schema
from rest_framework import filters
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.shop.models import AffiliateCategory, AffiliateProduct, AffiliateProgram, PinterestBoard
from apps.shop.serializers import (
    AffiliateCategorySerializer,
    AffiliateProductSerializer,
    AffiliateProgramSerializer,
    PinterestBoardFeedSerializer,
)
from utils.viewsets import CustomModelViewSet


class AffiliateProgramViewSet(CustomModelViewSet):
    queryset = AffiliateProgram.objects.all()
    serializer_class = AffiliateProgramSerializer
    permission_classes = [IsAuthenticated]


class AffiliateCategoryViewSet(CustomModelViewSet):
    queryset = AffiliateCategory.objects.all()
    serializer_class = AffiliateCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["category_name", "category_description", "amazon_category_id"]


class AffiliateProductViewSet(CustomModelViewSet):
    queryset = AffiliateProduct.objects.all()
    serializer_class = AffiliateProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["product_name", "product_description", "affiliate_link"]

    def get_queryset(self):
        queryset = super().get_queryset()
        affiliate_category_id = self.kwargs.get('affiliate_category_pk')
        if affiliate_category_id:
            queryset = queryset.filter(amazon_category_id=affiliate_category_id)
        return queryset


class AffiliateCategoryByAmazonID(APIView):
    """This class retrieves an affiliate category by its Amazon category ID.

    Args:
        APIView (_type_): This is the APIView class.
    """

    def get_object(self, amazon_category_id: str) -> AffiliateCategory:
        try:
            return AffiliateCategory.objects.get(amazon_category_id=amazon_category_id)
        except AffiliateCategory.DoesNotExist:
            raise Http404("No AffiliateCategory found with the specified amazon_category_id.")

    @extend_schema(
        responses={200: AffiliateCategorySerializer},
        summary="Retrieve AffiliateCategory by Amazon Category ID",
        description="Fetches an AffiliateCategory instance by its amazon_category_id.",
    )
    def get(self, request: HttpRequest, amazon_category_id: str) -> Response:
        affiliate_category = self.get_object(amazon_category_id)
        serializer = AffiliateCategorySerializer(affiliate_category)
        return Response(serializer.data)


class AffiliateProductByAmazonID(APIView):
    """This class retrieves an affiliate product by its Amazon product ID.

    Args:
        APIView (_type_): This is the APIView class.
    """

    def get_object(self, amazon_product_id: str) -> AffiliateProduct:
        try:
            return AffiliateProduct.objects.get(amazon_product_id=amazon_product_id)
        except AffiliateProduct.DoesNotExist:
            raise Http404("No AffiliateProduct found with the specified amazon_product_id.")

    @extend_schema(
        responses={200: AffiliateProductSerializer},
        summary="Retrieve AffiliateProduct by Amazon Product ID",
        description="Fetches an AffiliateProduct instance by its amazon_product_id.",
    )
    def get(self, request: HttpRequest, amazon_product_id: str) -> Response:
        affiliate_product = self.get_object(amazon_product_id)
        serializer = AffiliateProductSerializer(affiliate_product)
        return Response(serializer.data)


## Get a list of all the feeds created by the PinterestBoardFeed class.


class PinterestBoardViewSet(ReadOnlyModelViewSet):
    queryset = PinterestBoard.objects.all()
    serializer_class = PinterestBoardFeedSerializer

    def list(self, request: HttpRequest) -> Response:
        feed_urls = []
        for board in PinterestBoard.objects.all():
            feed_urls.append(
                {
                    "board_name": board.board_name,
                    "feed_url": board.build_feed_url(),
                }
            )

        serializer = PinterestBoardFeedSerializer(feed_urls, many=True)

        return Response(serializer.data)

    def retrieve(self, request: HttpRequest, id: str) -> Response:
        board = PinterestBoard.objects.get(id=id)
        feed_urls = {
            "board_name": board.board_name,
            "feed_url": board.build_feed_url(),
        }

        serializer = PinterestBoardFeedSerializer(feed_urls)

        return Response(serializer.data)


class AffiliateProductRedirectView(RedirectView):
    """This class redirects the user to the affiliate link of the product."""

    def get_redirect_url(self, *args: str, **kwargs: str) -> str:
        """This method gets the redirect URL of the affiliate product.

        Returns:
            str: This returns the redirect URL of the affiliate product.
        """
        product = AffiliateProduct.objects.get(id=kwargs["product_id"])
        return product.affiliate_link
