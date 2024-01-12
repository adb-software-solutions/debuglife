# scheme.py
from typing import Any, Dict

from drf_spectacular.extensions import OpenApiAuthenticationExtension
from drf_spectacular.openapi import AutoSchema
from drf_spectacular.plumbing import build_bearer_security_scheme_object
from knox.settings import knox_settings


class KnoxTokenScheme(OpenApiAuthenticationExtension):
    target_class = "knox.auth.TokenAuthentication"
    name = "knoxTokenAuth"

    def get_security_definition(self, auto_schema: AutoSchema) -> Dict[str, Any]:
        return build_bearer_security_scheme_object(
            header_name="Authorization",
            token_prefix=knox_settings.AUTH_HEADER_PREFIX,
        )
