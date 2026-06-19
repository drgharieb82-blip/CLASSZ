# CLASSZ Implementation Log

Tracks what has been built, when, and key decisions made during implementation. This is the ground truth for any agent or developer continuing the work.

## Milestone 0 — SPA Migration Prep (2026-06-18)

**Branch:** `lovable-ui-import`

**Decision:** `classz-frontend-prototype/` is the official production frontend. The old `frontend/` directory is preserved but deprecated.

**Decision:** Convert prototype from TanStack Start (SSR) to pure SPA mode using TanStack Router. Keep FastAPI backend and docker-compose architecture.

### What Changed

| File | Action | Details |
|------|--------|---------|
| `classz-frontend-prototype/index.html` | Created | SPA entry point with fonts, meta tags, `<div id="root">` |
| `classz-frontend-prototype/src/main.tsx` | Created | React root render with `RouterProvider` |
| `classz-frontend-prototype/src/lib/api/client.ts` | Created | Fetch-based API client with JWT injection and 401 redirect |
| `classz-frontend-prototype/src/lib/stores/auth-store.ts` | Created | Zustand store for user, token, login/logout with localStorage persistence |
| `classz-frontend-prototype/src/lib/auth-guard.ts` | Created | `requireAuth()` and `requireRole()` helpers using TanStack Router `redirect()` |
| `classz-frontend-prototype/Dockerfile` | Created | Multi-stage Docker build (dev with Vite, prod with nginx) |
| `classz-frontend-prototype/vite.config.ts` | Modified | Replaced `@lovable.dev/vite-tanstack-config` with direct Vite plugins; added `/api` proxy to `http://127.0.0.1:8000` |
| `classz-frontend-prototype/package.json` | Modified | Removed `@tanstack/react-start`, `@lovable.dev/vite-tanstack-config`, `nitro`. Added `zustand`, `lightningcss`. Updated scripts |
| `classz-frontend-prototype/src/routes/__root.tsx` | Modified | Removed SSR shell (`shellComponent`, `HeadContent`, `Scripts`, `head()`). Kept `RootComponent`, error boundary, 404 |
| `classz-frontend-prototype/tsconfig.json` | Modified | Added `exclude` for archived SSR files |
| `classz-frontend-prototype/src/routeTree.gen.ts` | Modified | Replaced `@tanstack/react-start` module declaration with `@tanstack/react-router` registration |
| `classz-frontend-prototype/src/components/layout/UserMenu.tsx` | Modified | Changed `/settings/*` links from `<Link>` to `<a>` (routes don't exist yet, pre-existing issue) |
| `docker-compose.yml` | Modified | Changed frontend `build.context` from `./frontend` to `./classz-frontend-prototype` |

### SSR Files Preserved (Archived, Not Imported)

These files are no longer referenced by the SPA entry point but are kept intact for reversibility:

- `src/server.ts` — SSR server entry
- `src/start.ts` — TanStack Start middleware
- `src/lib/config.server.ts` — Server-only config
- `src/lib/api/example.functions.ts` — `createServerFn` example
- `src/lib/error-capture.ts` — SSR error capture
- `src/lib/error-page.ts` — Server-side error HTML
- `src/lib/lovable-error-reporting.ts` — Lovable platform reporting

### Validation Results

- `tsc -b`: passes (0 errors)
- `vite build`: passes (built in ~1.5s)
- `npm install`: 399 packages, 0 vulnerabilities

### How to Revert to SSR Mode

1. Restore `vite.config.ts` to the `@lovable.dev/vite-tanstack-config` wrapper
2. Restore `package.json` deps (`@tanstack/react-start`, `@lovable.dev/vite-tanstack-config`, `nitro`)
3. Restore `__root.tsx` (re-add `shellComponent`, `head()`, `Scripts`, `HeadContent`)
4. Remove `index.html` and `src/main.tsx`
5. Archived SSR files are still in place

---

## Milestone 1A — Backend Auth Endpoints (2026-06-19)

**Branch:** `lovable-ui-import`

**Commit 1 of 3** for Milestone 1 (Authentication).

### What Changed

| File | Action | Details |
|------|--------|---------|
| `backend/app/modules/auth/dependencies.py` | Created | `get_current_user` dependency — extracts JWT from `Authorization: Bearer` header, decodes via python-jose, loads User from DB, rejects inactive accounts |
| `backend/app/modules/auth/schemas.py` | Expanded | Added `LoginRequest`, `RegisterRequest` (with role validator limiting self-registration to student/parent), `AuthResponse` (token + user). Kept existing `Token`. |
| `backend/app/modules/auth/service.py` | Expanded | Added `authenticate_user(email, password, session)` and `register_user(data, session)`. Kept existing `issue_access_token`. |
| `backend/app/modules/auth/router.py` | Expanded | Added `POST /login` (401 invalid creds, 403 inactive), `POST /register` (201 success, 409 duplicate email), `GET /me` (returns authenticated user). Kept existing `GET /jwt-config`. |
| `backend/app/core/permissions.py` | Fixed | `require_roles()` now uses `Depends(get_current_user)` instead of broken `current_user: User | None = None` default. Removed redundant 401 check (handled by dependency). |

### New Endpoints

| Method | Path | Auth | Success | Errors |
|--------|------|------|---------|--------|
| POST | `/api/auth/login` | None | 200 + token + user | 401 bad creds, 403 inactive |
| POST | `/api/auth/register` | None | 201 + token + user | 409 duplicate, 422 validation |
| GET | `/api/auth/me` | Bearer JWT | 200 + user | 401 missing/invalid/expired token |

### Design Decisions

- **`HTTPBearer` over `OAuth2PasswordBearer`**: The frontend sends `Authorization: Bearer <token>` from the Zustand store. `HTTPBearer` matches this pattern directly.
- **Self-registration restricted**: Only `student` and `parent` roles can self-register. Teacher/admin accounts will be admin-created in a future milestone.
- **No migration needed**: The `users` table already has all required columns (`email`, `hashed_password`, `full_name`, `role`, `is_active`).
- **Existing endpoints unchanged**: All 60 existing endpoints remain unauthenticated. Auth will be progressively added in later milestones.

### Validation

- All 5 modified/created files pass `py_compile`
- FastAPI app starts and registers 4 auth routes: `/api/auth/jwt-config`, `/api/auth/login`, `/api/auth/register`, `/api/auth/me`

---

## Milestone 1B — Auth Tests (2026-06-19)

**Branch:** `lovable-ui-import`

**Commit 2 of 3** for Milestone 1 (Authentication).

### What Changed

| File | Action | Details |
|------|--------|---------|
| `backend/tests/test_auth.py` | Created | 15 async tests covering login, register, GET /me, and register→login→me round-trip. Uses in-memory SQLite + httpx ASGI transport — no Docker or PostgreSQL required. |
| `backend/app/modules/auth/dependencies.py` | Fixed | `get_current_user` now converts JWT `sub` string to `uuid.UUID` before querying. Without this, SQLAlchemy's PostgreSQL UUID type crashes when comparing with a plain string. |
| `backend/requirements.txt` | Modified | Added `bcrypt<5` pin — passlib 1.7.4's wrap-bug detection is incompatible with bcrypt 5.x. |

### Tests

| Test | Verifies |
|------|----------|
| `test_login_success` | 200, token + user returned, correct role |
| `test_login_wrong_password` | 401, "Invalid email or password" |
| `test_login_nonexistent_email` | 401 |
| `test_login_inactive_user` | 403, "Account deactivated" |
| `test_register_student` | 201, default role is student |
| `test_register_parent` | 201, explicit parent role accepted |
| `test_register_duplicate_email` | 409, "Email already registered" |
| `test_register_restricted_role_teacher` | 422, teacher can't self-register |
| `test_register_restricted_role_admin` | 422, admin can't self-register |
| `test_register_weak_password` | 422, password < 8 chars rejected |
| `test_me_authenticated` | 200, returns user data from valid token |
| `test_me_no_token` | 401, no Authorization header |
| `test_me_invalid_token` | 401, garbage token |
| `test_me_expired_token` | 401, token with past expiry |
| `test_register_then_login` | Full round-trip: register → login → me |

### Bugs Found and Fixed

1. **UUID string mismatch in `get_current_user`**: The JWT `sub` claim is a string (e.g. `"5b3f013b-c478-47de-..."`) but `User.id` is a PostgreSQL UUID column. SQLAlchemy's UUID type requires a `uuid.UUID` object for comparison, not a raw string. Fixed by parsing `user_id` through `uuid.UUID()` before the query.

2. **bcrypt 5.x incompatibility**: passlib 1.7.4's internal wrap-bug detection sends a >72-byte test password. bcrypt 5.x raises `ValueError` for this. Pinned `bcrypt<5` in requirements.txt. This was a pre-existing issue that would also affect production.

### Test Infrastructure

- **No shared fixtures or conftest.py** — all test helpers are local to `test_auth.py`
- **In-memory SQLite** via `aiosqlite` — tables created/dropped per test
- **httpx ASGI transport** — tests call the real FastAPI app without a running server
- **Dev dependencies** (not in requirements.txt): `pytest`, `pytest-asyncio`, `httpx`, `aiosqlite`, `greenlet`

### Validation

```
15 passed, 3 warnings in 14.42s
```
