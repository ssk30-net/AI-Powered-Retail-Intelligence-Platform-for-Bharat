from fastapi import APIRouter, Depends, UploadFile, File
from app.core.security import get_current_user
from app.schemas.response import ApiResponse
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    upload_id = str(uuid.uuid4())
    
    return ApiResponse(
        success=True,
        data={
            "upload_id": upload_id,
            "filename": file.filename,
            "status": "processing",
            "message": "File uploaded successfully"
        }
    )

@router.get("/upload-status/{upload_id}")
async def get_upload_status(
    upload_id: str,
    current_user: dict = Depends(get_current_user)
):
    return ApiResponse(
        success=True,
        data={
            "upload_id": upload_id,
            "status": "completed",
            "rows_processed": 1500,
            "progress": 100
        }
    )
