"""Admin CRUD for products."""

import re
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.product import Product
from app.models.product_variant import ProductVariant
from app.models.topping import ProductTopping, Topping
from app.models.product_image import ProductImage
from app.schemas.admin import ProductCreate, ProductUpdate
from app.routers.admin_auth import get_current_admin

router = APIRouter(prefix="/api/v1/admin/products", tags=["Admin - Products"])


def _product_dict(p: Product) -> dict:
    variants = sorted(p.variants or [], key=lambda v: ["S", "M", "L"].index(v.size) if v.size in ["S", "M", "L"] else 99)
    return {
        "id": str(p.id),
        "category_id": str(p.category_id),
        "name": p.name,
        "slug": p.slug,
        "description": p.description,
        "is_available": p.is_available,
        "has_sugar_option": p.has_sugar_option,
        "has_ice_option": p.has_ice_option,
        "sort_order": p.sort_order,
        "primary_image_url": p.primary_image.url if p.primary_image else None,
        "primary_image_id": str(p.primary_image_id) if p.primary_image_id else None,
        "variants": [{"id": str(v.id), "size": v.size, "price": v.price, "is_default": v.is_default} for v in variants],
        "toppings": [{"id": str(pt.topping_id), "name": pt.topping.name if pt.topping else ""} for pt in (p.toppings or [])],
        "updated_at": p.updated_at,
    }


@router.get("")
async def list_products(
    category_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    stmt = (
        select(Product)
        .options(
            selectinload(Product.variants),
            selectinload(Product.primary_image),
            selectinload(Product.toppings).selectinload(ProductTopping.topping),
        )
        .order_by(Product.sort_order, Product.name)
    )
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)

    result = await db.execute(stmt)
    return [_product_dict(p) for p in result.scalars().all()]


@router.post("", status_code=201)
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    # Generate slug
    slug = re.sub(r"[^a-z0-9]+", "-", data.name.lower()).strip("-")
    # Ensure unique slug
    existing = await db.execute(select(Product).where(Product.slug == slug))
    if existing.scalar_one_or_none():
        import time
        slug = f"{slug}-{int(time.time()) % 10000}"

    product = Product(
        category_id=data.category_id,
        name=data.name,
        slug=slug,
        description=data.description,
        is_available=data.is_available,
        has_sugar_option=data.has_sugar_option,
        has_ice_option=data.has_ice_option,
        sort_order=data.sort_order,
    )
    db.add(product)
    await db.flush()  # Get product.id

    # Create variants
    sizes = list(data.variant_prices.keys())
    for i, (size, price) in enumerate(data.variant_prices.items()):
        variant = ProductVariant(
            product_id=product.id,
            size=size,
            price=price,
            is_default=(i == 0),
        )
        db.add(variant)

    # Link toppings
    for topping_id in data.topping_ids:
        db.add(ProductTopping(product_id=product.id, topping_id=topping_id))

    await db.commit()

    # Reload with relations
    result = await db.execute(
        select(Product)
        .where(Product.id == product.id)
        .options(
            selectinload(Product.variants),
            selectinload(Product.primary_image),
            selectinload(Product.toppings).selectinload(ProductTopping.topping),
        )
    )
    return _product_dict(result.scalar_one())


@router.put("/{product_id}")
async def update_product(
    product_id: UUID,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    result = await db.execute(
        select(Product)
        .where(Product.id == product_id)
        .options(
            selectinload(Product.variants),
            selectinload(Product.primary_image),
            selectinload(Product.toppings).selectinload(ProductTopping.topping),
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy món")

    # Update simple fields
    simple_fields = ["category_id", "name", "description", "is_available",
                     "has_sugar_option", "has_ice_option", "sort_order", "primary_image_id"]
    for field in simple_fields:
        value = getattr(data, field)
        if value is not None:
            setattr(product, field, value)

    # Update variants if provided
    if data.variant_prices is not None:
        # Delete old variants
        await db.execute(delete(ProductVariant).where(ProductVariant.product_id == product_id))
        for i, (size, price) in enumerate(data.variant_prices.items()):
            db.add(ProductVariant(
                product_id=product.id, size=size, price=price, is_default=(i == 0)
            ))

    # Update toppings if provided
    if data.topping_ids is not None:
        await db.execute(delete(ProductTopping).where(ProductTopping.product_id == product_id))
        for tid in data.topping_ids:
            db.add(ProductTopping(product_id=product.id, topping_id=tid))

    await db.commit()

    # Reload
    result = await db.execute(
        select(Product)
        .where(Product.id == product_id)
        .options(
            selectinload(Product.variants),
            selectinload(Product.primary_image),
            selectinload(Product.toppings).selectinload(ProductTopping.topping),
        )
    )
    return _product_dict(result.scalar_one())


@router.patch("/{product_id}/availability")
async def toggle_availability(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """Toggle is_available nhanh không cần load toàn bộ."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy món")
    product.is_available = not product.is_available
    await db.commit()
    return {"id": str(product.id), "is_available": product.is_available}


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy món")
    await db.delete(product)
    await db.commit()
