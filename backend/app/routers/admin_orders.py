"""Admin orders list — view + filter orders."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.routers.admin_auth import get_current_admin

router = APIRouter(prefix="/api/v1/admin/orders", tags=["Admin - Orders"])


@router.get("")
async def list_orders(
    status: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    stmt = (
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.table),
        )
        .order_by(Order.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    if status:
        statuses = [s.strip() for s in status.split(",")]
        stmt = stmt.where(Order.status.in_(statuses))

    result = await db.execute(stmt)
    orders = result.scalars().all()

    return {
        "orders": [
            {
                "id": str(o.id),
                "order_code": o.order_code,
                "table_code": o.table.code if o.table else None,
                "status": o.status,
                "payment_method": o.payment_method,
                "total_amount": o.total_amount,
                "note": o.note,
                "created_at": o.created_at,
                "confirmed_at": o.confirmed_at,
                "completed_at": o.completed_at,
                "item_count": len(o.items),
            }
            for o in orders
        ],
        "total": len(orders),
    }
