"""Staff model — nhân viên (PIN auth)."""

from datetime import datetime

from sqlalchemy import Boolean, Column, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Staff(Base):
    __tablename__ = "staff"

    staff_code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    pin_hash: Mapped[str] = mapped_column(String(128), nullable=False)  # bcrypt
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
