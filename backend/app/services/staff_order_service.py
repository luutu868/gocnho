"""Service for staff order management."""

from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.order import Order
from app.models.order_item import OrderItem, OrderItemOption, OrderItemTopping
from app.models.option import Option

async def get_staff_orders(db: AsyncSession, status: str = "confirmed,preparing"):
    statuses = status.split(",")
    stmt = (
        select(Order)
        .where(Order.status.in_(statuses))
        .order_by(Order.created_at.desc())
        .options(
            selectinload(Order.table),
            selectinload(Order.items).selectinload(OrderItem.product),
            selectinload(Order.items).selectinload(OrderItem.variant),
            selectinload(Order.items).selectinload(OrderItem.options).selectinload(OrderItemOption.option).selectinload(Option.group),
            selectinload(Order.items).selectinload(OrderItem.toppings).selectinload(OrderItemTopping.topping)
        )
    )
    result = await db.execute(stmt)
    orders = result.scalars().all()
    
    # We will need to return it matching Pydantic schema later, 
    # but returning raw SQLAlchemy objects works if router specifies response_model
    return orders

async def update_order_status(db: AsyncSession, order_id: str, status: str):
    try:
        order_uuid = UUID(order_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order ID")

    stmt = select(Order).where(Order.id == order_uuid)
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    if status == "completed":
        order.completed_at = datetime.now(timezone.utc)
        
    await db.commit()
    await db.refresh(order)
    return order

async def update_item_status(db: AsyncSession, item_id: str, status: str):
    try:
        item_uuid = UUID(item_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid item ID")

    stmt = select(OrderItem).where(OrderItem.id == item_uuid).options(selectinload(OrderItem.order).selectinload(Order.items))
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")

    item.status = status
    
    # Auto complete order if all items are done
    order = item.order
    all_done = all(i.status == "done" for i in order.items if i.id != item.id) and status == "done"
    
    if all_done and order.status != "completed":
        order.status = "completed"
        order.completed_at = datetime.now(timezone.utc)
    elif not all_done and order.status == "completed":
        order.status = "preparing"
        order.completed_at = None
        
    await db.commit()
    await db.refresh(item)
    return item
