"""Topping & ProductTopping models."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Integer, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Topping(Base):
    __tablename__ = "toppings"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)  # VND
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    products = relationship("ProductTopping", back_populates="topping")


class ProductTopping(Base):
    """Junction table — surrogate PK + composite unique on (product_id, topping_id)."""
    __tablename__ = "product_toppings"

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False
    )
    topping_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("toppings.id", ondelete="CASCADE"),
        nullable=False
    )

    # Relationships
    product = relationship("Product", back_populates="toppings")
    topping = relationship("Topping", back_populates="products")
