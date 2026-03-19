import resend, os
from app.config import settings

resend.api_key = settings.RESEND_API_KEY

async def send_reset_email(to_email: str, reset_link: str):
    resend.Emails.send({
        "from":   settings.RESEND_API_KEY.split("_")[0] + "@resend.dev",
        "to":      [to_email],
        "subject": "Reset your password",
        "html": f"""
            <p>You requested a password reset.</p>
            <p><a href="{reset_link}">Click here to reset your password</a></p>
            <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        """,
    })