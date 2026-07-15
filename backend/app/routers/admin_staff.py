"""Admin CRUD for staff accounts."""

from uuid import UUID
import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.staff import Staff
from app.schemas.staff import StaffCreate, StaffResetPin
from app.routers.admin_auth import get_current_admin

router = APIRouter(prefix="/api/v1/admin/staff", tags=["Admin - Staff"])


def _staff_dict(s: Staff) -> dict:
    return {
        "id": str(s.id),
        "staff_code": s.staff_code,
        "name": s.name,
        "is_active": s.is_active,
        "created_at": s.created_at,
        "updated_at": s.updated_at,
    }


@router.get("")
async def list_staff(
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    result = await db.execute(select(Staff).order_by(Staff.staff_code))
    return [_staff_dict(s) for s in result.scalars().all()]


@router.post("", status_code=201)
async def create_staff(
    data: StaffCreate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    # Check unique staff_code
    existing = await db.execute(select(Staff).where(Staff.staff_code == data.staff_code.upper()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Mã nhân viên đã tồn tại")

    pin_hash = bcrypt.hashpw(data.pin.encode(), bcrypt.gensalt()).decode()
    staff = Staff(
        staff_code=data.staff_code.upper(),
        name=data.name,
        pin_hash=pin_hash,
        is_active=True,
    )
    db.add(staff)
    await db.commit()
    await db.refresh(staff)
    return _staff_dict(staff)


@router.put("/{staff_id}")
async def update_staff(
    staff_id: UUID,
    name: str,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    result = await db.execute(select(Staff).where(Staff.id == staff_id))
    staff = result.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
    staff.name = name
    await db.commit()
    await db.refresh(staff)
    return _staff_dict(staff)


@router.post("/{staff_id}/reset-pin")
async def reset_pin(
    staff_id: UUID,
    data: StaffResetPin,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    result = await db.execute(select(Staff).where(Staff.id == staff_id))
    staff = result.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")

    staff.pin_hash = bcrypt.hashpw(data.pin.encode(), bcrypt.gensalt()).decode()
    await db.commit()
    return {"message": "PIN đã được đặt lại"}


@router.patch("/{staff_id}/toggle-active")
async def toggle_active(
    staff_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    result = await db.execute(select(Staff).where(Staff.id == staff_id))
    staff = result.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
    staff.is_active = not staff.is_active
    await db.commit()
    return {"id": str(staff.id), "is_active": staff.is_active}


@router.delete("/{staff_id}", status_code=204)
async def delete_staff(
    staff_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    result = await db.execute(select(Staff).where(Staff.id == staff_id))
    staff = result.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
    # Soft delete
    staff.is_active = False
    await db.commit()
