"""Public table endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter(prefix="/api/v1/tables", tags=["Tables"])


@router.get("/{code}")
async def check_table(code: str, db: AsyncSession = Depends(get_db)):
    """Kiểm tra bàn tồn tại."""
    return {"code": code, "exists": False}  # TODO: implement
