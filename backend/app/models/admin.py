"""Admin model — quản trị viên (JWT auth)."""

from datetime import datetime

from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Admin(Base):
    __tablename__ = "admins"

    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False)  # bcrypt
    password_changed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
