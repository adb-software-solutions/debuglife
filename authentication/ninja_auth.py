from ninja.security.apikey import APIKeyCookie
from typing import Any, Optional

from django.conf import settings
from django.http import HttpRequest

class SessionAuthSuperUserOrStaff(APIKeyCookie):
    "Reusing Django session authentication & verify that the user is a super user or staff"

    param_name: str = settings.SESSION_COOKIE_NAME

    def authenticate(self, request: HttpRequest, key: Optional[str]) -> Optional[Any]:
        is_superuser = getattr(request.user, "is_superuser", None)
        is_staff = getattr(request.user, "is_staff", None)
        if request.user.is_authenticated and (is_superuser or is_staff):
            return request.user

        return None
    
django_auth_superuser_or_staff = SessionAuthSuperUserOrStaff()