# CLASSZ Codex Handoff

This document provides everything a new agent (Claude Code, Codex, or any AI assistant) needs to continue developing CLASSZ without relying on chat history.

## Project Identity

CLASSZ is a multi-teacher EdTech SaaS platform. Arabic-first, AI-assisted, concept-based learning. Monolith-first architecture with module isolation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy 2.x async, Alembic, PostgreSQL 16, Pydantic v2, JWT (python-jose), bcrypt |
| Frontend | React 19, TypeScript, Vite 8, TailwindCSS 4, TanStack Router, TanStack Query, Zustand, Radix UI, Framer Motion |
| Infra | Docker Compose (postgres, backend, frontend) |

## Directory Structure

```
D:\CLASSZ\
├── backend/                    # FastAPI backend (Python 3.12)
│   ├── app/
│   │   ├── core/               # Config, security, permissions
│   │   ├── db/                 # SQLAlchemy base, session, migrations registry
│   │   ├── models/             # Shared ORM models (User)
│   │   ├── modules/            # Feature modules (router/service/schemas/models each)
│   │   └── main.py             # FastAPI app factory
│   ├── alembic/                # Database migrations (12 migrations)
│   └── requirements.txt
├── classz-frontend-prototype/  # PRODUCTION FRONTEND (SPA mode)
│   ├── src/
│   │   ├── routes/             # 83 file-based routes (TanStack Router)
│   │   ├── components/         # UI components (brand, layout, premium, ui)
│   │   ├── lib/                # Utilities, API client, auth store, mock data
│   │   └── main.tsx            # SPA entry point
│   ├── index.html              # Vite SPA entry
│   └── vite.config.ts          # Vite + TanStack Router plugin + /api proxy
├── frontend/                   # DEPRECATED — old React 18 frontend
├── docs/                       # Project documentation
├── docker-compose.yml          # Orchestration (postgres + backend + frontend)
└── CLASSZ_ARCHITECTURE.md      # Product vision and principles
```

## Key Decisions

1. **`classz-frontend-prototype/` is the production frontend**, not `frontend/`. Do not develop `frontend/` further.
2. **SPA mode** — SSR was stripped. TanStack Start removed, TanStack Router kept. SSR files archived in place.
3. **Prototype flattened** — The prototype's `.git` was removed and its files added directly to this repo. Original Lovable history (75 commits, final `b53f92c`) is preserved at `https://github.com/drgharieb82-blip/classz-frontend-prototype.git`.
4. **API proxy** — Vite dev server proxies `/api` to `http://127.0.0.1:8000`.
5. **Auth backend implemented** — `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me` are live. `get_current_user` JWT dependency and `require_roles()` work. Frontend login page still uses demo role selector (wiring is next). 15 tests cover all auth paths.

## Backend API Summary

60 implemented endpoints across 16 active modules. All endpoints are currently unauthenticated. Key modules:

- **Courses/Chapters/Lessons/Blocks/Videos** — Full CRUD
- **Question Bank** — 7 question types, media, tags, categories
- **Quizzes/Attempts/Results** — Full lifecycle with auto-grading
- **Assignments/Grading** — Submissions, manual grading, score recalculation
- **Progress** — Lesson start/update/complete tracking
- **Anti-Cheating** — Focus loss, tab switch, copy/paste detection
- **Teacher Dashboard** — Aggregated stats
- **AI Content** — 7 content type generators (depends on unimplemented `ai_core`)

7 stub modules with empty routers: users, payments, wallets, reports, notifications, parents, admin.

## Frontend State

Authentication is wired end-to-end. Login and register pages call the real backend API. UserMenu shows the authenticated user's name and email. Token is validated on app startup via `GET /api/auth/me`.

All other 83 route pages still render UI with mock data from `src/lib/mock.ts`. No route guards are enforced yet — dashboards are freely browsable for demo purposes.

Infrastructure:
- `src/lib/api/client.ts` — fetch wrapper with JWT and 401 handling
- `src/lib/api/auth.ts` — `loginApi()`, `registerApi()`, `getMeApi()`
- `src/lib/stores/auth-store.ts` — Zustand store for auth state (token + user persisted in localStorage)
- `src/lib/auth-guard.ts` — `requireAuth()` and `requireRole()` route guards (exist but not applied to routes)
- TanStack Query client is initialized in the router context

## What to Build Next

Priority order:
1. **Wire course catalog** to `GET /api/courses`
2. **Wire academic core** — lessons, blocks, videos, progress
3. **Wire assessments** — question bank, quizzes, assignments, grading
4. **Wire teacher dashboard** to `GET /api/teacher-dashboard/*`
5. **Tighten route guards** — apply `requireAuth`/`requireRole` to protected routes
6. **Admin user management** — create teacher/admin accounts via admin panel

## Related Documents

- `CLASSZ_ARCHITECTURE.md` — Product vision, principles, platform modes, roles
- `docs/MASTER_PLAN.md` — Phased delivery plan (15 phases)
- `docs/DESIGN_SYSTEM.md` — Visual language, theme tokens, typography
- `docs/COMPONENTS_LIBRARY.md` — UI component specifications
- `docs/IMPLEMENTATION_LOG.md` — What was built, when, and why
- `docs/API_FRONTEND_MAPPING.md` — Backend endpoint to frontend page mapping
