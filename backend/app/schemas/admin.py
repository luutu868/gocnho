"""Pydantic schemas for admin endpoints."""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


# Auth
class AdminLoginIn(BaseModel):
    username: str
    password: str


class AdminLoginOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    must_change_password: bool = False


class AdminRefreshOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class ChangePasswordIn(BaseModel):
    old_password: str
    new_password: str = Field(min_length=8, max_length=128)


# Category
class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    slug: str | None = None
    sort_order: int = 0
    is_active: bool = True


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    slug: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


# Product
class ProductCreate(BaseModel):
    category_id: UUID
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    is_available: bool = True
    has_sugar_option: bool = True
    has_ice_option: bool = True
    variant_prices: dict[str, int]  # {"S": 25000, "M": 30000, "L": 35000}
    topping_ids: list[UUID] = []
    image_ids: list[UUID] = []
    sort_order: int = 0


class ProductUpdate(BaseModel):
    category_id: UUID | None = None
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    is_available: bool | None = None
    has_sugar_option: bool | None = None
    has_ice_option: bool | None = None
    variant_prices: dict[str, int] | None = None
    topping_ids: list[UUID] | None = None
    image_ids: list[UUID] | None = None
    primary_image_id: UUID | None = None
    sort_order: int | None = None


# Topping
class ToppingCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: int = Field(ge=0, le=50000)
    is_available: bool = True


class ToppingUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    price: int | None = Field(None, ge=0, le=50000)
    is_available: bool | None = None


# Table
class TableCreate(BaseModel):
    code: str = Field(min_length=1, max_length=10, pattern=r"^[A-Z0-9-]{1,10}$")


class TableUpdate(BaseModel):
    code: str | None = Field(None, min_length=1, max_length=10)
    is_active: bool | None = None


class TableBatchCreate(BaseModel):
    prefix: str = "B"
    start: int = 1
    end: int = 10
    padding: int = 2  # "01" → B01


# Setting
class SettingUpdate(BaseModel):
    shop_name: str | None = Field(None, min_length=2, max_length=100)
    shop_phone: str | None = Field(None, pattern=r"^0[0-9]{9}$")
    shop_address: str | None = Field(None, max_length=200)
    bank_name: str | None = Field(None, max_length=100)
    bank_bin: str | None = Field(None, pattern=r"^[0-9]{6}$")
    bank_account_no: str | None = Field(None, pattern=r"^[0-9]{6,19}$")
    bank_account_name: str | None = Field(None, pattern=r"^[A-Z\s]{1,100}$")
    bank_branch: str | None = Field(None, max_length=100)


class SettingOut(BaseModel):
    shop_name: str = ""
    shop_phone: str = ""
    shop_address: str = ""
    bank_name: str = ""
    bank_bin: str = ""
    bank_account_no: str = ""
    bank_account_name: str = ""
    bank_branch: str = ""

    model_config = {"from_attributes": True}
