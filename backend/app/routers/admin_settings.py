"""Admin settings endpoints — thông tin quán + ngân hàng."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.admin import SettingUpdate, SettingOut

router = APIRouter(prefix="/api/v1/admin/settings", tags=["Admin - Settings"])


@router.get("", response_model=SettingOut)
async def get_settings(db: AsyncSession = Depends(get_db)):
    """Đọc cấu hình quán."""
    return SettingOut()


@router.put("", response_model=SettingOut)
async def update_settings(data: SettingUpdate, db: AsyncSession = Depends(get_db)):
    """Cập nhật cấu hình quán."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")
