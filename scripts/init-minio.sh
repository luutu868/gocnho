#!/bin/bash
# Khởi tạo MinIO buckets cho Tiệm Cafe Góc Nhỏ
# Usage: ./scripts/init-minio.sh

set -e

MINIO_HOST="${MINIO_HOST:-localhost:9000}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-minioadmin}"

# Cài đặt MinIO Client nếu chưa có
if ! command -v mc &> /dev/null; then
    echo "Installing MinIO Client (mc)..."
    curl -O https://dl.min.io/client/mc/release/linux-amd64/mc
    chmod +x mc
    sudo mv mc /usr/local/bin/mc
fi

# Configure MinIO client
mc alias set cafegocnho http://${MINIO_HOST} ${MINIO_ACCESS_KEY} ${MINIO_SECRET_KEY}

# Create buckets
mc mb --ignore-existing cafegocnho/menu-images
mc mb --ignore-existing cafegocnho/qr-codes
mc mb --ignore-existing cafegocnho/temp

# Set public read access for menu-images and qr-codes
mc policy set download cafegocnho/menu-images
mc policy set download cafegocnho/qr-codes

echo "MinIO buckets initialized successfully!"
mc ls cafegocnho
