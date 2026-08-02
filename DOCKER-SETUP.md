# Docker Setup Guide

## ✅ Đã hoàn thành

Cả backend và frontend đã được cấu hình để chạy với Docker Compose trên shared network `cafegocnho-net`.

## 🚀 Cách chạy

### Bước 1: Cấu hình environment
```bash
cp .env.example .env
# Chỉnh sửa .env nếu cần (DB_PASSWORD, JWT_SECRET, etc.)
```

### Bước 2: Chạy Backend (tạo network)
```bash
docker compose -f docker-compose.be.yml up -d --build
```

Services sẽ chạy:
- ✅ API: http://localhost:8000
- ✅ API Docs: http://localhost:8000/docs
- ✅ MinIO Console: http://localhost:9001
- ✅ PostgreSQL: localhost:5432
- ✅ Celery Worker
- ✅ Celery Beat
- ✅ Redis
- ✅ MinIO Storage

### Bước 3: Chạy Frontend (join network)
```bash
docker compose -f docker-compose.fe.yml up -d --build
```

Services sẽ chạy:
- ✅ Frontend: http://localhost (port 80)
- ✅ HTTPS: https://localhost (port 443)
- ✅ Certbot (auto SSL renewal)

### Bước 4: Database Migrations
```bash
docker compose -f docker-compose.be.yml exec api alembic upgrade head
```

### Bước 5: (Optional) Khởi tạo MinIO buckets
```bash
docker compose -f docker-compose.be.yml exec api python scripts/init-minio.sh
```

### Bước 6: (Optional) Seed dữ liệu demo
```bash
docker compose -f docker-compose.be.yml exec api python scripts/seed-db.py
```

## 🔍 Kiểm tra

### Xem logs
```bash
# Backend
docker compose -f docker-compose.be.yml logs -f api

# Frontend
docker compose -f docker-compose.fe.yml logs -f frontend

# Tất cả
docker compose -f docker-compose.be.yml logs -f
docker compose -f docker-compose.fe.yml logs -f
```

### Kiểm tra network
```bash
# Xem containers trong network
docker network inspect cafegocnho-net

# Test kết nối từ frontend đến backend
docker exec cafegocnho-fe ping cafegocnho-api

# Test API call từ frontend
docker exec cafegocnho-fe wget -O- http://cafegocnho-api:8000/docs
```

### Xem trạng thái containers
```bash
docker ps
```

## 🛑 Dừng services

```bash
# Dừng frontend
docker compose -f docker-compose.fe.yml down

# Dừng backend
docker compose -f docker-compose.be.yml down

# Dừng và xóa volumes (⚠️ mất dữ liệu)
docker compose -f docker-compose.be.yml down -v
```

## 🔄 Restart services

```bash
# Restart backend
docker compose -f docker-compose.be.yml restart api worker beat

# Restart frontend
docker compose -f docker-compose.fe.yml restart frontend

# Rebuild và restart
docker compose -f docker-compose.be.yml up -d --build api
docker compose -f docker-compose.fe.yml up -d --build frontend
```

## 🐛 Troubleshooting

### Network conflict
Nếu gặp lỗi network label không đúng:
```bash
# Dừng tất cả containers
docker compose -f docker-compose.be.yml down
docker compose -f docker-compose.fe.yml down

# Xóa network cũ
docker network rm cafegocnho-net

# Chạy lại từ đầu
docker compose -f docker-compose.be.yml up -d
docker compose -f docker-compose.fe.yml up -d
```

### Frontend không kết nối được backend
```bash
# Kiểm tra frontend có trong network không
docker network inspect cafegocnho-net | grep cafegocnho-fe

# Nếu không có, restart frontend
docker compose -f docker-compose.fe.yml down
docker compose -f docker-compose.fe.yml up -d
```

### Build errors
```bash
# Clean build
docker compose -f docker-compose.be.yml build --no-cache api
docker compose -f docker-compose.fe.yml build --no-cache frontend
```

## 📝 Network Architecture

```
┌─────────────────────────────────────────┐
│      cafegocnho-net (bridge)            │
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │  Frontend    │◄──►│  Backend API │  │
│  │  (Nginx)     │    │  (FastAPI)   │  │
│  │  Port: 80    │    │  Port: 8000  │  │
│  └──────────────┘    └──────┬───────┘  │
│                              │          │
│  ┌──────────────┐           │          │
│  │  PostgreSQL  │◄──────────┤          │
│  │  Port: 5432  │           │          │
│  └──────────────┘           │          │
│                              │          │
│  ┌──────────────┐           │          │
│  │    Redis     │◄──────────┤          │
│  │  Port: 6379  │           │          │
│  └──────────────┘           │          │
│                              │          │
│  ┌──────────────┐           │          │
│  │    MinIO     │◄──────────┘          │
│  │ Port: 9000-1 │                      │
│  └──────────────┘                      │
│                                         │
│  ┌──────────────┐   ┌──────────────┐   │
│  │ Celery Beat  │   │Celery Worker │   │
│  └──────────────┘   └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## 🎯 Service Discovery

Tất cả containers có thể giao tiếp với nhau qua container name:
- `cafegocnho-api` (Backend API)
- `cafegocnho-fe` (Frontend)
- `cafegocnho-db` (PostgreSQL)
- `cafegocnho-redis` (Redis)
- `cafegocnho-minio` (MinIO)
- `cafegocnho-worker` (Celery Worker)
- `cafegocnho-beat` (Celery Beat)

Ví dụ: Frontend có thể gọi API qua `http://cafegocnho-api:8000`
