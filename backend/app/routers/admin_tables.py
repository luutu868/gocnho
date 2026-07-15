"""Admin CRUD for tables + QR code generation."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.table import Table
from app.schemas.admin import TableCreate, TableUpdate, TableBatchCreate, TableOut
from app.routers.admin_auth import get_current_admin
import uuid

router = APIRouter(prefix="/api/v1/admin/tables", tags=["Admin - Tables"])


@router.get("", response_model=list[TableOut])
async def list_tables(
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    result = await db.execute(select(Table).order_by(Table.code))
    return result.scalars().all()


@router.post("", status_code=status.HTTP_201_CREATED, response_model=TableOut)
async def create_table(
    data: TableCreate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    # Check if exists
    existing = await db.execute(select(Table).where(Table.code == data.code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Mã bàn đã tồn tại")
        
    table = Table(code=data.code)
    db.add(table)
    await db.commit()
    await db.refresh(table)
    return table


@router.post("/batch", status_code=status.HTTP_201_CREATED, response_model=list[TableOut])
async def create_tables_batch(
    data: TableBatchCreate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    created_tables = []
    for i in range(data.start, data.end + 1):
        num_str = str(i).zfill(data.padding)
        code = f"{data.prefix}{num_str}"
        
        existing = await db.execute(select(Table).where(Table.code == code))
        if not existing.scalar_one_or_none():
            table = Table(code=code)
            db.add(table)
            created_tables.append(table)
            
    await db.commit()
    for t in created_tables:
        await db.refresh(t)
        
    return created_tables


@router.put("/{table_id}", response_model=TableOut)
async def update_table(
    table_id: str,
    data: TableUpdate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    try:
        uid = uuid.UUID(table_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    result = await db.execute(select(Table).where(Table.id == uid))
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=404, detail="Không tìm thấy bàn")

    if data.code is not None:
        if data.code != table.code:
            existing = await db.execute(select(Table).where(Table.code == data.code))
            if existing.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Mã bàn đã tồn tại")
        table.code = data.code
        
    if data.is_active is not None:
        table.is_active = data.is_active

    await db.commit()
    await db.refresh(table)
    return table


@router.delete("/{table_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_table(
    table_id: str,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    try:
        uid = uuid.UUID(table_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    result = await db.execute(select(Table).where(Table.id == uid))
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=404, detail="Không tìm thấy bàn")

    await db.delete(table)
    await db.commit()


@router.post("/{table_id}/generate-qr")
async def generate_table_qr(
    table_id: str,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    # For now, let the frontend handle the QR generation via external API.
    # We could store the base URL here if needed.
    return {"message": "Dùng tính năng tạo QR ở frontend"}


@router.post("/generate-all-qr")
async def generate_all_qr(
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    return {"message": "Dùng tính năng tạo QR ở frontend"}


@router.get("/download-qr")
async def download_all_qr(
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    raise HTTPException(status_code=501, detail="Tính năng tải hàng loạt sẽ được cập nhật sau")
