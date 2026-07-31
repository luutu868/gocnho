---
title: "Fix Critical Security and Functional Issues"
description: "Remediate the 11 Critical findings from the 2026-07-30 code review (Stage 2 + adversarial pass) covering backend/ and frontend/"
status: completed
priority: P1
branch: "master"
tags: [security, bugfix, auth, order-integrity]
blockedBy: []
blocks: []
created: "2026-07-31T04:20:32.774Z"
createdBy: "ck:plan"
source: skill
---

# Fix Critical Security and Functional Issues

## Overview

Fixes the 11 **Critical**-severity findings from the full codebase review (`/ck:code-review`) done on 2026-07-30, verified by a dedicated adversarial red-team pass on the auth surface. Scope is deliberately limited to Critical items only — High/Medium/Low findings (CORS hardcoding, N+1 queries, pagination, dead `app/auth/*` stubs, `AdminDashboard.tsx` 956-line split, etc.) are **out of scope** for this plan and tracked separately (see "Out of Scope" below).

**Source of truth for findings:** this plan was derived directly from the review conversation, not re-researched — file:line references below were re-verified against current code before phase files were written.

## Phases

| Phase | Name | Status | Findings Covered |
|-------|------|--------|-------------------|
| 1 | [Auth Security Hardening](./phase-01-auth-security-hardening.md) | Completed | JWT secret unification, forced password change, admin token revocation, cookie `Secure` flag |
| 2 | [Order Integrity and Anti-Abuse](./phase-02-order-integrity-and-anti-abuse.md) | Completed | Order-code race condition, order auto-expiry, order-creation + PIN rate limiting |
| 3 | [VietQR and Table QR Completion](./phase-03-vietqr-and-table-qr-completion.md) | Completed | VietQR settings wiring, backend table-QR generation, table lookup fix |
| 4 | [Frontend Production Readiness](./phase-04-frontend-production-readiness.md) | Completed | Hardcoded `localhost` URLs, 3rd-party QR service removal, nginx static-file proxy gap |

**Execution order matters:** Phase 1 and 2 are independent of each other but both should land before Phase 3/4 since Phase 3 reuses the settings-loading pattern hardened conceptually in Phase 1 (no hard code dependency, just risk sequencing — ship auth fixes first). Phase 4 depends on Phase 3 (frontend QR modal switches from the 3rd-party service to the backend endpoint built in Phase 3).

## Dependencies

- Phase 4 `blockedBy` Phase 3 (frontend consumes the backend QR endpoint built in Phase 3).
- Phase 1 and Phase 2 have no inter-dependency — can be implemented in either order or in parallel by different developers (touch disjoint files).

## Out of Scope (tracked for follow-up, not fixed here)

- CORS hardcoded to `localhost` ([backend/app/main.py](../../backend/app/main.py#L34-L40)) — High, not Critical (today's exact-match allowlist blocks external origins; risk is a rushed prod misconfiguration, not an active hole).
- N+1 queries in order creation, missing pagination on list endpoints, dead `app/auth/*` stub modules, `services/image_service.py` dead stub — High/Medium, functional cleanup not security-blocking.
- `AdminDashboard.tsx` 956-line file split, `catch (e: any)` cleanup, `alert()`/`confirm()` replacement — Medium, code-quality only.
- Username/staff_code timing-enumeration side channel, distributed PIN-spray IP-keying — Medium per adversarial adjudication; Phase 2's rate-limiter work incidentally hardens this (same `rate_limit.py` file) but is not the primary driver.

## Rollout Note

Phase 1 changes the JWT payload shape (`ver` claim) and forced-password-change gate — **all existing admin sessions will be invalidated** on deploy (expected: `token_version` migration defaults existing rows to `1`, but any admin logged in with a token issued before deploy has no `ver` claim, which fails the new check → forced re-login). Communicate this to whoever operates the admin panel before shipping Phase 1.
