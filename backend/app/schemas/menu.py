"""Pydantic schemas for menu endpoints."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CategoryOut(BaseModel):
    id: UUID
    name: str
    slug: str
    sort_order: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductVariantOut(BaseModel):
    id: UUID
    size: str
    price: int
    is_default: bool

    model_config = ConfigDict(from_attributes=True)


class ToppingOut(BaseModel):
    id: UUID
    name: str
    price: int
    is_available: bool

    model_config = ConfigDict(from_attributes=True)


class ProductImageOut(BaseModel):
    id: UUID
    url: str
    alt_text: str | None
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class ProductOut(BaseModel):
    id: UUID
    category_id: UUID
    name: str
    slug: str
    description: str | None
    is_available: bool
    has_sugar_option: bool
    has_ice_option: bool
    sort_order: int
    created_at: datetime
    # Nested — hydrated from service dict
    category: CategoryOut | None = None
    primary_image: ProductImageOut | None = None
    variants: list[ProductVariantOut] = []
    toppings: list[ToppingOut] = []

    model_config = ConfigDict(from_attributes=True)


class ProductDetailOut(ProductOut):
    """Chi tiết món — kèm đầy đủ images."""
    images: list[ProductImageOut] = []
