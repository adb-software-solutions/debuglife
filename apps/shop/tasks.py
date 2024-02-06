from celery import shared_task

from apps.shop.models import AffiliateProduct, PinterestBoard, PinterestPin

@shared_task()
def create_pinterest_pins_task() -> None:
    """Create Pinterest pins for the affiliate products.
    """

    for product in AffiliateProduct.objects.all():
        if not PinterestPin.objects.filter(product=product).exists():
            if not PinterestBoard.objects.filter(category=product.amazon_category).exists():
                pinterest_board = PinterestBoard.objects.create(
                    board_name=product.amazon_category.category_name,
                    category=product.amazon_category,
                )
            else:
                pinterest_board = PinterestBoard.objects.get(category=product.amazon_category)
            PinterestPin.objects.create(
                pin_name=product.product_name,
                pin_description=product.product_description,
                pin_image=product.product_image,
                pin_price=product.product_price,
                pin_link=product.get_redirect_url(),
                pin_board=pinterest_board,
                product=product,
            )