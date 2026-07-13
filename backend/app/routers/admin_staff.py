"""Admin CRUD for staff (nhân viên)."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.staff import StaffCreate, StaffResetPin

router = APIRouter(prefix="/api/v1/admin/staff", tags=["Admin - Staff"])


@router.get("")
async def list_staff(db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("", status_code=201)
async def create_staff(data: StaffCreate, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.put("/{staff_id}")
async def update_staff(staff_id: str, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.delete("/{staff_id}", status_code=204)
async def deactivate_staff(staff_id: str, db: AsyncSession = Depends(get_db)):
    """Soft delete: set is_active = False."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.put("/{staff_id}/reset-pin")
async def reset_staff_pin(staff_id: str, data: StaffResetPin, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")
