import logging
import uuid
from io import BytesIO
from typing import Any
from uuid import UUID

import requests
from celery import shared_task
from django.conf import settings
from django.db import models
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

        if self.pinterest_board:
            if not PinterestPin.objects.filter(
                pin_name=self.product_name, pin_board=self.pinterest_board
            ).exists():
                PinterestPin.objects.create(
                    pin_name=self.product_name,
                    pin_description=self.product_description,
                    pin_image=self.product_image,
                    pin_price=self.product_price,
                    pin_link=self.get_redirect_url(),
                    pin_board=self.pinterest_board,
                )
            else:
                pin = PinterestPin.objects.get(
                    pin_name=self.product_name, pin_board=self.pinterest_board
                )
                pin.pin_name = self.product_name
                pin.pin_description = self.product_description
                pin.pin_image = self.product_image
                pin.pin_price = self.product_price
                pin.pin_link = self.get_redirect_url()
                pin.pin_board = self.pinterest_board
                pin.save()

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
        ordering = ["-created_at", "-updated_at"]


class PinterestBoard(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    board_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
