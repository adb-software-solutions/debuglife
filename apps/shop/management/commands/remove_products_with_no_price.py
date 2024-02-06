from typing import Any, Dict

from django.core.management.base import BaseCommand
from django.conf import settings

from apps.shop.models import AffiliateProduct

class Command(BaseCommand):
    def handle(self, *args: Any, **kwargs: Dict[str, Any]) -> None:
        for product in AffiliateProduct.all_objects.all():
            if product.product_price <=0 or product.previous_price <=0:
                product.delete()
                print(f"Deleted product {product.product_name} with no price.")