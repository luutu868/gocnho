"""Order model — đơn hàng."""

import uuid
from datetime import datetime

from sqlalchemy import Column, ForeignKey, Integer, String, Text, DateTime, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        Index("idx_orders_status", "status"),
        Index("idx_orders_table_id", "table_id"),
        Index("idx_orders_expires_at", "expires_at"),
    )

    order_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    table_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tables.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), default="pending_payment", nullable=False
    )
    # Enum: pending_payment, confirmed, preparing, completed, cancelled, expired
    payment_method: Mapped[str] = mapped_column(
        String(20), default="vietqr", nullable=False
    )
    # Enum: vietqr, cash
    total_amount: Mapped[int] = mapped_column(Integer, nullable=False)  # VND snapshot
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    items = relationship("OrderItem", back_populates="order")
    table = relationship("Table")

    @property
    def table_code(self) -> str | None:
        return self.table.code if self.table else None
