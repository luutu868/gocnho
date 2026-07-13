"""OrderItem, OrderItemOption, OrderItemTopping models."""

import uuid

from sqlalchemy import ForeignKey, Integer, String, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = (Index("idx_order_items_order_id", "order_id"),)

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id"), nullable=False
    )
    variant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product_variants.id"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    unit_price: Mapped[int] = mapped_column(Integer, nullable=False)  # VND — snapshot
    note: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    options = relationship("OrderItemOption", back_populates="order_item")
    toppings = relationship("OrderItemTopping", back_populates="order_item")


class OrderItemOption(Base):
    """Option per order item — surrogate PK."""
    __tablename__ = "order_item_options"

    order_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("order_items.id", ondelete="CASCADE"),
        nullable=False
    )
    option_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("options.id"),
        nullable=False
    )

    order_item = relationship("OrderItem", back_populates="options")


class OrderItemTopping(Base):
    """Topping per order item — surrogate PK."""
    __tablename__ = "order_item_toppings"

    order_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("order_items.id", ondelete="CASCADE"),
        nullable=False
    )
    topping_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("toppings.id"),
        nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)  # VND — snapshot

    order_item = relationship("OrderItem", back_populates="toppings")
