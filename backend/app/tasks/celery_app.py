"""Celery application setup."""

from celery import Celery
from app.config import settings

celery_app = Celery(
    "cafegocnho",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Ho_Chi_Minh",
    enable_utc=True,
    beat_schedule={
        "expire-pending-orders": {
            "task": "app.tasks.order_tasks.expire_pending_orders",
            "schedule": 60.0,  # Every 1 minute
        },
        "cleanup-temp-files": {
            "task": "app.tasks.order_tasks.cleanup_temp_files",
            "schedule": 3600.0,  # Every hour (check + cleanup files > 24h)
        },
    },
)

# Autodiscover tasks
celery_app.autodiscover_tasks(["app.tasks"])
