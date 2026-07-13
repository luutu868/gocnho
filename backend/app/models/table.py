"""Table model — bàn trong quán."""

from datetime import datetime

from sqlalchemy import Boolean, Column, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Table(Base):
    __tablename__ = "tables"

    code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    qr_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
