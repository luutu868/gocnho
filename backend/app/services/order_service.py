"""Order business logic — create, confirm, expire orders."""

from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.order import OrderCreate, OrderCreatedOut
from app.utils.order_code import generate_order_code


class OrderService:
    """Service for order lifecycle management."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_order(self, data: OrderCreate) -> OrderCreatedOut:
        """Create a new order with status 'pending_payment'.

        Steps:
        1. Validate table exists (if table_code provided)
        2. Validate all products exist and are available
        3. Calculate total_amount (snapshot — never updated later)
        4. INSERT order + order_items + options + toppings in 1 transaction
        5. Generate VietQR code data
        6. Return OrderCreatedOut with QR data
        """
        raise NotImplementedError("TODO: implement after models created")

    async def get_order_by_code(self, order_code: str):
        """Get order by code with all items, options, toppings."""
        raise NotImplementedError("TODO")

    async def confirm_payment(self, order_code: str) -> dict:
        """Confirm VietQR payment — status: pending_payment → confirmed.

        Idempotent: if already confirmed, return 200 OK without changes.
        Raises 410 if order expired.
        """
        raise NotImplementedError("TODO")

    async def confirm_cash(self, order_code: str) -> dict:
        """Confirm cash payment — status: pending_payment → confirmed."""
        raise NotImplementedError("TODO")

    async def expire_orders(self) -> int:
        """Mark all expired pending_payment orders as 'expired'.

        Returns count of expired orders.
        Called by Celery Beat every 1 minute.
        """
        raise NotImplementedError("TODO")
