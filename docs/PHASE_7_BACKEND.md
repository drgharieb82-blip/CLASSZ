# Phase 7 Production Backend

Phase 7 moves CLASSZ toward a production backend while keeping the Phase 4-6 frontend contracts stable.

## Modules Added

- `students`: student profile CRUD backed by SQLAlchemy.
- `teachers`: teacher profile CRUD backed by SQLAlchemy.
- `concepts`: concepts, concept dependencies, and per-student concept state.
- `revision_plans`: persisted revision plans for students.
- `assistant`: mock-safe assistant chat, weakness, revision, explanation, and explainable insight endpoints.
- `auth`: JWT login, token validation, current user dependency, and role support.

Existing modules such as `student_memory`, `quiz_attempts`, `courses`, `chapters`, `lessons`, and `question_bank` remain compatible.

## APIs Added

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/students`
- `GET /api/students/{student_id}`
- `POST /api/students`
- `PUT /api/students/{student_id}`
- `GET /api/teachers`
- `GET /api/teachers/{teacher_id}`
- `POST /api/teachers`
- `PUT /api/teachers/{teacher_id}`
- `GET /api/concepts`
- `GET /api/concepts/{concept_id}`
- `POST /api/concepts`
- `PUT /api/concepts/{concept_id}`
- `GET /api/concepts/{concept_id}/dependencies`
- `POST /api/concepts/{concept_id}/dependencies`
- `GET /api/student-memory/profile/{student_id}`
- `GET /api/student-memory/timeline/{student_id}`
- `GET /api/student-memory/learning-patterns/{student_id}`
- `GET /api/student-memory/review-plan/{student_id}`
- `GET /api/student-memory/knowledge-graph/{student_id}`
- `GET /api/student-memory/persona/{student_id}`
- `GET /api/student-memory/tutor-context/{student_id}`
- `GET /api/revision-plans/{student_id}`
- `POST /api/revision-plans/{student_id}`
- `PUT /api/revision-plans/{plan_id}`
- `POST /api/assistant/chat`
- `GET /api/assistant/weaknesses/{student_id}`
- `GET /api/assistant/revision/{student_id}`
- `GET /api/assistant/explanation/{question_id}`

## Migration

Migration file:

```bash
backend/alembic/versions/202606140001_phase7_production_foundation.py
```

It adds:

- `students`
- `teachers`
- `concepts`
- `concept_dependencies`
- `student_concept_states`
- `memory_events`
- `revision_plans`
- `explainable_insights`
- `assistant_teacher` role value

Run migrations:

```bash
cd backend
alembic upgrade head
```

## Seed Data

Seed script:

```bash
cd backend
python scripts/seed_phase7.py
```

It creates sample users, a student, a teacher, concepts, dependencies, concept state, memory event, revision plan, and explainable insight.

## Validation Commands

```bash
docker compose up -d postgres
cd backend
alembic upgrade head
python scripts/seed_phase7.py
python -m py_compile app/main.py
python -m unittest discover tests
cd ../frontend
npm run build
```

## Known Limitations

- OpenAI remains mocked intentionally.
- Frontend still uses local providers until a later API-provider swap.
- Live PostgreSQL validation requires Docker Desktop or another reachable PostgreSQL instance.
- If Docker is unavailable, run the Python import/tests and frontend build to validate code contracts locally.
