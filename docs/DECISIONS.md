# CLASSZ Architectural Decisions

Records key architectural and product decisions that affect how the codebase should be developed.

## D001: Production Frontend (2026-06-18)

**Decision:** `classz-frontend-prototype/` is the production frontend. `frontend/` is deprecated.

**Context:** Two frontend codebases existed. The prototype (React 19, TanStack Router, Radix UI, 83 routes, 9 roles) is significantly more complete than the original (React 18, React Router, 22 modules).

**Consequences:** All frontend work targets `classz-frontend-prototype/`. The old `frontend/` directory is preserved but not developed further.

## D002: SPA over SSR (2026-06-18)

**Decision:** Convert the prototype from TanStack Start (SSR) to pure SPA mode.

**Context:** The prototype was built with Lovable using TanStack Start for SSR. The CLASSZ backend is FastAPI — running a Node.js SSR server alongside it adds deployment complexity with minimal benefit (only public marketing pages need SEO).

**Consequences:** SSR files (`server.ts`, `start.ts`, etc.) are archived in place. `index.html` + `src/main.tsx` provide the SPA entry. Vite proxies `/api` to FastAPI. If SEO for public pages becomes critical, SSR can be re-enabled since the files are preserved.

## D003: Flatten Prototype Into Main Repo (2026-06-18)

**Decision:** Remove the prototype's `.git` directory and include its files as regular files in the CLASSZ repo. Do not use git submodule or git subtree.

**Context:** The prototype was cloned from Lovable as a separate git repo (`https://github.com/drgharieb82-blip/classz-frontend-prototype.git`). Its history is 75 commits, 67 of which are auto-generated "Changes" messages from a single afternoon (2026-06-15). The history has no forensic or code review value. The final commit before flattening was `b53f92c` on `main`.

**Consequences:** The prototype's git history is gone from the local repo. It remains preserved on GitHub at `https://github.com/drgharieb82-blip/classz-frontend-prototype.git` (commit `b53f92c`). All future frontend changes are tracked in the main CLASSZ repo.

## D004: Monolith-First Architecture (Founding)

**Decision:** Build as a modular monolith with isolated feature modules.

**Context:** Starting a SaaS product with microservices adds premature complexity. Module boundaries (router/service/schemas/models per module) allow future extraction without current overhead.

**Consequences:** All backend modules live in `backend/app/modules/`. Docker Compose runs a single backend service. Module boundaries must be maintained — no cross-module model imports.

## D004: Async-First Database Layer (Founding)

**Decision:** Use SQLAlchemy 2.x async with asyncpg throughout.

**Context:** FastAPI is async-native. Blocking database calls would undermine concurrency.

**Consequences:** All database operations use `AsyncSession`. Alembic migrations use async engine. `selectinload()` for relationship loading to avoid N+1.

## D005: Arabic-First Internationalization (Founding)

**Decision:** Support Arabic and English from day one with RTL toggle.

**Context:** Target market is Arabic-speaking students and teachers. Retrofitting RTL is expensive.

**Consequences:** Frontend uses i18n with `dir` attribute toggling. Fonts include Cairo and Tajawal for Arabic. All UI components must work in both LTR and RTL modes.

## D006: Role Strategy — 5 Backend + 4 UI-Only (2026-06-19)

**Decision:** Backend enforces 5 roles (admin, teacher, assistant, student, parent). Frontend defines 4 additional UI-only roles (developer, content, finance, superadmin) that have no backend representation.

**Context:** The frontend prototype was built with 9 roles for demo purposes. The 4 extra roles have dashboard pages but no backend modules or API endpoints. Adding them to the backend `Role` enum would require a database migration and create empty roles that can't do anything.

**Consequences:** Self-registration is limited to `student` and `parent`. Users cannot log in as developer/content/finance/superadmin — those dashboards exist for demo browsing only. When backend modules for these roles are built (admin panel, finance, etc.), the roles will be added to the backend enum via migration. The frontend `Role` type remains the superset.

## D007: Conservative Route Guards (2026-06-19)

**Decision:** Auth guards (`requireAuth`, `requireRole`) exist but are not applied to any route's `beforeLoad` in Milestone 1. All dashboards remain freely browsable.

**Context:** Locking routes would break demo browsing of role dashboards (no teacher/admin accounts exist yet to create via API). Route guards will be tightened incrementally as backend modules come online and admin user-creation is implemented.

**Consequences:** Any visitor can browse any dashboard. This is intentional for the current development phase. Guards will be applied per-role as the backend catches up.
