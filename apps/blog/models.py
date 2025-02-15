# blog/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
import uuid

User = get_user_model()

class Author(models.Model):
    """
    An author profile linked to a Django User.
    Includes a bio, avatar, and native fields for social links.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='author_profile')
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='authors/avatars/', blank=True, null=True)
    
    # Native social link fields
    instagram = models.URLField(blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)
    x = models.URLField(blank=True, null=True)          # formerly known as Twitter, now "X"
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    pinterest = models.URLField(blank=True, null=True)
    threads = models.URLField(blank=True, null=True)
    bluesky = models.URLField(blank=True, null=True)
    youtube = models.URLField(blank=True, null=True)
    tiktok = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super(Category, self).save(*args, **kwargs)

    def __str__(self):
        return self.name

class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super(Tag, self).save(*args, **kwargs)

    def __str__(self):
        return self.name

class GalleryImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    image = models.ImageField(upload_to='gallery/')
    alt_text = models.CharField(max_length=255)
    caption = models.CharField(max_length=255, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.alt_text

class Blog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(Author, on_delete=models.SET_NULL, null=True, blank=True, related_name='blogs')
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True, max_length=100)
    excerpt = models.TextField(blank=True, null=True)
    content = models.TextField()  # Markdown content
    featured_image = models.ImageField(upload_to='blogs/featured/', blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='blogs')
    tags = models.ManyToManyField(Tag, related_name='blogs', blank=True)
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # New SEO fields:
    seo_score = models.IntegerField(default=0)
    seo_analysis = models.JSONField(blank=True, null=True)
    readability_score = models.IntegerField(default=0)
    readability_analysis = models.JSONField(blank=True, null=True)
    cornerstone_content = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super(Blog, self).save(*args, **kwargs)

    def __str__(self):
        return self.title

    def get_related_posts(self, limit=3):
        """
        Returns related posts based on shared tags or the same category.
        """
        related_by_tags = Blog.objects.filter(tags__in=self.tags.all()).exclude(id=self.id)
        related_by_category = Blog.objects.filter(category=self.category).exclude(id=self.id)
        qs = (related_by_tags | related_by_category).distinct()
        return qs.order_by('-created_at')[:limit]
