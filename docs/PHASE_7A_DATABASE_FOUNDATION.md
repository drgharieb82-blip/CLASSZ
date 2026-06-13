# Phase 7A Real Backend and Database Foundation

## Goal

Phase 7A moves CLASSZ from frontend-only local memory toward a persistent architecture backed by PostgreSQL and the existing FastAPI backend.

The current backend already uses PostgreSQL, Alembic, async SQLAlchemy, routers, schemas, and services. Phase 7A extends that architecture with persistent Student Memory tables and a Prisma schema contract for future database tooling and cross-service compatibility.

## Architecture Principles

- PostgreSQL is the source of truth for durable learning data.
- FastAPI remains the active backend runtime.
- SQLAlchemy and Alembic remain backward compatible with the current backend implementation.
- Prisma schema files document the long-term database contract and prepare future TypeScript tooling.
- AI integration is intentionally excluded from Phase 7A.
- Student Memory persistence is designed to support future Concept Engine, Exam Engine, and AI Teacher layers.

## Persistent Student Memory Scope

Phase 7A introduces persistence for:

- Student profiles
- Strength signals
- Weakness signals
- Learning preferences
- Study patterns
- Attention profile
- Memory timeline events
- Forgetting curve records
- Personalized recommendations
- Student summaries
- Long-term memory insights

## Layering

The Phase 7A backend uses the existing module pattern:

- `models.py`: SQLAlchemy database models
- `schemas.py`: Pydantic API contracts
- `repository.py`: database access and persistence operations
- `service.py`: business orchestration and backward-compatible seed defaults
- `router.py`: FastAPI endpoints
- Alembic migration: PostgreSQL schema creation
- Seed script: initial development data

## Compatibility

Frontend Student Memory will keep local fallback data so the UI still works when the backend is unavailable. API integration should prefer persistent backend data when available and fall back to the Phase 6 local services otherwise.

## Future-Ready Design

The Student Memory schema uses generic concept identifiers and learning signal records so future phases can connect:

- Concept Engine mastery signals
- Exam Engine quiz and result signals
- AI Teacher explanations and recommendations
- Long-term learning memory and explainable decisions

Phase 7A does not perform AI calls, generate AI content, or introduce OpenAI APIs.
