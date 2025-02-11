import logging
from email.utils import formataddr

from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)

@shared_task(queue="email")
def send_reset_password_email(email: str, first_name: str, reset_password_link: str) -> None:
    logger.debug(f"Sending reset password email to {email}")

    subject = "Reset your password for FlipLytics"

    context = {
        "reset_link": reset_password_link,
        "first_name": first_name,
    }

    text_message = render_to_string("email/text/reset_password.txt", context)
    html_message = render_to_string("email/html/reset_password.html", context)
    from_email = formataddr((settings.DEFAULT_FROM_EMAIL_NAME, settings.DEFAULT_FROM_EMAIL))

    email_message = EmailMultiAlternatives(
        subject=subject,
        body=text_message,
        from_email=from_email,
        to=[email],
    )
    email_message.attach_alternative(html_message, "text/html")

    email_message.send()