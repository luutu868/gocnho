"""Redis client initialization and dependency."""

import redis.asyncio as redis
from app.config import settings

redis_client: redis.Redis | None = None

async def init_redis():
    """Initialize Redis client."""
    global redis_client
    redis_client = redis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
    await redis_client.ping()

async def close_redis():
    """Close Redis client."""
    global redis_client
    if redis_client:
        await redis_client.close()

def get_redis() -> redis.Redis:
    """Dependency to get Redis client."""
    if redis_client is None:
        raise RuntimeError("Redis client is not initialized")
    return redis_client
