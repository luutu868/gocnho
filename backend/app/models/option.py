"""OptionGroup & Option models — tùy chọn đường/đá."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class OptionGroup(Base):
    __tablename__ = "option_groups"

    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    options = relationship("Option", back_populates="group")


class Option(Base):
    __tablename__ = "options"

    group_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("option_groups.id"), nullable=False
    )
    value: Mapped[str] = mapped_column(String(50), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    group = relationship("OptionGroup", back_populates="options")
