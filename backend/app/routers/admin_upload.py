"""Admin product image upload — resize to 800px WebP."""

import io
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.product_image import ProductImage
from app.models.product import Product
from app.routers.admin_auth import get_current_admin

router = APIRouter(prefix="/api/v1/admin", tags=["Admin - Upload"])

# Upload directory — maps to /static/uploads/ served by nginx in prod
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/app/static/uploads")
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5MB
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/upload/product-image/{product_id}", status_code=201)
async def upload_product_image(
    product_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """Upload và resize ảnh món (JPG/PNG/WebP → WebP 800px)."""
    # Validate product exists
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy món")

    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Chỉ chấp nhận JPG, PNG, WebP")

    # Read file
    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File quá lớn (tối đa 5MB)")

    # Resize and convert to WebP
    try:
        from PIL import Image as PILImage

        img = PILImage.open(io.BytesIO(content))
        img = img.convert("RGB")

        # Resize: max width 800px, maintain aspect ratio
        if img.width > 800:
            ratio = 800 / img.width
            new_h = int(img.height * ratio)
            img = img.resize((800, new_h), PILImage.LANCZOS)

        # Save as WebP
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        filename = f"{uuid.uuid4()}.webp"
        filepath = os.path.join(UPLOAD_DIR, filename)

        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=85, optimize=True)
        buf.seek(0)
        with open(filepath, "wb") as f:
            f.write(buf.read())

    except ImportError:
        raise HTTPException(status_code=500, detail="Pillow không được cài — liên hệ admin")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý ảnh: {str(e)}")

    # Save to DB
    url = f"/static/uploads/{filename}"
    image = ProductImage(
        product_id=product_id,
        url=url,
        alt_text=product.name,
        sort_order=0,
    )
    db.add(image)

    # Set as primary if no primary image
    if not product.primary_image_id:
        await db.flush()
        product.primary_image_id = image.id

    await db.commit()
    await db.refresh(image)

    return {
        "id": str(image.id),
        "url": image.url,
        "product_id": str(product_id),
    }
