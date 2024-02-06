from typing import Any, Dict

from django.core.management.base import BaseCommand
from django.conf import settings

from apps.shop.models import AffiliateProduct, AffiliateProgram, AffiliateCategory

class Command(BaseCommand):
    """This command is used to generate fake products for testing purposes.

    Args:
        BaseCommand (_type_): Django's BaseCommand class
    """
    def handle(self, *args: Any, **kwargs: Dict[str, Any]) -> None:
        """This function is called when the command is run. It generates fake products for testing purposes.

        Args:
            *args (Any): Any positional arguments
            **kwargs (Dict[str, Any]): Any keyword arguments
        """
        # Create a new affiliate program
        affiliate_program = AffiliateProgram.objects.create(
            program_name="Amazon",
        )

        # Create a new affiliate category
        affiliate_category = AffiliateCategory.objects.create(
            category_name="Electronics",
            amazon_category_id="test-category-id"
        )

        for i in range(1, 300):
            # Create a new affiliate product
            AffiliateProduct.objects.create(
                product_name=f"Test Product {i}",
                affiliate_link=f"https://www.amazon.com/dp/test-product-id-{i}?tag=testid-21",
                product_price=20.00,
                previous_price=50.00,
                amazon_category=affiliate_category,
                affiliate_program=affiliate_program,
                amazon_product_id=f"test-product-id-{i}",
                product_image="https://m.media-amazon.com/images/I/71dsco3pONL.__AC_SX300_SY300_QL70_ML2_.jpg"
            )
        
        print("Generated 300 fake products for testing purposes.")