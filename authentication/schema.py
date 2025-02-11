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
