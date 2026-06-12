# CLASSZ

CLASSZ is a modular, browser-based education platform foundation for a multi-teacher EdTech SaaS. This repository is intentionally monolith-first while keeping backend and frontend feature modules isolated enough to evolve into services later.

## Stack

- Backend: FastAPI, SQLAlchemy 2.x async, Alembic, PostgreSQL, Pydantic v2, JWT helpers, role enum foundations.
- Frontend: React, TypeScript, Vite, TailwindCSS, React Router, TanStack Query, Zustand.
- Infrastructure: Docker Compose with PostgreSQL, backend, and frontend services.

## Structure

```text
backend/app
  core/          application settings, security, permissions
  db/            SQLAlchemy base and async session
  models/        shared persistence models
  modules/       feature modules and future bounded contexts
  schemas/       shared Pydantic schemas
  services/      shared service layer utilities

frontend/src
  app/           providers and application setup
  layouts/       role-specific layout shells
  modules/       feature module frontends
  components/    shared UI components
  hooks/         reusable React hooks
  store/         Zustand stores
  router/        route registration
```

## Getting Started

1. Create local environment values:

```bash
cp .env.example .env
```

2. Start the platform:

```bash
docker compose up --build
```

3. Run database migrations:

```bash
docker compose exec backend alembic upgrade head
```

4. Open the apps:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8000/api/health`
- API docs: `http://localhost:8000/api/docs`

## Foundation Scope

Implemented:

- PostgreSQL service configuration.
- SQLAlchemy 2.x async engine and session dependency.
- Alembic configuration with initial `users` table migration.
- `GET /api/health`.
- User entity, role enum, JWT/password utility foundations, and permission dependency scaffold.
- Role layouts for admin, teacher, student, and parent.
- Responsive dark/light UI shell with module boundary pages.

Not implemented yet:

- Course, video, quiz, assignment, payment, wallet, report, and notification business workflows.
- Login/register endpoints.
- Production deployment hardening such as managed secrets, observability, rate limiting, and CI.
