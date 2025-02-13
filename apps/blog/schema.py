# blog/schemas/types.py
from ninja import Schema
from typing import List, Optional, Dict
from uuid import UUID

class AuthorOut(Schema):
    id: UUID
    full_name: Optional[str] = None
    bio: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    x: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    pinterest: Optional[str] = None
    threads: Optional[str] = None
    bluesky: Optional[str] = None
    youtube: Optional[str] = None
    tiktok: Optional[str] = None

class AuthorIn(Schema):
    bio: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    x: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    pinterest: Optional[str] = None
    threads: Optional[str] = None
    bluesky: Optional[str] = None
    youtube: Optional[str] = None
    tiktok: Optional[str] = None

class CategoryOut(Schema):
    id: UUID
    name: str
    slug: str

class CategoryIn(Schema):
    name: str

class TagOut(Schema):
    id: UUID
    name: str
    slug: str

class TagIn(Schema):
    name: str


class GalleryImageIn(Schema):
    alt_text: str
    caption: Optional[str] = None


class BlogSEOAnalysisIn(Schema):
    seo_score: int
    seo_analysis: Optional[Dict] = None

class GalleryImageOut(Schema):
    id: UUID
    image: str  # URL to the image file
    alt_text: str
    caption: Optional[str] = None
    uploaded_at: str

class BlogOut(Schema):
    id: UUID
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    featured_image: Optional[str] = None
    published: bool
    created_at: str
    updated_at: str
    category: CategoryOut
    tags: List[TagOut] = []
    author: Optional[AuthorOut] = None

class BlogIn(Schema):
    title: str
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: str
    category_id: UUID
    author_id: Optional[UUID] = None
    tag_ids: List[UUID] = []
    published: bool = False

class BlogPatch(Schema):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    published: Optional[bool] = None
    category_id: Optional[UUID] = None
    tag_ids: Optional[List[UUID]] = None
    author_id: Optional[UUID] = None