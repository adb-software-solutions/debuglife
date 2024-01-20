from knox.views import LoginView as KnoxLoginView, LogoutView as KnoxLogoutView, LogoutAllView as KnoxLogoutAllView

from rest_framework.authentication import SessionAuthentication

from knox.serializers import UserSerializer


class LoginView(KnoxLoginView):
    authentication_classes = [SessionAuthentication]
    serializer_class = UserSerializer