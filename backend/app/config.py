
import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY")
    S3_BUCKET: str = os.getenv("S3_BUCKET")
    S3_REGION_NAME: str = os.getenv("S3_REGION_NAME")
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY")
    
settings = Settings()
TOKEN_EXPIRE = settings.ACCESS_TOKEN_EXPIRE_MINUTES