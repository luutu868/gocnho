"""Image processing service — validate, resize, upload to MinIO."""

from io import BytesIO

from fastapi import UploadFile


class ImageService:
    """Handle image upload, validation, and processing."""

    ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
    MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
    RESIZE_MAX_PX = 800
    WEBP_QUALITY = 80

    @classmethod
    async def validate(cls, file: UploadFile) -> None:
        """Validate file MIME type, size, dimensions."""
        raise NotImplementedError("TODO")

    @classmethod
    async def process_and_upload(cls, file: UploadFile, bucket: str) -> dict:
        """Resize image, convert to WebP, upload to MinIO.

        Returns: {"id": UUID, "url": str, "original_name": str, "file_size": int}
        """
        raise NotImplementedError("TODO")
