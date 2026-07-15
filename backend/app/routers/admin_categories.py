"""Admin CRUD for categories."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.category import Category
from app.schemas.admin import CategoryCreate, CategoryUpdate
from app.routers.admin_auth import get_current_admin

router = APIRouter(prefix="/api/v1/admin/categories", tags=["Admin - Categories"])


@router.get("")
async def list_categories(
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    result = await db.execute(select(Category).order_by(Category.sort_order, Category.name))
    cats = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "name": c.name,
            "slug": c.slug,
            "sort_order": c.sort_order,
            "is_active": c.is_active,
            "created_at": c.created_at,
        }
        for c in cats
    ]


@router.post("", status_code=201)
async def create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    import re
    slug = data.slug or re.sub(r"[^a-z0-9]+", "-", data.name.lower()).strip("-")
    # Check unique slug
    existing = await db.execute(select(Category).where(Category.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{str(UUID(int=0))[:8]}"

    cat = Category(
        name=data.name,
        slug=slug,
        sort_order=data.sort_order,
        is_active=data.is_active,
    )
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return {"id": str(cat.id), "name": cat.name, "slug": cat.slug, "sort_order": cat.sort_order, "is_active": cat.is_active}


@router.put("/{category_id}")
async def update_category(
    category_id: UUID,
    data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(cat, field, value)

    await db.commit()
    await db.refresh(cat)
    return {"id": str(cat.id), "name": cat.name, "slug": cat.slug, "sort_order": cat.sort_order, "is_active": cat.is_active}


@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
    await db.delete(cat)
    await db.commit()
