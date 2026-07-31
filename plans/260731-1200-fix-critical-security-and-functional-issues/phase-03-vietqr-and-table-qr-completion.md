---
phase: 3
title: "VietQR and Table QR Completion"
status: completed
priority: P1
effort: "1d"
dependencies: []
---

# Phase 3: VietQR and Table QR Completion

## Overview
Wire checkout to the admin-configurable `settings` table for VietQR bank info (currently hardcoded env vars, admin UI changes have zero effect), implement backend table-QR PNG generation, and fix the always-`false` table lookup endpoint. Backend-only — Phase 4 consumes the new QR endpoint.

## Key Insights (from review)
- `admin_settings.py` already has a full `_load_settings(db)` helper and `SETTING_KEYS` including `bank_name`, `bank_bin`, `bank_account_no`, `bank_account_name`, `bank_branch` — fully wired admin CRUD, just never read by checkout.
- `OrderService.create_order` and `get_order_by_code` both independently call `os.getenv("VIETQR_BANK_BIN", "970432")` etc. — two separate hardcoded reads, ignoring `settings` table entirely, and no 503 fallback when unset per PRD's requirement.
- `qr_service.py::generate_table_qr`/`zip_all_qr` are both `raise NotImplementedError`; `requirements.txt` already has `qrcode>=7.4.0` and `pillow>=10.3.0` installed and unused for this purpose.
- `GET /api/v1/tables/{code}` ([tables.py](../../backend/app/routers/tables.py#L11-L13)) ignores the `db` param and hardcodes `{"exists": False}`.
- `admin_tables.py`'s `generate-qr`/`generate-all-qr`/`download-qr` are placeholder/`501` — frontend currently compensates by calling a 3rd-party service (fixed in Phase 4, but needs this phase's real endpoint to switch to).
- No `PUBLIC_APP_URL`-style setting exists yet — table QR must encode a real public ordering URL (`{public_url}/?table={code}`), which differs from `request.headers["host"]` in a multi-domain/CDN deployment; safest is a new admin-configurable setting, not header-derived.

## Requirements
- Functional: changing bank info in Admin → Cấu hình immediately reflects in the next checkout QR; `GET /tables/{code}` correctly reports table existence/active status; admin can generate and download real QR PNGs for all tables without calling any external service.
- Non-functional: 503 with a clear Vietnamese message when bank info is unset (matches PRD's stated fallback behavior).

## Architecture
```
Checkout (OrderService):
  create_order / get_order_by_code
    → bank_settings = await _load_settings(db)  # reuse admin_settings._load_settings
    → if not bank_settings.get("bank_bin") or not bank_settings.get("bank_account_no"):
        raise HTTPException(503, "Chưa cấu hình thông tin thanh toán")
    → VietQRService.generate_qr_base64(bank_settings[...])

Table QR (QRService, using `qrcode` + `Pillow`):
  generate_table_qr(table_code, base_url) -> PNG bytes
    → qrcode.make(f"{base_url}/?table={table_code}") → BytesIO → return bytes
  zip_all_qr() -> ZIP bytes containing one PNG per active table

Table lookup:
  GET /tables/{code} -> SELECT Table WHERE code = :code AND is_active = true
    -> {"code": code, "exists": bool(table)}
```

## Related Code Files
- Modify: [backend/app/services/order_service.py](../../backend/app/services/order_service.py) — replace both `os.getenv(...)` blocks with `settings`-table lookups + 503 fallback.
- Modify: [backend/app/services/qr_service.py](../../backend/app/services/qr_service.py) — implement `generate_table_qr`, `zip_all_qr`.
- Modify: [backend/app/routers/tables.py](../../backend/app/routers/tables.py) — real DB lookup.
- Modify: [backend/app/routers/admin_tables.py](../../backend/app/routers/admin_tables.py) — `generate-qr`/`generate-all-qr`/`download-qr` return real PNG/ZIP via `QRService`.
- Modify: [backend/app/config.py](../../backend/app/config.py) — add `public_app_url: str = "http://localhost:5173"` setting (dev default; set via env in prod).
- Modify: [backend/app/routers/admin_settings.py](../../backend/app/routers/admin_settings.py) — expose `public_app_url` alongside bank settings if admin-editable is desired (or keep env-only — decide during implementation based on whether ops wants UI control; env-only is simpler, matches YAGNI).

## Implementation Steps
1. **Add a shared settings-loader helper** (avoid duplicating `_load_settings` — either import it from `admin_settings.py` into `order_service.py`, or extract to a small `app/services/settings_service.py` if that creates a circular import; check import direction before choosing).
2. **Checkout bank-info wiring**: in `OrderService.create_order` and `get_order_by_code`, replace the `os.getenv` triplet with a call to the shared settings loader; if `bank_bin`/`account_no` missing/empty, `raise HTTPException(503, "Cửa hàng chưa cấu hình thông tin thanh toán, vui lòng liên hệ nhân viên")`.
3. **Add `public_app_url` setting** to `config.py` (env-driven, default `http://localhost:5173` for dev parity with current hardcoded frontend value).
4. **Implement `QRService.generate_table_qr`**: `import qrcode`; `img = qrcode.make(f"{base_url}/?table={table_code}")`; save to `BytesIO`, return `.getvalue()`.
5. **Implement `QRService.zip_all_qr`**: query all active tables, loop calling `generate_table_qr` per table, write each PNG into a `zipfile.ZipFile(BytesIO(), "w")`, return the buffer's bytes.
6. **Wire `admin_tables.py` endpoints**: `generate-qr` returns `Response(content=png_bytes, media_type="image/png")`; `download-qr` (bulk) returns `Response(content=zip_bytes, media_type="application/zip")` with `Content-Disposition: attachment; filename=table-qrs.zip`.
7. **Fix `tables.py` lookup**: `SELECT Table WHERE code == code`; return `{"code": code, "exists": table is not None and table.is_active}`.

## Success Criteria
- [ ] Changing `bank_account_no` via `PUT /admin/settings` and re-fetching a QR (new order or `GET /orders/{code}`) reflects the new value immediately.
- [ ] Deleting all bank settings rows → checkout returns `503` with the Vietnamese fallback message, not a 500 or a QR with empty/garbage data.
- [ ] `GET /admin/tables/{id}/generate-qr` returns a valid, scannable PNG encoding `{public_app_url}/?table={code}`.
- [ ] `GET /admin/tables/download-qr` returns a ZIP with one PNG per active table.
- [ ] `GET /api/v1/tables/{code}` returns `exists: true` for a real active table code and `exists: false` for a nonexistent/inactive one.

## Risk Assessment
- **Shared helper placement:** importing `admin_settings._load_settings` directly into `order_service.py` risks a circular import if `admin_settings.py` ever imports from `services/`; verify import graph before choosing between "import directly" vs. "extract to `settings_service.py`" — prefer extraction if any doubt (cheap, avoids the risk entirely).
- **VietQR TLV encoding for non-ASCII bank/account names** (Medium finding, not in this phase's scope) — flagged for a follow-up once this phase makes the settings path live (currently latent/unreachable, becomes reachable after this phase ships).

## Security Considerations
- No new attack surface — QR generation is server-side, deterministic, admin-only (behind `require_password_changed` from Phase 1 once that ships).

## Next Steps
- Phase 4 depends on this phase's `generate-qr`/`download-qr` endpoints existing before switching the frontend off the 3rd-party service.

