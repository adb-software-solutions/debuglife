# users/schema.py
from ninja import Schema
from typing import Optional
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

# Schema for Author details (if available)
class AuthorOut(Schema):
    avatar: Optional[str] = None  # URL of the avatar image
    bio: Optional[str] = None

# Schema for current user output including author details
class CurrentUserOut(Schema):
    id: UUID
    email: str
    first_name: str
    last_name: str
    is_staff: bool
    author: Optional[AuthorOut] = None

# Wrapper schema so the endpoint always returns a 200 response.
class CurrentUserResponse(Schema):
    user: Optional[CurrentUserOut] = None
