from typing import Any, Dict

from django.core.management.base import BaseCommand
from django.conf import settings

from apps.shop.models import AffiliateProduct

class Command(BaseCommand):
    def handle(self, *args: Any, **kwargs: Dict[str, Any]) -> None:
        for product in AffiliateProduct.objects.all():
            product.save()
            print(f"Updated affiliate link for {product.product_name}")