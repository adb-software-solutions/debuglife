from rest_framework import mixins, viewsets


class CustomModelViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    http_method_names = ["get", "post", "put", "delete", "patch"]
    pass
