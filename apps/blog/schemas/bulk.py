from uuid import UUID
from typing import List
from ninja import Schema

class BulkPostIDs(Schema):
    post_ids: List[UUID]

class BulkPostCategory(Schema):
    post_ids: List[UUID]
    category_id: UUID

class BulkPostTag(Schema):
    post_ids: List[UUID]
    tag_ids: List[UUID]