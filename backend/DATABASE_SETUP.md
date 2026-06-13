# CLASSZ Backend Database Setup

## PostgreSQL

CLASSZ uses PostgreSQL through Docker Compose for local development.

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Default local values are defined in `.env.example`:

- `POSTGRES_SERVER=postgres`
- `POSTGRES_PORT=5432`
- `POSTGRES_USER=classz`
- `POSTGRES_PASSWORD=classz`
- `POSTGRES_DB=classz`
- `DATABASE_URL=postgresql://classz:classz@postgres:5432/classz`

## Alembic Migrations

Run migrations from the backend directory after PostgreSQL is available:

```bash
alembic upgrade head
```

The Phase 7A Student Memory migration is:

```text
backend/alembic/versions/202606130013_student_memory_persistence.py
```

It creates persistent tables for Student Memory profiles, strengths, weaknesses, learning preferences, study patterns, attention profiles, memory timeline events, forgetting curve records, recommendations, summaries, and long-term memory insights.

## Seed Student Memory

After migrations have run, seed the development Student Memory profile:

```bash
python scripts/seed_student_memory.py
```

The seed script creates a local development student user if needed, then creates the Student Memory profile and related records.

## API Check

Start the backend:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Then check:

```text
GET /api/student-memory/11111111-1111-1111-1111-111111111111
```

## Frontend Compatibility

The frontend Student Memory module prefers the backend API but keeps the Phase 6 local fallback behavior when the backend is unavailable or the seed data has not been created.
