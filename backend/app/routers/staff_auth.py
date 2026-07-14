"""Staff authentication endpoints — PIN login with session cookie."""

from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.staff import StaffLoginIn, StaffLoginOut
from app.services.staff_auth_service import staff_login_logic, get_current_staff
from app.redis_client import get_redis

router = APIRouter(prefix="/api/v1/auth/staff", tags=["Staff Auth"])


@router.post("/login", response_model=StaffLoginOut)
async def staff_login(data: StaffLoginIn, response: Response, db: AsyncSession = Depends(get_db)):
    """Đăng nhập bằng staff_code + PIN. Set session cookie."""
    return await staff_login_logic(data, response, db)


@router.post("/logout")
async def staff_logout(request: Request, response: Response):
    """Đăng xuất, xóa session."""
    session_token = request.cookies.get("session_token")
    if session_token:
        redis = get_redis()
        await redis.delete(f"session:{session_token}")
    
    response.delete_cookie("session_token")
    return {"message": "Logged out"}


@router.get("/me")
async def get_me(staff: dict = Depends(get_current_staff)):
    """Kiểm tra session hiện tại."""
    return staff
