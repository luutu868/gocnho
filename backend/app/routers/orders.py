"""Public order endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.order import OrderCreate, OrderCreatedOut, OrderOut, ConfirmPaymentOut

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])


@router.post("", response_model=OrderCreatedOut, status_code=201)
async def create_order(data: OrderCreate, db: AsyncSession = Depends(get_db)):
    """Tạo đơn hàng mới (status: pending_payment). Trả về QR code data."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/{order_code}", response_model=OrderOut)
async def get_order(order_code: str, db: AsyncSession = Depends(get_db)):
    """Tra cứu đơn hàng (không cần auth)."""
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Not implemented")


@router.post("/{order_code}/confirm-payment", response_model=ConfirmPaymentOut)
async def confirm_payment(order_code: str, db: AsyncSession = Depends(get_db)):
    """Khách xác nhận 'Đã chuyển khoản' (VietQR)."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("/{order_code}/confirm-cash", response_model=ConfirmPaymentOut)
async def confirm_cash(order_code: str, db: AsyncSession = Depends(get_db)):
    """Khách xác nhận đặt món tiền mặt."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")
