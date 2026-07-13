"""Admin CRUD for toppings."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.admin import ToppingCreate, ToppingUpdate

router = APIRouter(prefix="/api/v1/admin/toppings", tags=["Admin - Toppings"])


@router.get("")
async def list_toppings(db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("", status_code=201)
async def create_topping(data: ToppingCreate, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.put("/{topping_id}")
async def update_topping(topping_id: str, data: ToppingUpdate, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.delete("/{topping_id}", status_code=204)
async def delete_topping(topping_id: str, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")
