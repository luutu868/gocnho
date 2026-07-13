"""Staff order management endpoints — PIN auth required."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter(prefix="/api/v1/staff", tags=["Staff Orders"])


@router.get("/orders")
async def list_orders(
    since: str | None = None,
    status: str = "confirmed,preparing",
    db: AsyncSession = Depends(get_db),
):
    """Danh sách order mới + đang làm (cursor-based polling)."""
    return {"orders": [], "next_cursor": None, "has_more": False}


@router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, db: AsyncSession = Depends(get_db)):
    """Cập nhật trạng thái đơn hàng."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.patch("/order-items/{item_id}/status")
async def update_item_status(item_id: str, status: str, db: AsyncSession = Depends(get_db)):
    """Đánh dấu món đã làm xong."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")
