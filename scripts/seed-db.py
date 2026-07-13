#!/usr/bin/env python3
"""
Seed database với dữ liệu mẫu cho Tiệm Cafe Góc Nhỏ.
Chạy sau khi đã migrate database: python scripts/seed-db.py

Dữ liệu seed:
- 7 danh mục món
- 22 món với variants + toppings
- 2 option groups (Đường, Đá) + options
- 6 loại topping
- 10 bàn (B01-B10)
- Tài khoản admin mặc định
"""
import asyncio
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# TODO: Import models and seed logic after models are created
# from app.database import async_session
# from app.models import ...

async def seed():
    """Seed data vào database."""
    print("Seeding database...")
    # TODO: Implement seed logic
    print("✅ Seed complete!")

if __name__ == "__main__":
    asyncio.run(seed())
