"""Admin CRUD for tables + QR code generation."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.admin import TableCreate, TableUpdate, TableBatchCreate

router = APIRouter(prefix="/api/v1/admin/tables", tags=["Admin - Tables"])


@router.get("")
async def list_tables(db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("", status_code=201)
async def create_table(data: TableCreate, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("/batch", status_code=201)
async def create_tables_batch(data: TableBatchCreate, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.put("/{table_id}")
async def update_table(table_id: str, data: TableUpdate, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.delete("/{table_id}", status_code=204)
async def delete_table(table_id: str, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("/{table_id}/generate-qr")
async def generate_table_qr(table_id: str, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("/generate-all-qr")
async def generate_all_qr(db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/download-qr")
async def download_all_qr(db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")
