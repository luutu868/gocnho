"""Public menu endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.menu import CategoryOut, ProductOut, ProductDetailOut
from app.services.menu_service import MenuService

router = APIRouter(prefix="/api/v1/menu", tags=["Menu"])


@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
):
    """Danh sách danh mục đang active, sắp xếp theo sort_order."""
    service = MenuService(db)
    categories = await service.get_categories(active_only=active_only)
    return [CategoryOut.model_validate(c) for c in categories]


@router.get("/products", response_model=list[ProductOut])
async def list_products(
    category_slug: str | None = Query(None, description="Filter by category slug"),
    search: str | None = Query(None, description="Search by product name"),
    available_only: bool = Query(True, description="Only return available products"),
    db: AsyncSession = Depends(get_db),
):
    """Danh sách món (filter theo danh mục, tìm kiếm theo tên)."""
    service = MenuService(db)
    products = await service.get_products(
        category_slug=category_slug,
        search=search,
        available_only=available_only,
    )
    return [ProductOut.model_validate(p) for p in products]


@router.get("/products/{slug}", response_model=ProductDetailOut)
async def get_product(slug: str, db: AsyncSession = Depends(get_db)):
    """Chi tiết 1 món (kèm variants, toppings, ảnh)."""
    service = MenuService(db)
    product = await service.get_product_by_slug(slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductDetailOut.model_validate(product)
