"""Rate limiting middleware using Redis."""

from fastapi import HTTPException, Request


class RateLimiter:
    """Simple rate limiter using Redis INCR + EXPIRE."""

    def __init__(self, redis_client=None):
        self.redis = redis_client

    async def check_order_limit(self, request: Request) -> None:
        """Limit: max 5 POST /orders per 5 minutes per IP."""
        # TODO: Implement with Redis
        pass

    async def check_pin_limit(self, request: Request, staff_code: str) -> None:
        """Limit: max 5 failed PIN attempts per 15 minutes per IP+staff_code."""
        # TODO: Implement with Redis
        pass
