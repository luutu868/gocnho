"""Admin order listing."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

router = APIRouter(prefix="/api/v1/admin/orders", tags=["Admin - Orders"])


@router.get("")
async def list_orders(
    status: str | None = Query(None),
    payment_method: str | None = Query(None),
    table_code: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    sort_by: str = Query("created_at"),
    order: str = Query("desc"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Danh sách tất cả đơn (filter, sort, pagination)."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")
