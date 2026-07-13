"""Staff authentication endpoints — PIN login with session cookie."""

from fastapi import APIRouter, Depends, Response
from app.schemas.staff import StaffLoginIn, StaffLoginOut

router = APIRouter(prefix="/api/v1/auth/staff", tags=["Staff Auth"])


@router.post("/login", response_model=StaffLoginOut)
async def staff_login(data: StaffLoginIn, response: Response):
    """Đăng nhập bằng staff_code + PIN. Set session cookie."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("/logout")
async def staff_logout():
    """Đăng xuất, xóa session."""
    return {"message": "Logged out"}
