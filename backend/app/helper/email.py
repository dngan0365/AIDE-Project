import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings

async def send_reset_email(to_email: str, reset_link: str):
    message = MIMEMultipart("alternative")
    message["From"] = settings.MAIL_FROM
    message["To"] = to_email
    message["Subject"] = "Reset your password"
    message.attach(MIMEText(f"""
        <p>You requested a password reset.</p>
        <p><a href="{reset_link}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    """, "html"))

    await aiosmtplib.send(
        message,
        hostname=settings.MAIL_HOST,
        port=settings.MAIL_PORT,
        username=settings.MAIL_USERNAME,
        password=settings.MAIL_PASSWORD,
    )