"""Staff order management endpoints — PIN auth required."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Any

from app.database import get_db
from app.services.staff_order_service import get_staff_orders, update_order_status, update_item_status
from app.schemas.order import OrderOut
from app.services.staff_auth_service import get_current_staff

router = APIRouter(prefix="/api/v1/staff", tags=["Staff Orders"])


class StatusUpdate(BaseModel):
    status: str



@router.get("/orders")
async def list_orders(
    since: str | None = None,
    status: str = "confirmed,preparing",
    db: AsyncSession = Depends(get_db),
    staff: dict = Depends(get_current_staff)
) -> Any:
    """Danh sách order mới + đang làm (cursor-based polling)."""
    orders = await get_staff_orders(db, status)
    
    # Format to match expectations of FE
    # Since OrderOut schema is complex and we are returning raw SQLAlchemy objects, 
    # we rely on FastAPI's JSON encoder to parse it, but we need to map table_code and product names.
    result = []
    for order in orders:
        o_dict = {
            "id": str(order.id),
            "order_code": order.order_code,
            "table_code": order.table.code if order.table else None,
            "status": order.status,
            "payment_method": order.payment_method,
            "total_amount": order.total_amount,
            "note": order.note,
            "expires_at": order.expires_at,
            "created_at": order.created_at,
            "confirmed_at": order.confirmed_at,
            "completed_at": order.completed_at,
            "items": []
        }
        for item in order.items:
            i_dict = {
                "id": str(item.id),
                "product_name": item.product.name if item.product else None,
                "variant": {"size": item.variant.size, "price": item.variant.price} if item.variant else None,
                "quantity": item.quantity,
                "options": [{"group": opt.option.group.name if (opt.option and opt.option.group) else "", "value": opt.option.value if opt.option else ""} for opt in item.options],
                "toppings": [{"name": top.topping.name if top.topping else "", "quantity": top.quantity, "price": top.price} for top in item.toppings],
                "note": item.note,
                "status": item.status,
            }
            o_dict["items"].append(i_dict)
        result.append(o_dict)

    return {"orders": result, "next_cursor": None, "has_more": False}


@router.patch("/orders/{order_id}/status")
async def patch_order_status(
    order_id: str, 
    body: StatusUpdate,
    db: AsyncSession = Depends(get_db),
    staff: dict = Depends(get_current_staff)
):
    """Cập nhật trạng thái đơn hàng."""
    valid_statuses = ["preparing", "completed", "cancelled"]
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    await update_order_status(db, order_id, body.status)
    return {"message": "success"}


@router.patch("/order-items/{item_id}/status")
async def patch_item_status(
    item_id: str, 
    body: StatusUpdate,
    db: AsyncSession = Depends(get_db),
    staff: dict = Depends(get_current_staff)
):
    """Đánh dấu món đã làm xong."""
    valid_statuses = ["pending", "preparing", "done"]
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    await update_item_status(db, item_id, body.status)
    return {"message": "success"}
