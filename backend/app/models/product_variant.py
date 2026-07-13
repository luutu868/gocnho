"""ProductVariant — biến thể theo size."""

import uuid
from datetime import datetime

from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, DateTime, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ProductVariant(Base):
    __tablename__ = "product_variants"
    __table_args__ = (UniqueConstraint("product_id", "size"),)

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    size: Mapped[str] = mapped_column(String(10), nullable=False)  # "S", "M", "L"
    price: Mapped[int] = mapped_column(Integer, nullable=False)  # VND
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    product = relationship("Product", back_populates="variants")
