"""Staff session authentication — PIN login with Redis-backed session cookies."""

import json
import uuid

from fastapi import Depends, HTTPException, Request

# TODO: import redis client when implemented
# from app.database import redis_client


async def create_staff_session(staff_id: str, staff_code: str, name: str) -> str:
    """Create a session in Redis, return session token.

    Session expires after STAFF_SESSION_EXPIRE_SECONDS (8h).
    """
    raise NotImplementedError("TODO: implement with Redis")


async def get_current_staff(request: Request) -> dict:
    """FastAPI dependency — extract staff from session cookie."""
    session_token = request.cookies.get("session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # TODO: Lookup session in Redis
    raise NotImplementedError("TODO: implement with Redis")


async def delete_staff_session(session_token: str) -> None:
    """Delete a staff session from Redis (logout)."""
    raise NotImplementedError("TODO: implement with Redis")
