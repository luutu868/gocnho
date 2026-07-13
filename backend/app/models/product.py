"""Product model — món trong menu."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Product(Base):
    __tablename__ = "products"

    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    primary_image_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product_images.id"), nullable=True
    )
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    has_sugar_option: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    has_ice_option: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    category = relationship("Category", back_populates="products")
    primary_image = relationship("ProductImage", foreign_keys=[primary_image_id])
    variants = relationship("ProductVariant", back_populates="product")
    images = relationship("ProductImage", foreign_keys="ProductImage.product_id", back_populates="product")
    toppings = relationship("ProductTopping", back_populates="product")
