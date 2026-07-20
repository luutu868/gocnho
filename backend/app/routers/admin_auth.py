"""Admin authentication endpoints — JWT Bearer token."""

import os
import secrets
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database import get_db
from app.models.admin import Admin
from app.schemas.admin import AdminLoginIn, AdminLoginOut, ChangePasswordIn

router = APIRouter(prefix="/api/v1/auth/admin", tags=["Admin Auth"])

JWT_SECRET = os.getenv("JWT_SECRET", "cafe-gocnho-secret-key-change-in-prod")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24


def create_token(admin_id: str, username: str) -> str:
    payload = {
        "sub": admin_id,
        "username": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request, db: AsyncSession = Depends(get_db)) -> Admin:
    token = request.cookies.get("admin_access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        admin_id = payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    result = await db.execute(select(Admin).where(Admin.id == admin_id))
    admin = result.scalar_one_or_none()
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    return admin


@router.post("/login", response_model=AdminLoginOut)
async def admin_login(data: AdminLoginIn, response: Response, db: AsyncSession = Depends(get_db)):
    """Đăng nhập username/password → JWT token."""
    result = await db.execute(select(Admin).where(Admin.username == data.username))
    admin = result.scalar_one_or_none()

    if not admin:
        raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu")

    try:
        valid = bcrypt.checkpw(data.password.encode(), admin.password_hash.encode())
    except Exception:
        valid = False

    if not valid:
        raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu")

    token = create_token(str(admin.id), admin.username)
    must_change = admin.password_changed_at is None

    response.set_cookie(
        key="admin_access_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=JWT_EXPIRY_HOURS * 3600,
    )

    return AdminLoginOut(
        must_change_password=must_change,
    )


@router.post("/logout")
async def admin_logout(response: Response):
    """Đăng xuất admin, xóa cookie."""
    response.delete_cookie(key="admin_access_token")
    return {"message": "Đã đăng xuất"}


@router.post("/change-password")
async def change_password(
    data: ChangePasswordIn,
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Đổi mật khẩu admin."""
    try:
        valid = bcrypt.checkpw(data.old_password.encode(), admin.password_hash.encode())
    except Exception:
        valid = False

    if not valid:
        raise HTTPException(status_code=400, detail="Mật khẩu cũ không đúng")

    new_hash = bcrypt.hashpw(data.new_password.encode(), bcrypt.gensalt()).decode()
    await db.execute(
        update(Admin)
        .where(Admin.id == admin.id)
        .values(password_hash=new_hash, password_changed_at=datetime.now(timezone.utc))
    )
    await db.commit()
    return {"message": "Đổi mật khẩu thành công"}


@router.get("/me")
async def get_me(admin: Admin = Depends(get_current_admin)):
    return {
        "id": str(admin.id),
        "username": admin.username,
        "must_change_password": admin.password_changed_at is None,
    }
