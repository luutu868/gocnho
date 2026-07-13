"""Celery background tasks for order management."""

from app.tasks.celery_app import celery_app
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)


@celery_app.task(name="expire-pending-orders")
def expire_pending_orders():
    """Mark orders as expired if pending_payment > 15 minutes.

    Runs every 1 minute via Celery Beat.
    """
    logger.info("Running expire-pending-orders task...")
    # TODO: Implement — query pending orders, check expires_at, update status
    logger.info("expire-pending-orders complete.")


@celery_app.task(name="cleanup-temp-files")
def cleanup_temp_files():
    """Clean up orphan temp files in MinIO.

    Deletes files in temp/ bucket that are > 24h old and not referenced by DB.
    Runs every hour via Celery Beat.
    """
    logger.info("Running cleanup-temp-files task...")
    # TODO: Implement
    logger.info("cleanup-temp-files complete.")
