"""OrderSequence model — atomic per-day counter for order code generation."""

from datetime import date

from sqlalchemy import Column, Date, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class OrderSequence(Base):
    __tablename__ = "order_sequences"

    order_date: Mapped[date] = mapped_column(Date, unique=True, nullable=False)
    last_seq: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
