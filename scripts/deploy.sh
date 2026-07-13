#!/bin/bash
# Deploy script cho Tiệm Cafe Góc Nhỏ
# Usage: ./scripts/deploy.sh [fe|be|all]

set -e

DEPLOY_TARGET="${1:-all}"

echo "🚀 Deploying Tiệm Cafe Góc Nhỏ..."

# Tạo Docker network nếu chưa tồn tại
docker network inspect cafegocnho-net >/dev/null 2>&1 || \
    docker network create cafegocnho-net

if [ "$DEPLOY_TARGET" = "fe" ] || [ "$DEPLOY_TARGET" = "all" ]; then
    echo "📦 Building & deploying Frontend..."
    docker compose -f docker-compose.fe.yml build --no-cache
    docker compose -f docker-compose.fe.yml down
    docker compose -f docker-compose.fe.yml up -d
    echo "✅ Frontend deployed!"
fi

if [ "$DEPLOY_TARGET" = "be" ] || [ "$DEPLOY_TARGET" = "all" ]; then
    echo "📦 Building & deploying Backend..."
    docker compose -f docker-compose.be.yml build --no-cache api worker beat
    docker compose -f docker-compose.be.yml up -d
    echo "✅ Backend deployed!"
fi

echo "🎉 Deploy complete!"
docker compose -f docker-compose.be.yml ps
