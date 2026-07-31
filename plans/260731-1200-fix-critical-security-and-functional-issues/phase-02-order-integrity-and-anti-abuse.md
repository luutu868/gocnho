---
phase: 2
title: "Order Integrity and Anti-Abuse"
status: completed
priority: P1
effort: "1d"
dependencies: []
---

# Phase 2: Order Integrity and Anti-Abuse

## Overview
Fix the order-code race condition, implement the auto-expiry Celery task, and wire real IP-based rate limiting for order creation — the three anti-abuse controls the PRD's concurrency/anti-spam targets depend on. Backend-only.

## Key Insights (from review)
- `OrderService.create_order` computes the next order-code sequence via `SELECT COUNT(*) WHERE order_code LIKE 'TC-YYYYMMDD-%'` then increments in Python (TOCTOU) — two concurrent requests can compute the same `seq_num`, both insert, second fails `orders.order_code` unique constraint with an unhandled `IntegrityError` → uncaught 500 mid-checkout.
- `app/utils/order_code.py::get_next_sequence()` is the intended atomic helper but `raise NotImplementedError`, and is unused.
- `OrderService.expire_orders()` is `raise NotImplementedError("TODO")`; `app/tasks/order_tasks.py::expire_pending_orders` Celery task (already scheduled every 1 min via `celery_app.py` beat schedule) only logs — never calls it.
- `app/middleware/rate_limit.py::RateLimiter.check_order_limit` is `pass` — never called from `orders.py`, never registered anywhere. PRD requires max 5 orders/5min/IP; currently unlimited.
- Celery tasks run in a **sync** worker process; DB access must open its own async session via `asyncio.run(...)` + `async_session_factory()` directly — cannot reuse the FastAPI `get_db()` generator dependency.
- `settings.rate_limit_order_max=5`, `rate_limit_order_window=300` already defined in [config.py](../../backend/app/config.py#L36-L39) — unused, ready to consume.

## Requirements
- Functional: concurrent checkouts never fail with a raw 500 on order-code collision; abandoned `pending_payment` orders transition to `expired` within ~1-2 minutes of their 15-min window; order creation is capped per IP.
- Non-functional: order-code generation must not introduce a new bottleneck (single round-trip, not a global lock across all orders).

## Architecture
```
Order-code sequence (atomic, single round-trip):
  New table order_sequences(order_date DATE PK, last_seq INT)
  INSERT INTO order_sequences (order_date, last_seq) VALUES (today, 1)
    ON CONFLICT (order_date) DO UPDATE SET last_seq = order_sequences.last_seq + 1
    RETURNING last_seq
  → atomic per-day counter, no app-level race window

Order expiry (Celery beat, every 1 min — already scheduled):
  expire_pending_orders() [sync task]
    → asyncio.run(_expire_pending_orders_async())
        → async with async_session_factory() as db:
            UPDATE orders SET status='expired'
            WHERE status='pending_payment' AND expires_at < now()

Order rate limit (Redis INCR+EXPIRE per IP):
  POST /orders → Depends(check_order_rate_limit) → 429 if request.client.host
                 exceeded settings.rate_limit_order_max in settings.rate_limit_order_window
```

## Related Code Files
- Modify: [backend/app/utils/order_code.py](../../backend/app/utils/order_code.py) — implement `get_next_sequence`.
- Create: `backend/app/models/order_sequence.py` — new `OrderSequence` model.
- Create: `backend/alembic/versions/003_order_sequence_table.py` — migration creating `order_sequences` table.
- Modify: [backend/app/services/order_service.py](../../backend/app/services/order_service.py) — use `get_next_sequence` instead of the `COUNT(*)` query in `create_order`; implement `expire_orders`.
- Modify: [backend/app/tasks/order_tasks.py](../../backend/app/tasks/order_tasks.py) — wire `expire_pending_orders` to call `OrderService.expire_orders()`.
- Modify: [backend/app/middleware/rate_limit.py](../../backend/app/middleware/rate_limit.py) — implement `check_order_limit` body.
- Modify: [backend/app/routers/orders.py](../../backend/app/routers/orders.py) — add rate-limit dependency to `POST /orders`.

## Implementation Steps
1. **Create `OrderSequence` model** (`app/models/order_sequence.py`): `order_date: Mapped[date] = mapped_column(Date, primary_key=True)`, `last_seq: Mapped[int] = mapped_column(Integer, default=0, nullable=False)`.
2. **Migration `003_order_sequence_table.py`**: `op.create_table("order_sequences", sa.Column("order_date", sa.Date(), primary_key=True), sa.Column("last_seq", sa.Integer(), nullable=False, server_default="0"))`.
3. **Implement `get_next_sequence(db, today)`** in `order_code.py` using SQLAlchemy's Postgres `insert(...).on_conflict_do_update(...)` (`from sqlalchemy.dialects.postgresql import insert`): upsert `order_sequences` row for `today`, `last_seq = order_sequences.c.last_seq + 1`, `.returning(OrderSequence.last_seq)`; return the scalar result. This is a single atomic statement — no explicit `FOR UPDATE` needed.
4. **Wire into `create_order`**: replace the `SELECT func.count(...)` block with `seq_num = await get_next_sequence(self.db, today)`.
5. **Implement `expire_orders`** in `OrderService`: `UPDATE orders SET status='expired' WHERE status='pending_payment' AND expires_at < now()` via SQLAlchemy `update()`; `await self.db.commit()`; return affected row count for logging.
6. **Wire the Celery task**: in `order_tasks.py`, add an async helper `async def _expire_pending_orders_async(): async with async_session_factory() as db: count = await OrderService(db).expire_orders(); return count`, call it from the sync `expire_pending_orders()` task via `asyncio.run(...)`, log the returned count.
7. **Implement `check_order_limit`** in `rate_limit.py`: Redis key `f"order_limit:{request.client.host}"`, `INCR` + `EXPIRE settings.rate_limit_order_window` on first increment (same pattern as `_record_failed_admin_attempt`), raise `HTTPException(429, "Quá nhiều đơn hàng, vui lòng thử lại sau ít phút")` if count `> settings.rate_limit_order_max`.
8. **Register as a dependency**: in `orders.py`, add `_rate_limiter = RateLimiter()` and `Depends(_rate_limiter.check_order_limit)` to `create_order`'s signature (or a module-level function wrapper if `RateLimiter` needs redis client injected — check `get_redis()` usage pattern from `admin_auth.py` for consistency).

## Success Criteria
- [ ] Migration `003` applies cleanly; `order_sequences` table created.
- [ ] Load-test style check: fire 20 concurrent `POST /orders` requests (e.g. via a short script or `ab`/`hey`) — zero `IntegrityError`/500s, all 20 get unique `order_code`s.
- [ ] Manually set an order's `expires_at` to a past timestamp, wait for the Celery beat tick (or trigger the task manually via `celery_app.send_task(...)` / Flower) — status flips to `expired`.
- [ ] 6th `POST /orders` within 5 minutes from the same IP → `429`.
- [ ] Existing single-order creation flow (happy path) still returns a valid `order_code` + QR unaffected.

## Risk Assessment
- **Celery async/sync bridge:** `asyncio.run()` inside a Celery task can conflict if Celery's own event loop policy changes (e.g. if using `celery[eventlet]` or `gevent` pool) — verify the current worker pool type in `docker-compose.be.yml` before assuming plain `asyncio.run()` is safe; prefork (default) pool is fine.
- **Rate limit false positives:** shared-IP scenarios (e.g. one cafe network, NAT) could hit the 5-orders/5-min cap under legitimate multi-customer load — acceptable per PRD's own anti-spam design, but worth a heads-up to whoever owns the requirement if it proves too strict during a busy service window.

## Security Considerations
- Closes the standard review's Critical #1 (order-code race), #5 (auto-expiry), #6 (order rate limiting) — the anti-abuse trio the PRD explicitly relies on for the 20-30 concurrent customer target.

## Next Steps
- Independent of Phase 1 (disjoint files) — can be built/reviewed in parallel.
- Phase 3 does not depend on this phase.

