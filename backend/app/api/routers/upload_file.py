from fastapi import APIRouter, Depends, UploadFile, File
from fastapi import FastAPI, File, UploadFile, HTTPException
import boto3
import uuid
from app.config import settings

router = APIRouter(prefix="/upload", tags=["Upload"])

# Initialize S3 client
s3 = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.S3_REGION_NAME
)

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Generate unique filename
        file_ext = file.filename.split(".")[-1]
        key = f"image/{uuid.uuid4()}.{file_ext}"

        # Upload to S3
        s3.upload_fileobj(
            file.file,
            settings.S3_BUCKET,
            key,
            ExtraArgs={"ContentType": file.content_type}
        )

        # Generate URL
        file_url = f"https://{settings.S3_BUCKET}.s3.{settings.S3_REGION_NAME}.amazonaws.com/{key}"

        return {
            "filename": file.filename,
            "url": file_url
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/file")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Generate unique filename
        file_ext = file.filename.split(".")[-1]
        key = f"other/{uuid.uuid4()}.{file_ext}"

        # Upload to S3
        s3.upload_fileobj(
            file.file,
            settings.S3_BUCKET,
            key,
            ExtraArgs={"ContentType": file.content_type}
        )

        # Generate URL
        file_url = f"https://{settings.S3_BUCKET}.s3.{settings.S3_REGION}.amazonaws.com/{key}"

        return {
            "filename": file.filename,
            "url": file_url
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
