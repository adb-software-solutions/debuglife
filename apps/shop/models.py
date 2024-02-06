import logging
import uuid
from io import BytesIO
from typing import Any
from uuid import UUID

import requests
from celery import shared_task
from django.conf import settings
from django.db import models
from django.db.models import F, ExpressionWrapper, DecimalField
from django.db.models.functions import Coalesce
from django.urls import reverse
from PIL import Image

logger = logging.getLogger(__name__)


@shared_task
def update_image_metadata_task(pinterest_pin_id: UUID) -> None:
    """Update the image metadata of the given Pinterest pin."""

    pinterest_pin = PinterestPin.objects.get(id=pinterest_pin_id)

    if pinterest_pin.pin_image:
        pinterest_pin.update_image_metadata()


class AffiliateProgram(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.program_name


class AffiliateCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    amazon_category_id = models.CharField(max_length=255, blank=True, null=True)
    category_name = models.CharField(max_length=255)
    category_description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.category_name
    
    def save(self, *args: Any, **kwargs: Any) -> None:
        """This method saves the affiliate category object to the database.

        Args:
            *args: This is a list of arguments.
            **kwargs: This is a list of keyword arguments.
        """
        super().save(*args, **kwargs)
        
        if PinterestBoard.objects.filter(category=self).exists():
            return
        else:
            PinterestBoard.objects.create(board_name=self.category_name, category=self)


class AffiliateProductManager(models.Manager):
    """This class manages the affiliate products. Only products that have a prices greater than 0 are returned.
       The drop in price should be at least 15% to be returned.

    Args:
        models (_type_): This is the models class.

    Returns:
        _type_: This returns the affiliate product manager.
    """

    def get_queryset(self) -> models.QuerySet:
        """This method gets the queryset of the affiliate products.
        """

        # Calculate the drop in price percentage
        price_drop_percentage = ExpressionWrapper(
            (Coalesce(F('previous_price'), F('product_price')) - F('product_price')) / 
            Coalesce(F('previous_price'), 1) * 100,
            output_field=DecimalField()
        )
        
        # Filter products with price greater than 0 and at least a 15% drop in price
        return super().get_queryset().annotate(
            price_drop=price_drop_percentage
        ).filter(
            product_price__gt=0,
            previous_price__gt=0,
            price_drop__gte=15
        )


class AffiliateProduct(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    amazon_product_id = models.CharField(max_length=255, blank=True, null=True)
    product_name = models.CharField(max_length=255)
    product_description = models.TextField(blank=True, null=True)
    product_image = models.URLField(blank=True, null=True)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    previous_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    amazon_category = models.ForeignKey(
        AffiliateCategory, on_delete=models.CASCADE, blank=True, null=True
    )
    affiliate_link = models.URLField(blank=True, null=True)
    affiliate_program = models.ForeignKey(AffiliateProgram, on_delete=models.CASCADE)
    pinterest_board = models.ForeignKey(
        "PinterestBoard", on_delete=models.CASCADE, blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = AffiliateProductManager()
    all_objects = models.Manager()

    def __str__(self) -> str:
        return self.product_name

    def save(self, *args: Any, **kwargs: Any) -> None:
        """This method saves the affiliate product object to the database.

        Args:
            *args: This is a list of arguments.
            **kwargs: This is a list of keyword arguments.
        """
        super().save(*args, **kwargs)

        if not self.affiliate_link:
            self.generate_affiliate_link()

    def get_redirect_url(self) -> str:
        """This method gets the redirect URL of the affiliate product.

        Returns:
            str: This returns the redirect URL of the affiliate product.
        """
        return settings.SITE_URL + reverse(
            "affiliate_product_redirect", kwargs={"product_id": self.id}
        )
    
    def generate_affiliate_link(self) -> None:
        """This method generates the amazon affiliate link for the product.
        """
        amazon_base_url = "https://www.amazon.co.uk/dp/"
        self.affiliate_link = f"{amazon_base_url}{self.amazon_product_id}?tag={settings.AMAZON_AFFILIATE_TAG}"
        print(f"Generated affiliate link for {self.product_name}")
        print(self.affiliate_link)
        self.save()

    class Meta:
        verbose_name = "Affiliate Product"
        verbose_name_plural = "Affiliate Products"
        ordering = ["-updated_at"]


class PinterestBoard(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    board_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    category = models.ForeignKey(AffiliateCategory, on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self) -> str:
        return self.board_name

    def build_feed_url(self) -> str:
        """This method builds the feed URL for the Pinterest board. It should include the domain name and the path to the feed, ideally dynamically"""

        return settings.SITE_URL + reverse("pinterest_board_feed", kwargs={"board_id": self.id})


class PinterestPin(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(AffiliateProduct, on_delete=models.CASCADE, blank=True, null=True)
    pin_name = models.CharField(max_length=100)
    pin_description = models.TextField()
    pin_image = models.URLField(blank=True, null=True)
    pin_price = models.DecimalField(max_digits=10, decimal_places=2)
    pin_link = models.URLField()
    pin_board = models.ForeignKey(PinterestBoard, on_delete=models.CASCADE)
    pin_image_size = models.PositiveIntegerField(null=True, blank=True)  # Store image size in bytes
    pin_image_mime_type = models.CharField(max_length=50, blank=True, null=True)  # Store MIME type

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.pin_name

    def update_image_metadata(self) -> None:
        if self.pin_image:
            try:
                response = requests.get(self.pin_image, stream=True)
                if response.status_code == 200:
                    image = Image.open(BytesIO(response.content))

                    assert image.format is not None

                    self.pin_image_size = len(response.content)
                    self.pin_image_mime_type = Image.MIME[image.format]  # Get MIME type from Pillow
                    self.save()

            except requests.RequestException as e:
                logging.error(e)
            except IOError as e:
                # Handle image loading exceptions
                logging.error(e)

    def save(self, *args: Any, **kwargs: Any) -> None:
        """This method saves the Pinterest pin object to the database.

        Args:
            *args: This is a list of arguments.
            **kwargs: This is a list of keyword arguments.
        """
        if self._state.adding or "pin_image" in kwargs:
            update_image_metadata_task.s(self.id).apply_async(countdown=10)

        super().save(*args, **kwargs)
