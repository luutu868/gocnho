---
phase: 4
title: "Frontend Production Readiness"
status: completed
priority: P1
effort: "0.5d"
dependencies: ["phase-03-vietqr-and-table-qr-completion"]
---

# Phase 4: Frontend Production Readiness

## Overview
Replace hardcoded `localhost` URLs in the admin panel, switch table-QR display from the 3rd-party `api.qrserver.com` service to the backend endpoint built in Phase 3, and fix the nginx config gap that would still 404 uploaded images even after the URL fix. Frontend + nginx config.

## Key Insights (from review)
- `AdminDashboard.tsx` hardcodes `const BASE_URL = "http://localhost:5173"` ([L354](../../frontend/src/pages/admin/AdminDashboard.tsx#L354)), used to build the table-QR URL shown/downloaded — dead outside dev.
- Product thumbnails hardcode `` `http://localhost:8000${p.primary_image_url}` `` ([L680](../../frontend/src/pages/admin/AdminDashboard.tsx#L680)) — `primary_image_url` is already a relative path like `/static/uploads/xxx.webp` ([admin_upload.py](../../backend/app/routers/admin_upload.py#L~75)).
- Table-QR modal currently fetches the QR image from `https://api.qrserver.com/v1/create-qr-code/?...` ([around L446-447](../../frontend/src/pages/admin/AdminDashboard.tsx#L446-L447)), leaking the production ordering URL to an uncontrolled 3rd party and making a core admin feature depend on that service's uptime.
- **New finding (not in original review, verified during planning):** even if the image `src` is fixed to a relative path, nginx's [default.conf](../../frontend/nginx/conf.d/default.conf) has **no `location /static/` block** — only `/api/` is proxied to the backend. Relative `/static/uploads/...` requests would 404 against nginx's SPA fallback (`try_files ... /index.html`) unless a proxy block is added. Both fixes are required together.
- `lib/constants.ts` already exports `API_BASE_URL = "/api/v1"` and `api/client.ts` already uses it as `axios.baseURL` — the correct relative-path pattern already exists elsewhere in the codebase, just not followed in these two spots.

## Requirements
- Functional: table-QR PNG and download work identically in dev and prod without code branching by environment; product thumbnails load correctly behind nginx in prod.
- Non-functional: no dependency on any 3rd-party service for a core feature.

## Architecture
```
Table QR modal:
  displayUrl = `${window.location.origin}/?table=${code}`        # for the "URL:" text shown to admin
  qrImageSrc = adminApi.tableQrImageUrl(table.id)                 # -> GET /api/v1/admin/tables/{id}/generate-qr (Phase 3)
  download   -> same endpoint, browser <a download> against a same-origin image now works correctly

Product thumbnail:
  src = p.primary_image_url                                       # already relative, e.g. /static/uploads/xxx.webp
                                                                    # served through nginx once the /static/ block is added

nginx:
  location /static/ { proxy_pass http://api:8000; ... }            # new block, mirrors the existing /api/ block
```

## Related Code Files
- Modify: [frontend/src/pages/admin/AdminDashboard.tsx](../../frontend/src/pages/admin/AdminDashboard.tsx) — remove `BASE_URL` constant, use `window.location.origin`; replace `api.qrserver.com` `<img>` with the Phase 3 backend endpoint; fix product-thumbnail `src`.
- Modify: [frontend/src/api/admin.ts](../../frontend/src/api/admin.ts) — add a helper returning the table QR image URL (e.g. `` `${API_BASE_URL}/admin/tables/${tableId}/generate-qr` ``), consistent with existing `adminApi.*` patterns.
- Modify: [frontend/nginx/conf.d/default.conf](../../frontend/nginx/conf.d/default.conf) — add `location /static/ { proxy_pass http://api:8000; ... }`.

## Implementation Steps
1. **Remove `BASE_URL` constant** in `AdminDashboard.tsx`; replace both usages (`qrTable` URL text, download link) with `window.location.origin`.
2. **Switch the QR `<img>` source** from the `api.qrserver.com` URL to the new backend endpoint (Phase 3's `generate-qr`), via a new `adminApi.getTableQrUrl(tableId)` helper in `api/admin.ts` returning `` `${API_BASE_URL}/admin/tables/${tableId}/generate-qr` `` — note this is an authenticated admin endpoint (cookie-based), so the `<img src>` must be same-origin (it is, since nginx proxies `/api/`) for the browser to attach the cookie.
3. **Fix the download button**: point it at the same backend URL; since it's now same-origin, the `download` attribute will work correctly (previously silently ignored on cross-origin `api.qrserver.com`).
4. **Fix product thumbnail**: change `` `http://localhost:8000${p.primary_image_url}` `` to just `` `${p.primary_image_url}` `` (already a root-relative path).
5. **Add nginx `/static/` proxy block** in `default.conf`, mirroring the existing `/api/` block (same `proxy_pass http://api:8000;` target, same header forwarding).
6. **Manual verification**: run `docker-compose.fe.yml` (or local nginx) + backend together, confirm both the table-QR image and a product thumbnail load through nginx without any `localhost:8000`/`localhost:5173` reference in network requests.

## Success Criteria
- [ ] `grep -rn "localhost:5173\|localhost:8000" frontend/src/` returns no matches.
- [ ] `grep -rn "api.qrserver.com" frontend/src/` returns no matches.
- [ ] Table-QR image and download button work when the app is accessed via a non-localhost origin (test via nginx container, not just `vite dev`).
- [ ] Product thumbnails render correctly when served through the nginx container (not just backend dev server).
- [ ] nginx config: `location /static/` block present and proxies to the backend, mirroring `/api/`.

## Risk Assessment
- **Auth on `<img src>`:** the QR image endpoint requires the admin cookie; browsers do send cookies on same-origin `<img>` requests by default, so this should work without extra `credentials` handling — but verify manually, since a cross-origin fallback (CDN, different subdomain) would silently break this in the future.
- **nginx reload:** the `/static/` block change requires a container rebuild/reload in any environment already running the old nginx image — note in deploy checklist.

## Security Considerations
- Removes the 3rd-party data-leak vector (production ordering URLs no longer sent to `api.qrserver.com`).

## Next Steps
- This is the last phase in this plan — after all 4 phases land, re-run `/ck:code-review --pending` on the combined diff before merge, then consider a follow-up plan for the "Out of Scope" items in `plan.md` (CORS env-driven config, pagination, dead-code deletion, `AdminDashboard.tsx` split).

