"""Pydantic schemas for order endpoints."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class OrderItemOptionIn(BaseModel):
    option_id: UUID


class OrderItemToppingIn(BaseModel):
    topping_id: UUID
    quantity: int = 1


class OrderItemIn(BaseModel):
    product_id: UUID
    variant_id: UUID
    quantity: int = 1
    options: list[OrderItemOptionIn] = []
    toppings: list[OrderItemToppingIn] = []
    note: str | None = Field(None, max_length=100)


class OrderCreate(BaseModel):
    table_code: str | None = None
    payment_method: str = "vietqr"  # "vietqr" | "cash"
    items: list[OrderItemIn]
    note: str | None = Field(None, max_length=200)


class OrderItemOut(BaseModel):
    id: UUID
    product_id: UUID
    product_name: str | None = None
    variant_id: UUID
    variant_size: str | None = None
    quantity: int
    unit_price: int
    note: str | None
    status: str
    options: list[dict] = []
    toppings: list[dict] = []

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: UUID
    order_code: str
    table_code: str | None = None
    status: str
    payment_method: str
    total_amount: int
    note: str | None
    expires_at: datetime
    created_at: datetime
    confirmed_at: datetime | None = None
    completed_at: datetime | None = None
    items: list[OrderItemOut] = []

    model_config = {"from_attributes": True}


class OrderCreatedOut(BaseModel):
    order_code: str
    total_amount: int
    qr_code_data: str | None = None
    expires_at: datetime
    bank_info: dict | None = None


class ConfirmPaymentOut(BaseModel):
    status: str
    message: str
