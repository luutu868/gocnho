# 🚀 Quick Start - Docker Compose

## Chạy toàn bộ ứng dụng trong 3 bước

### 1️⃣ Cấu hình
```bash
cp .env.example .env
```

### 2️⃣ Chạy Backend + Frontend
```bash
# Chạy backend (tạo network)
docker compose -f docker-compose.be.yml up -d --build

# Chạy frontend (join network)
docker compose -f docker-compose.fe.yml up -d --build
```

### 3️⃣ Setup Database
```bash
# Chạy migrations
docker compose -f docker-compose.be.yml exec api alembic upgrade head

# (Optional) Seed dữ liệu demo
docker compose -f docker-compose.be.yml exec api python scripts/seed-db.py
```

## ✅ Truy cập ứng dụng

| Service | URL |
|---------|-----|
| 🌐 Frontend | https://localhost ⭐ |
| 🔌 Backend API | http://localhost:8000 |
| 📖 API Docs | http://localhost:8000/docs |
| 💾 MinIO Console | http://localhost:9001 |

> **💡 Tip:** Frontend chạy HTTPS với self-signed cert. Browser sẽ cảnh báo lần đầu - chọn "Proceed" để tiếp tục.

## 🛑 Dừng

```bash
docker compose -f docker-compose.be.yml down
docker compose -f docker-compose.fe.yml down
```

## 📚 Chi tiết

Xem thêm tại [DOCKER-SETUP.md](./DOCKER-SETUP.md)
