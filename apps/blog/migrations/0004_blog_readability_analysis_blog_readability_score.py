# Generated by Django 5.1.6 on 2025-02-15 03:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0003_blog_seo_analysis_blog_seo_score"),
    ]

    operations = [
        migrations.AddField(
            model_name="blog",
            name="readability_analysis",
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="blog",
            name="readability_score",
            field=models.IntegerField(default=0),
        ),
    ]
