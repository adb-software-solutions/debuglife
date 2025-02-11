from ninja import Router
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from ninja.security import django_auth  # Import the built-in Django auth

from authentication.schema import (
    LoginInput,
    LoginResponse,
    ResetPasswordLoggedInInput,
    RequestPasswordResetInput,
    RequestPasswordResetResponse,
    ConfirmPasswordResetInput,
    CurrentUserOut,
)
from authentication.tasks import send_reset_password_email

User = get_user_model()
auth_router = Router(tags=["Authentication"])

@auth_router.post("/login", response=LoginResponse)
def login_user(request, data: LoginInput):
    user = authenticate(request, email=data.email, password=data.password)
    if user is not None:
        login(request, user)
        return LoginResponse(success=True, message="Logged in successfully.")
    return LoginResponse(success=False, message="Invalid credentials.")

@auth_router.post("/logout", response=LoginResponse, auth=django_auth)
def logout_user(request):
    """
    Log out the current user. Requires the user to be authenticated.
    """
    logout(request)
    return LoginResponse(success=True, message="Logged out successfully.")

# Use django_auth so that Swagger (and runtime) enforce authentication.
@auth_router.post("/reset-password", response=LoginResponse, auth=django_auth)
def reset_password_logged_in(request, data: ResetPasswordLoggedInInput):
    """
    Reset the password for a logged-in user by verifying the old password.
    This endpoint now requires authentication.
    """
    user = request.user  # Guaranteed to be authenticated because of auth=django_auth
    if not user.check_password(data.old_password):
        return LoginResponse(success=False, message="Old password is incorrect.")
    
    user.set_password(data.new_password)
    user.save()
    return LoginResponse(success=True, message="Password reset successfully.")

@auth_router.post("/request-password-reset", response=RequestPasswordResetResponse)
def request_password_reset(request, data: RequestPasswordResetInput):
    try:
        user = User.objects.get(email=data.email)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
        send_reset_password_email.delay(data.email, user.first_name, reset_link)
    except User.DoesNotExist:
        # Always return success to avoid leaking user existence info.
        pass

    return RequestPasswordResetResponse(
        success=True,
        message="If that email exists, a reset link has been sent."
    )

@auth_router.post("/confirm-password-reset", response=RequestPasswordResetResponse)
def confirm_password_reset(request, data: ConfirmPasswordResetInput):
    try:
        uid_decoded = force_str(urlsafe_base64_decode(data.uid))
        user = User.objects.get(pk=uid_decoded)
        if default_token_generator.check_token(user, data.token):
            user.set_password(data.new_password)
            user.save()
            return RequestPasswordResetResponse(success=True, message="Password has been reset.")
        else:
            return RequestPasswordResetResponse(success=False, message="Invalid token or token expired.")
    except Exception:
        return RequestPasswordResetResponse(success=False, message="Error resetting password.")

@auth_router.get("/me", response=CurrentUserOut, auth=django_auth)
def get_current_user(request):
    """
    Return the current authenticated user's details.
    This endpoint requires authentication.
    """
    user = request.user
    return CurrentUserOut(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        is_staff=user.is_staff,
        is_superuser=user.is_superuser,
    )