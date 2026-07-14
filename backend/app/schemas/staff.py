"""Pydantic schemas for staff endpoints."""

from uuid import UUID
from pydantic import BaseModel, Field


class StaffLoginIn(BaseModel):
    staff_code: str = Field(min_length=1, max_length=10)
    pin: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class StaffLoginOut(BaseModel):
    staff_code: str
    name: str
    message: str
    session_token: str  # Returned for cross-origin Bearer auth


class StaffOut(BaseModel):
    id: UUID
    staff_code: str
    name: str
    is_active: bool

    model_config = {"from_attributes": True}


class StaffCreate(BaseModel):
    staff_code: str = Field(min_length=1, max_length=10)
    name: str = Field(min_length=2, max_length=100)
    pin: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class StaffResetPin(BaseModel):
    pin: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")
