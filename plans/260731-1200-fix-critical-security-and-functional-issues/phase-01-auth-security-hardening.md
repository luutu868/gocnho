---
phase: 1
title: "Auth Security Hardening"
status: completed
priority: P1
effort: "1d"
dependencies: []
---

# Phase 1: Auth Security Hardening

## Overview
Close 4 Critical auth holes verified by the adversarial review: divergent/weak JWT secret, no forced-password-change enforcement, no admin token revocation, and cookies missing `Secure`. Scope is backend-only (`backend/app/`).

## Key Insights (from review)
- `admin_auth.py` signs/verifies JWTs with its own `os.getenv("JWT_SECRET", "cafe-gocnho-secret-key-change-in-prod")` instead of `settings.jwt_secret`. Pydantic-settings loads `.env` into `settings`; plain `os.getenv` does NOT read `.env` — only real process env vars. If ops only sets `JWT_SECRET` in `.env`, this router silently falls back to the **hardcoded, source-committed** secret.
- The dead `backend/app/auth/admin_auth.py` (unused, confirmed via grep) already does this correctly (`settings.jwt_secret`) — reuse that pattern, then this plan's Phase-adjacent cleanup (out of scope here) can delete the dead file later.
- `must_change_password` is returned to the client but never enforced server-side — `get_current_admin` doesn't check `password_changed_at`.
- JWT is stateless with no revocation — logout/password-change don't invalidate previously issued tokens for up to `JWT_EXPIRY_HOURS` (24h).
- Staff cookie: `secure=False` hardcoded ([staff_auth_service.py](../../backend/app/services/staff_auth_service.py#L69)). Admin cookie: `secure` param omitted entirely, defaults `False` ([admin_auth.py](../../backend/app/routers/admin_auth.py#L98-L103)).
- `settings.app_env` already exists ([config.py](../../backend/app/config.py#L9)) — use it to gate `secure=True` / fail-fast checks without adding a new config field.

## Requirements
- Functional: existing login/logout/change-password flows keep working; only the underlying secret source, cookie flags, and revocation state change.
- Non-functional: no plaintext secrets in source for production; deploying this must force re-login for all admins (see plan.md Rollout Note) — acceptable, communicate before shipping.

## Architecture
```
Admin login → create_token(admin_id, username, admin.token_version)
            → JWT payload: {sub, username, ver, exp, iat}, signed with settings.jwt_secret
            → Set-Cookie admin_access_token; secure=(app_env=="production")

Admin request → get_current_admin() → jwt.decode(settings.jwt_secret)
                                     → payload.ver != admin.token_version → 401 "Token revoked"
                                     → admin.password_changed_at is None → (allowed only for /me, /change-password, /logout)

Change password → bump admin.token_version += 1 → all prior JWTs fail the ver check immediately
```

## Related Code Files
- Modify: [backend/app/config.py](../../backend/app/config.py) — no schema change, `jwt_secret`/`app_env` already present.
- Modify: [backend/app/routers/admin_auth.py](../../backend/app/routers/admin_auth.py) — remove local `JWT_SECRET`/`os.getenv`, use `settings.jwt_secret`; add `ver` claim; add `require_password_changed` dependency; set `secure=` on cookie; bump `token_version` in `change_password`.
- Modify: [backend/app/services/staff_auth_service.py](../../backend/app/services/staff_auth_service.py) — `secure=` env-driven instead of hardcoded `False`.
- Modify: [backend/app/models/admin.py](../../backend/app/models/admin.py) — add `token_version` column (default `1`).
- Create: `backend/alembic/versions/002_admin_token_version.py` — migration adding the column with `server_default='1'`.
- Modify (import swap only, mechanical): [backend/app/routers/admin_categories.py](../../backend/app/routers/admin_categories.py), [admin_orders.py](../../backend/app/routers/admin_orders.py), [admin_products.py](../../backend/app/routers/admin_products.py), [admin_settings.py](../../backend/app/routers/admin_settings.py), [admin_staff.py](../../backend/app/routers/admin_staff.py), [admin_tables.py](../../backend/app/routers/admin_tables.py), [admin_toppings.py](../../backend/app/routers/admin_toppings.py), [admin_upload.py](../../backend/app/routers/admin_upload.py) — swap `Depends(get_current_admin)` → `Depends(require_password_changed)`.
- Modify: [backend/app/main.py](../../backend/app/main.py) — add a startup check: if `settings.app_env == "production"` and `settings.jwt_secret in ("dev-secret",)`, raise `RuntimeError` on boot.

## Implementation Steps
1. **Migration:** add `token_version: Mapped[int] = mapped_column(Integer, default=1, server_default="1", nullable=False)` to `Admin` model; generate `002_admin_token_version.py` (`op.add_column("admins", sa.Column("token_version", sa.Integer(), server_default="1", nullable=False))`).
2. **Unify JWT secret:** in `admin_auth.py`, delete the module-level `JWT_SECRET = os.getenv(...)` line and `import os` if now unused; replace both `jwt.encode(..., JWT_SECRET, ...)` and `jwt.decode(token, JWT_SECRET, ...)` calls with `settings.jwt_secret` (`from app.config import settings`).
3. **Startup fail-fast:** in `main.py`, on app startup (e.g. inside the existing `@app.on_event("startup")` or lifespan handler — check `main.py` for the current pattern first), raise if `settings.app_env == "production" and settings.jwt_secret == "dev-secret"`.
4. **Add `ver` claim:** update `create_token(admin_id, username)` → `create_token(admin_id, username, token_version)`; include `"ver": token_version` in the JWT payload; update the one call site in `admin_login`.
5. **Revocation check:** in `get_current_admin`, after decoding, compare `payload.get("ver") != admin.token_version` → `raise HTTPException(401, "Token revoked, please login again")`.
6. **Forced password-change gate:** add a new dependency `require_password_changed(admin: Admin = Depends(get_current_admin)) -> Admin` in `admin_auth.py`: raise `HTTPException(403, "Vui lòng đổi mật khẩu trước khi tiếp tục")` if `admin.password_changed_at is None`. Export it; keep `/me`, `/change-password`, `/logout` on the raw `get_current_admin` (they must work even before the password is changed).
7. **Swap dependency in the 8 admin routers** listed above: change import + `Depends(get_current_admin)` → `Depends(require_password_changed)`.
8. **Bump token_version on password change:** in `change_password`, add `token_version=Admin.token_version + 1` to the existing `update(Admin).where(...).values(...)` call.
9. **Cookie `Secure` flag:** in `admin_auth.py`'s `response.set_cookie(...)`, add `secure=(settings.app_env == "production")`. In `staff_auth_service.py`, change `secure=False,  # False for local dev` to `secure=(settings.app_env == "production"),` (import `settings` from `app.config`).
10. **Compile check:** run backend import/syntax check (`python -m py_compile` on changed files or start uvicorn) — no test suite exists yet for auth per the review's "sparse test coverage" note, so manual verification via `curl` login/me/change-password/logout flow is required (see Success Criteria).

## Success Criteria
- [ ] `grep -r "os.getenv(\"JWT_SECRET\"" backend/app/routers/admin_auth.py` returns no match.
- [ ] Alembic migration applies cleanly (`alembic upgrade head`) and existing admin rows get `token_version=1`.
- [ ] Logging in as `admin`/`admin123` on a fresh seed, then calling any admin-only endpoint (e.g. `GET /api/v1/admin/products`) before changing password → `403`.
- [ ] After `POST /change-password`, the old cookie's JWT (captured before the call) is rejected (`401 Token revoked`) on the next admin request.
- [ ] `docker-compose.be.yml`/`.env` deploy path: setting `JWT_SECRET` only in `.env` now correctly changes both `settings.jwt_secret` and the router's signing key (single source of truth).
- [ ] Admin/staff cookies carry `Secure` when `APP_ENV=production`; still work over `http://localhost` in dev (`APP_ENV=development`, default).
- [ ] Manual smoke test: staff login → dashboard → logout still works end-to-end (session-based flow untouched by this phase besides the cookie flag).

## Risk Assessment
- **Breaking change:** all admins get logged out on deploy (JWT `ver` claim missing on old tokens) — communicate before shipping, not a bug.
- **Migration risk:** low — single nullable-safe column addition with a server default; no backfill logic needed.
- **Regression risk:** swapping `Depends(get_current_admin)` → `Depends(require_password_changed)` across 8 files is mechanical but must be done for ALL of them or the gate is inconsistent — verify via `grep -rn "get_current_admin" backend/app/routers/` after the change (should only remain in `admin_auth.py` itself, plus the 3 exempted endpoints).

## Security Considerations
- This phase directly closes the adversarial review's Critical findings #1–#5 (auth bypass via weak/divergent secret, no forced password change, no revocation, plaintext cookie transmission).
- Does not address CORS hardcoding (High, deferred) or PIN-lockout IP-keying (Medium, addressed incidentally in Phase 2).

## Next Steps
- After this phase, re-run the adversarial reviewer scoped to the diff to confirm no regressions before merging.
- Phase 2 can proceed independently (disjoint files: `order_service.py`, `order_tasks.py`, `rate_limit.py`).

