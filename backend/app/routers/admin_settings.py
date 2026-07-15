"""Admin settings endpoint — key/value store."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.setting import Setting
from app.schemas.admin import SettingUpdate, SettingOut
from app.routers.admin_auth import get_current_admin

router = APIRouter(prefix="/api/v1/admin/settings", tags=["Admin - Settings"])

SETTING_KEYS = [
    "shop_name", "shop_phone", "shop_address",
    "bank_name", "bank_bin", "bank_account_no", "bank_account_name", "bank_branch",
]


async def _load_settings(db: AsyncSession) -> dict:
    result = await db.execute(select(Setting).where(Setting.key.in_(SETTING_KEYS)))
    return {s.key: s.value for s in result.scalars().all()}


@router.get("", response_model=SettingOut)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    data = await _load_settings(db)
    return SettingOut(**{k: data.get(k, "") for k in SETTING_KEYS})


@router.put("")
async def update_settings(
    updates: SettingUpdate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    payload = updates.model_dump(exclude_none=True)
    existing = await _load_settings(db)

    for key, value in payload.items():
        if key in existing:
            # Update
            result = await db.execute(select(Setting).where(Setting.key == key))
            setting = result.scalar_one_or_none()
            if setting:
                setting.value = str(value)
        else:
            # Insert
            db.add(Setting(key=key, value=str(value)))

    await db.commit()
    data = await _load_settings(db)
    return SettingOut(**{k: data.get(k, "") for k in SETTING_KEYS})
