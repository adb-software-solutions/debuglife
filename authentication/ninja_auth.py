from ninja.security import SessionAuthSuperUser
from typing import Any, Optional

from django.conf import settings
from django.http import HttpRequest

class SessionAuthIsStaff(SessionAuthSuperUser):
    
    def authenticate(self, request: HttpRequest, key: Optional[str]) -> Optional[Any]:
        result = super().authenticate(request, key)
        if result:
              return result
        if getattr(request.user, "is_staff", None):
            return request.user

        return None

django_auth_is_staff = SessionAuthIsStaff()