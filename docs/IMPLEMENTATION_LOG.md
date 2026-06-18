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
