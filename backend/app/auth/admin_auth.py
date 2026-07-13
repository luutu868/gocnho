"""Admin JWT authentication."""

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings

security = HTTPBearer()


def create_access_token(admin_id: str, username: str) -> str:
    """Create JWT access token for admin."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": admin_id,
        "username": username,
        "role": "admin",
        "iat": now,
        "exp": now + timedelta(seconds=settings.jwt_expire_seconds),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def verify_access_token(token: str) -> dict:
    """Verify JWT and return payload. Raises HTTPException if invalid."""
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """FastAPI dependency — extract admin from JWT Bearer token."""
    return verify_access_token(credentials.credentials)
