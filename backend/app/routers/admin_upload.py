"""Admin file upload endpoint — ảnh món lên MinIO."""

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

router = APIRouter(prefix="/api/v1/admin/upload", tags=["Admin - Upload"])


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload ảnh món (JPG/PNG/WebP, max 5MB). Auto resize + convert WebP."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")
