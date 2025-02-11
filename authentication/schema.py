# users/schema.py
from ninja import Schema

class LoginInput(Schema):
    email: str
    password: str

class LoginResponse(Schema):
    success: bool
    message: str

class ResetPasswordLoggedInInput(Schema):
    old_password: str
    new_password: str

class RequestPasswordResetInput(Schema):
    email: str

class RequestPasswordResetResponse(Schema):
    success: bool
    message: str

class ConfirmPasswordResetInput(Schema):
    uid: str
    token: str
    new_password: str

# users/schema.py
from ninja import Schema
from uuid import UUID

class LoginInput(Schema):
    email: str
    password: str

class LoginResponse(Schema):
    success: bool
    message: str

class ResetPasswordLoggedInInput(Schema):
    old_password: str
    new_password: str

class RequestPasswordResetInput(Schema):
    email: str

class RequestPasswordResetResponse(Schema):
    success: bool
    message: str

class ConfirmPasswordResetInput(Schema):
    uid: str
    token: str
    new_password: str

# New schema for the /auth/me endpoint:
class CurrentUserOut(Schema):
    id: UUID
    email: str
    first_name: str
    last_name: str
    is_staff: bool
    is_superuser: bool