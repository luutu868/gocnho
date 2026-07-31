# Tiệm Cafe Góc Nhỏ ☕

Web App đặt món online cho quán cafe "Tiệm Cafe Góc Nhỏ" — xem menu, tùy chỉnh món, thanh toán VietQR, không cần tải app, không cần đăng ký.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + TailwindCSS v4 + shadcn/ui |
| Backend | FastAPI (Python 3.11+) + SQLAlchemy 2.0 async |
| Database | PostgreSQL 16 |
| Cache/Broker | Redis 7 |
| Storage | MinIO (S3-compatible) |
| Tasks | Celery + Celery Beat |
| Reverse Proxy | Nginx + Let's Encrypt |

## Quick Start

### Development

```bash
# 1. Backend
cp .env.example .env  # chỉnh sửa secrets nếu cần
docker compose -f docker-compose.be.yml up -d
cd backend && python -m alembic upgrade head

# 2. Frontend
cd frontend && npm install && npm run dev
```

### Production

```bash
# Build & run tất cả
docker compose -f docker-compose.fe.yml -f docker-compose.be.yml up -d --build
```

## Project Structure

```
├── docs/                  # PRD, TDD
├── ui-demo/               # UI prototype (Next.js — tham khảo)
├── frontend/              # React + Vite App
│   ├── src/
│   │   ├── api/           # API client layer
│   │   ├── stores/        # Zustand stores
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Route components
│   │   ├── components/    # Reusable components
│   │   ├── types/         # TypeScript interfaces
│   │   └── lib/           # Utilities & constants
│   └── nginx/             # Nginx config (production)
├── backend/               # FastAPI
│   ├── app/
│   │   ├── models/        # SQLAlchemy ORM
│   │   ├── schemas/       # Pydantic v2
│   │   ├── routers/       # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── auth/          # JWT + Session auth
│   │   ├── tasks/         # Celery tasks
│   │   ├── middleware/     # Rate limiting, etc.
│   │   └── utils/         # Utilities
│   └── alembic/           # DB migrations
├── docker-compose.fe.yml  # Frontend + Nginx + Certbot
├── docker-compose.be.yml  # Backend + DB + Redis + MinIO + Celery
└── scripts/               # Deployment & utility scripts
```

## Documentation

- [Product Requirements (PRD)](docs/PRD.md)
- [Technical Design Document (TDD)](docs/TDD.md)
- [UI Prototype](ui-demo/)

## 🎨 Recent Updates (2026-07-31)

### UI/UX Improvements
- ✅ Premium design với hover effects, micro-interactions
- ✅ Skeleton loading, professional error/empty states
- ✅ Accessibility compliance (WCAG AA)

### Product Images
- ✅ 22 placeholder images (aspect ratio 4:3)
- ✅ Color-coded by category
- ✅ Served from `backend/static/uploads/products/`

**Docs:**
- [UI Improvements](docs/ui-improvements-summary.md)
- [UI Before/After](docs/ui-before-after.md)
- [Product Images](scripts/README.md)

## License

MIT
