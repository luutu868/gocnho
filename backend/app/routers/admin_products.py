"""Admin CRUD for products."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.admin import ProductCreate, ProductUpdate

router = APIRouter(prefix="/api/v1/admin/products", tags=["Admin - Products"])


@router.get("")
async def list_products(db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("", status_code=201)
async def create_product(data: ProductCreate, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.put("/{product_id}")
async def update_product(product_id: str, data: ProductUpdate, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: str, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.put("/{product_id}/toggle-available")
async def toggle_available(product_id: str, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")
