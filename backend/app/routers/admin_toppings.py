"""Admin CRUD for toppings."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.topping import Topping
from app.schemas.admin import ToppingCreate, ToppingUpdate
from app.routers.admin_auth import get_current_admin

router = APIRouter(prefix="/api/v1/admin/toppings", tags=["Admin - Toppings"])


def _topping_dict(t: Topping) -> dict:
    return {
        "id": str(t.id),
        "name": t.name,
        "price": t.price,
        "is_available": t.is_available,
        "updated_at": t.updated_at,
    }


@router.get("")
async def list_toppings(
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    result = await db.execute(select(Topping).order_by(Topping.name))
    return [_topping_dict(t) for t in result.scalars().all()]


@router.post("", status_code=201)
async def create_topping(
    data: ToppingCreate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    # Check unique name
    existing = await db.execute(select(Topping).where(Topping.name == data.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Tên topping đã tồn tại")

    topping = Topping(name=data.name, price=data.price, is_available=data.is_available)
    db.add(topping)
    await db.commit()
    await db.refresh(topping)
    return _topping_dict(topping)


@router.put("/{topping_id}")
async def update_topping(
    topping_id: UUID,
    data: ToppingUpdate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    result = await db.execute(select(Topping).where(Topping.id == topping_id))
    topping = result.scalar_one_or_none()
    if not topping:
        raise HTTPException(status_code=404, detail="Không tìm thấy topping")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(topping, field, value)

    await db.commit()
    await db.refresh(topping)
    return _topping_dict(topping)


@router.delete("/{topping_id}", status_code=204)
async def delete_topping(
    topping_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    result = await db.execute(select(Topping).where(Topping.id == topping_id))
    topping = result.scalar_one_or_none()
    if not topping:
        raise HTTPException(status_code=404, detail="Không tìm thấy topping")
    await db.delete(topping)
    await db.commit()
