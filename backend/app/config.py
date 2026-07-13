"""Application configuration — loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """App settings, loaded from .env / environment."""

    # App
    app_name: str = "cafegocnho"
    app_env: str = "development"
    app_debug: bool = True

    # Database
    database_url: str = "postgresql+asyncpg://user:changeme@localhost:5432/cafegocnho"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # MinIO
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket_menu: str = "menu-images"
    minio_bucket_qr: str = "qr-codes"

    # Auth
    jwt_secret: str = "dev-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_seconds: int = 86400  # 24h
    staff_session_expire_seconds: int = 28800  # 8h

    # VietQR
    vietqr_bank_bin: str = "970432"
    vietqr_account_no: str = "680180598"
    vietqr_account_name: str = "LUU VAN TU"

    # Rate Limit
    rate_limit_order_max: int = 5
    rate_limit_order_window: int = 300  # 5 minutes
    rate_limit_pin_max: int = 5
    rate_limit_pin_window: int = 900  # 15 minutes

    # Celery
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
