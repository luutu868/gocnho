"""Admin CRUD for categories."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.admin import CategoryCreate, CategoryUpdate

router = APIRouter(prefix="/api/v1/admin/categories", tags=["Admin - Categories"])


@router.get("")
async def list_categories(db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("", status_code=201)
async def create_category(data: CategoryCreate, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.put("/{category_id}")
async def update_category(category_id: str, data: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.delete("/{category_id}", status_code=204)
async def delete_category(category_id: str, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")
