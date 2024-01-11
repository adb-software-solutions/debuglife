from rest_framework.authentication import SessionAuthentication
from knox.views import LoginView as KnoxLoginView

class LoginView(KnoxLoginView):
    authentication_classes = [SessionAuthentication]