# scheme.py
from django.utils.translation import gettext_lazy as _
from drf_spectacular.extensions import OpenApiAuthenticationExtension
from drf_spectacular.plumbing import build_bearer_security_scheme_object
from knox.settings import knox_settings

class KnoxTokenScheme(OpenApiAuthenticationExtension):
    target_class = 'knox.auth.TokenAuthentication'
    name = 'knoxTokenAuth'

    def get_security_definition(self, auto_schema):        
        return build_bearer_security_scheme_object(
            header_name='Authorization',
            token_prefix=knox_settings.AUTH_HEADER_PREFIX,
        )