from knox.views import LoginView as KnoxLoginView
from rest_framework.authentication import SessionAuthentication


class LoginView(KnoxLoginView):
    authentication_classes = [SessionAuthentication]
