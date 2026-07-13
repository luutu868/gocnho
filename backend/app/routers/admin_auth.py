"""Admin authentication endpoints — JWT Bearer token."""

from fastapi import APIRouter, Depends
from app.schemas.admin import AdminLoginIn, AdminLoginOut, AdminRefreshOut, ChangePasswordIn

router = APIRouter(prefix="/api/v1/auth/admin", tags=["Admin Auth"])


@router.post("/login", response_model=AdminLoginOut)
async def admin_login(data: AdminLoginIn):
    """Đăng nhập username/password → JWT token."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("/refresh", response_model=AdminRefreshOut)
async def admin_refresh():
    """Refresh JWT token."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("/change-password")
async def change_password(data: ChangePasswordIn):
    """Đổi mật khẩu admin (bắt buộc lần đầu)."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")
