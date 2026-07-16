"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings

# ─── Routers ───
from app.routers import menu, orders, tables
from app.routers import staff_auth, staff_orders
from app.routers import admin_auth, admin_categories, admin_products
from app.routers import admin_toppings, admin_tables, admin_staff
from app.routers import admin_orders, admin_settings, admin_upload


from app.redis_client import init_redis, close_redis

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown events."""
    await init_redis()
    yield
    await close_redis()


app = FastAPI(
    title="Tiệm Cafe Góc Nhỏ",
    description="API for cafe ordering web app",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (like uploaded images)
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ─── Include all routers ───
app.include_router(menu.router)
app.include_router(orders.router)
app.include_router(tables.router)
app.include_router(staff_auth.router)
app.include_router(staff_orders.router)
app.include_router(admin_auth.router)
app.include_router(admin_categories.router)
app.include_router(admin_products.router)
app.include_router(admin_toppings.router)
app.include_router(admin_tables.router)
app.include_router(admin_staff.router)
app.include_router(admin_orders.router)
app.include_router(admin_settings.router)
app.include_router(admin_upload.router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "app": settings.app_name}
