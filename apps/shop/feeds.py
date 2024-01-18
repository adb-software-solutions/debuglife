from django.contrib.syndication.views import Feed
from django.utils.feedgenerator import Rss201rev2Feed
from django.urls import reverse
from .models import PinterestBoard, PinterestPin


class CustomRss201rev2Feed(Rss201rev2Feed):
    """Custom feed generator to include image tags with specific format."""
    content_type = 'application/xml; charset=utf-8'

    def add_item_elements(self, handler, item):
        """Add elements to each item (or entry) in the feed."""
        super(CustomRss201rev2Feed, self).add_item_elements(handler, item)


class PinterestBoardFeed(Feed):
    feed_type = CustomRss201rev2Feed  # Use the custom feed type

    def get_object(self, request, board_id):
        """Gets the Pinterest board object."""
        return PinterestBoard.objects.get(id=board_id)

    def title(self, obj: PinterestBoard):
        """Gets the title of the Pinterest board."""
        return obj.board_name

    def link(self, obj: PinterestBoard):
        """Gets the link of the Pinterest board."""
        return reverse("pinterest_board_feed", kwargs={"board_id": obj.id})

    def description(self, obj: PinterestBoard):
        """Gets the description of the Pinterest board."""
        return f"This feed contains the latest pins from the {obj.board_name} Pinterest board."

    def items(self, obj: PinterestBoard):
        """Gets the items of the Pinterest board."""
        return PinterestPin.objects.filter(pin_board=obj).order_by("-created_at")

    def item_title(self, item: PinterestPin):
        """Gets the title of the Pinterest pin."""
        return item.pin_name

    def item_description(self, item: PinterestPin):
        """Gets the description of the Pinterest pin."""
        return item.pin_description

    def item_link(self, item: PinterestPin):
        """Gets the link of the Pinterest pin."""
        return item.pin_link

    def item_enclosure_url(self, item: PinterestPin):
        """Gets the enclosure URL of the Pinterest pin."""
        return item.pin_image

    def item_enclosure_length(self, item: PinterestPin):
        """Gets the enclosure length of the Pinterest pin."""
        return item.pin_image_size

    def item_enclosure_mime_type(self, item: PinterestPin):
        """Gets the enclosure MIME type of the Pinterest pin."""
        return item.pin_image_mime_type
