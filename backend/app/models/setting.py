"""Setting model — cấu hình quán (key-value)."""

from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Setting(Base):
    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
