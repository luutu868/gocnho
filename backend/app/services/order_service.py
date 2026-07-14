"""Order business logic — create, confirm, expire orders."""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order
from app.models.order_item import OrderItem, OrderItemOption, OrderItemTopping
from app.models.product_variant import ProductVariant
from app.models.topping import Topping
from app.models.table import Table
from app.models.option import Option
from app.schemas.order import OrderCreate, OrderCreatedOut, OrderOut
from app.utils.order_code import generate_order_code
from app.services.vietqr_service import VietQRService
import os


class OrderService:
    """Service for order lifecycle management."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_order(self, data: OrderCreate) -> OrderCreatedOut:
        """Create a new order with status 'pending_payment'."""
        table_id = None
        if data.table_code:
            res_table = await self.db.execute(
                select(Table.id).where(Table.code == data.table_code)
            )
            table_id = res_table.scalar_one_or_none()

        # Generate unique order code
        today = datetime.now(timezone.utc).date()
        today_prefix = f"TC-{today.strftime('%Y%m%d')}-"
        count_res = await self.db.execute(
            select(func.count(Order.id)).where(Order.order_code.like(f"{today_prefix}%"))
        )
        seq_num = (count_res.scalar() or 0) + 1
        order_code = generate_order_code(seq_num)

        expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

        total_amount = 0
        order = Order(
            order_code=order_code,
            table_id=table_id,
            status="pending_payment",
            payment_method=data.payment_method,
            total_amount=0,
            note=data.note,
            expires_at=expires_at,
        )
        self.db.add(order)
        await self.db.flush()

        # Pre-load options map by value string for fallback resolution
        opts_res = await self.db.execute(select(Option))
        all_options = opts_res.scalars().all()
        option_val_map = {opt.value: opt.id for opt in all_options}
        option_id_map = {str(opt.id): opt.id for opt in all_options}

        for item_in in data.items:
            variant_res = await self.db.execute(
                select(ProductVariant).where(ProductVariant.id == item_in.variant_id)
            )
            variant = variant_res.scalar_one_or_none()
            if not variant:
                raise HTTPException(status_code=400, detail="Variant không hợp lệ")

            item_total_price = variant.price

            order_item = OrderItem(
                order_id=order.id,
                product_id=item_in.product_id,
                variant_id=item_in.variant_id,
                quantity=item_in.quantity,
                unit_price=variant.price,
                note=item_in.note,
                status="pending",
            )
            self.db.add(order_item)
            await self.db.flush()

            # Options
            for opt_in in item_in.options:
                resolved_option_id = option_id_map.get(str(opt_in.option_id)) or option_val_map.get(str(opt_in.option_id))
                if resolved_option_id:
                    self.db.add(
                        OrderItemOption(
                            order_item_id=order_item.id,
                            option_id=resolved_option_id,
                        )
                    )

            # Toppings
            for top_in in item_in.toppings:
                top_res = await self.db.execute(
                    select(Topping).where(Topping.id == top_in.topping_id)
                )
                top = top_res.scalar_one_or_none()
                if top:
                    item_total_price += top.price * top_in.quantity
                    self.db.add(
                        OrderItemTopping(
                            order_item_id=order_item.id,
                            topping_id=top.id,
                            quantity=top_in.quantity,
                            price=top.price,
                        )
                    )

            total_amount += item_total_price * item_in.quantity

        order.total_amount = total_amount
        await self.db.commit()

        bank_bin = os.getenv("VIETQR_BANK_BIN", "970432")
        account_no = os.getenv("VIETQR_ACCOUNT_NO", "680180598")
        account_name = os.getenv("VIETQR_ACCOUNT_NAME", "LUU VAN TU")

        qr_code_data = VietQRService.generate_qr_base64(
            bank_bin=bank_bin,
            account_no=account_no,
            account_name=account_name,
            amount=total_amount,
            description=order_code,
        )
        bank_info = {
            "bank_bin": bank_bin,
            "account_no": account_no,
            "account_name": account_name,
        }

        return OrderCreatedOut(
            order_code=order_code,
            total_amount=total_amount,
            qr_code_data=qr_code_data,
            expires_at=expires_at,
            bank_info=bank_info,
        )

    async def get_order_by_code(self, order_code: str):
        """Get order by code with items."""
        res = await self.db.execute(
            select(Order)
            .options(
                selectinload(Order.items).selectinload(OrderItem.options),
                selectinload(Order.items).selectinload(OrderItem.toppings)
            )
            .where(Order.order_code == order_code)
        )
        order = res.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
        
        # Attach QR and Bank info for the frontend
        bank_bin = os.getenv("VIETQR_BANK_BIN", "970432")
        account_no = os.getenv("VIETQR_ACCOUNT_NO", "680180598")
        account_name = os.getenv("VIETQR_ACCOUNT_NAME", "LUU VAN TU")

        order.qr_code_data = VietQRService.generate_qr_base64(
            bank_bin=bank_bin,
            account_no=account_no,
            account_name=account_name,
            amount=order.total_amount,
            description=order.order_code,
        )
        order.bank_info = {
            "bank_bin": bank_bin,
            "account_no": account_no,
            "account_name": account_name,
        }
        
        return order

    async def confirm_payment(self, order_code: str) -> dict:
        order = await self.get_order_by_code(order_code)
        if order.status == "confirmed":
            return {"status": "success", "message": "Payment already confirmed"}
        if order.status != "pending_payment":
            raise HTTPException(status_code=400, detail="Cannot confirm payment for this order")
        
        order.status = "confirmed"
        order.payment_method = "vietqr"
        await self.db.commit()
        return {"status": "success", "message": "Payment confirmed"}

    async def confirm_cash(self, order_code: str) -> dict:
        order = await self.get_order_by_code(order_code)
        if order.status == "confirmed":
            return {"status": "success", "message": "Cash payment already confirmed"}
        if order.status != "pending_payment":
            raise HTTPException(status_code=400, detail="Cannot confirm payment for this order")
        
        order.status = "confirmed"
        order.payment_method = "cash"
        await self.db.commit()
        return {"status": "success", "message": "Cash payment confirmed"}

    async def expire_orders(self) -> int:
        raise NotImplementedError("TODO")
