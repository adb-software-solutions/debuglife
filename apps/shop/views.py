from django.http import HttpRequest
from django.views.generic import RedirectView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.shop.models import AffiliateProduct, AffiliateProgram, PinterestBoard
from apps.shop.serializers import (
    AffiliateProductSerializer,
    AffiliateProgramSerializer,
    PinterestBoardFeedSerializer,
)
from utils.viewsets import CustomModelViewSet


class AffiliateProgramViewSet(CustomModelViewSet):
    queryset = AffiliateProgram.objects.all()
    serializer_class = AffiliateProgramSerializer
    permission_classes = [IsAuthenticated]


class AffiliateProductViewSet(CustomModelViewSet):
    queryset = AffiliateProduct.objects.all()
    serializer_class = AffiliateProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


## Get a list of all the feeds created by the PinterestBoardFeed class.


class PinterestBoardViewSet(ReadOnlyModelViewSet):
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


class AffiliateProductRedirectView(RedirectView):
    """This class redirects the user to the affiliate link of the product."""

    def get_redirect_url(self, *args: str, **kwargs: str) -> str:
        """This method gets the redirect URL of the affiliate product.

        Returns:
            str: This returns the redirect URL of the affiliate product.
        """
        product = AffiliateProduct.objects.get(id=kwargs["product_id"])
        return product.affiliate_link
