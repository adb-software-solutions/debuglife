from django.db import models
import uuid

class ProductCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category_name = models.CharField(max_length=255)

    def __str__(self) -> str:
        return self.category_name

class ProductSubCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sub_category_name = models.CharField(max_length=255)
    product_category = models.ForeignKey(ProductCategory, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return self.sub_category_name

class AffiliateProgram(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program_name = models.CharField(max_length=255)

    def __str__(self) -> str:
        return self.program_name

class AffiliateProduct(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product_name = models.CharField(max_length=255)
    product_description = models.TextField()
    product_image = models.URLField(blank=True, null=True)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    affiliate_link = models.URLField()
    affiliate_program = models.ForeignKey(AffiliateProgram, on_delete=models.CASCADE)
    product_sub_category = models.ForeignKey(ProductSubCategory, on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self) -> str:
        return self.product_name
