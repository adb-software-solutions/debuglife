from django.apps import AppConfig


class ShopConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.shop"

    def ready(self) -> None:
        from apps.shop.scheme import KnoxTokenScheme as KnoxTokenScheme  # noqa
