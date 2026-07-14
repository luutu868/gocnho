"""Staff authentication service."""

import json
import secrets
import bcrypt
from datetime import timedelta
from fastapi import HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.staff import Staff
from app.schemas.staff import StaffLoginIn, StaffLoginOut
from app.redis_client import get_redis

MAX_ATTEMPTS = 5
LOCK_TIME = 900  # 15 mins
SESSION_EXPIRY = 28800  # 8 hours

async def staff_login_logic(data: StaffLoginIn, response: Response, db: AsyncSession) -> StaffLoginOut:
    redis = get_redis()
    
    # 1. Rate limiting check
    rate_limit_key = f"staff_login_attempts:{data.staff_code}"
    attempts_str = await redis.get(rate_limit_key)
    attempts = int(attempts_str) if attempts_str else 0
    
    if attempts >= MAX_ATTEMPTS:
        ttl = await redis.ttl(rate_limit_key)
        mins = max(1, ttl // 60)
        raise HTTPException(status_code=429, detail=f"Tài khoản tạm khóa. Thử lại sau {mins} phút.")

    # 2. Find staff
    stmt = select(Staff).where(Staff.staff_code == data.staff_code)
    result = await db.execute(stmt)
    staff = result.scalar_one_or_none()
    
    if not staff or not staff.is_active:
        await _record_failed_attempt(redis, rate_limit_key, attempts)
        raise HTTPException(status_code=401, detail="Sai mã nhân viên hoặc mã PIN")

    # 3. Verify PIN
    try:
        is_valid = bcrypt.checkpw(data.pin.encode("utf-8"), staff.pin_hash.encode("utf-8"))
    except Exception:
        is_valid = False
        
    if not is_valid:
        await _record_failed_attempt(redis, rate_limit_key, attempts)
        raise HTTPException(status_code=401, detail="Sai mã nhân viên hoặc mã PIN")

    # 4. Success -> Reset rate limit
    await redis.delete(rate_limit_key)

    # 5. Create session
    session_token = secrets.token_urlsafe(32)
    session_data = {
        "id": str(staff.id),
        "staff_code": staff.staff_code,
        "name": staff.name
    }
    
    await redis.setex(f"session:{session_token}", SESSION_EXPIRY, json.dumps(session_data))

    # 6. Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=SESSION_EXPIRY,
        httponly=True,
        samesite="lax",
        secure=False,  # False for local dev
    )

    return StaffLoginOut(
        staff_code=staff.staff_code,
        name=staff.name,
        message="Đăng nhập thành công",
        session_token=session_token
    )

async def _record_failed_attempt(redis, key: str, current_attempts: int):
    new_attempts = await redis.incr(key)
    if new_attempts == 1:
        await redis.expire(key, LOCK_TIME)

async def get_current_staff(request: Request) -> dict:
    # Accept token from Authorization header OR cookie
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        session_token = auth_header[7:]
    else:
        session_token = request.cookies.get("session_token")
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    redis = get_redis()
    session_data_str = await redis.get(f"session:{session_token}")
    
    if not session_data_str:
        raise HTTPException(status_code=401, detail="Session expired")
        
    await redis.expire(f"session:{session_token}", SESSION_EXPIRY)
    
    return json.loads(session_data_str)
