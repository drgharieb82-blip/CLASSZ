"""Regression test for a position-assignment bug flagged in the 2026-07-11
platform audit: chapters/lessons/concepts/atomic_concepts computed the new
item's position via `func.count(...)`, so deleting any item made the count
drop below the highest existing position — the next create then collided
with an existing row's position and violated the unique constraint.

Only chapters is exercised directly here; lessons/concepts/atomic_concepts
share the exact same fixed pattern (`func.coalesce(func.max(...), -1) + 1`).
"""

import httpx
import pytest
import pytest_asyncio
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import get_db_session
from app.main import app
from app.models.user import Role, User

TEST_ENGINE = create_async_engine("sqlite+aiosqlite://", echo=False, poolclass=StaticPool)
TestSession = async_sessionmaker(bind=TEST_ENGINE, class_=AsyncSession, expire_on_commit=False)

_sequence_counters: dict[str, int] = {}


def _nextval(seq_name: str) -> int:
    _sequence_counters[seq_name] = _sequence_counters.get(seq_name, 0) + 1
    return _sequence_counters[seq_name]


@event.listens_for(TEST_ENGINE.sync_engine, "connect")
def _register_nextval(dbapi_connection, _connection_record):
    dbapi_connection.create_function("nextval", 1, _nextval)


async def _override_session():
    async with TestSession() as session:
        yield session


@pytest_asyncio.fixture(autouse=True)
async def _fresh_db():
    app.dependency_overrides[get_db_session] = _override_session
    async with TEST_ENGINE.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield


_public_code_counter = 0


def _next_public_code(prefix: str = "TST") -> str:
    global _public_code_counter
    _public_code_counter += 1
    return f"{prefix}-26-{_public_code_counter:06d}"


async def _seed_user(email: str, role: Role, password: str = "Test1234!") -> str:
    async with TestSession() as session:
        user = User(
            email=email,
            public_code=_next_public_code("USR"),
            full_name="Test User",
            hashed_password=hash_password(password),
            role=role,
            is_active=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return str(user.id)


def _client():
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")


async def _login(client: httpx.AsyncClient, email: str, password: str = "Test1234!") -> str:
    resp = await client.post("/api/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_chapter_create_after_delete_does_not_collide_on_position():
    teacher_id = await _seed_user("teacher-pos1@classz.io", Role.TEACHER)
    async with _client() as c:
        token = await _login(c, "teacher-pos1@classz.io")
        course_resp = await c.post(
            "/api/courses",
            json={
                "title": "Algebra I",
                "slug": "course-pos1",
                "subject": "Math",
                "grade": "9",
                "teacher_id": teacher_id,
                "is_published": True,
            },
            headers=_auth(token),
        )
        assert course_resp.status_code == 201, course_resp.text
        course_id = course_resp.json()["id"]

        created = []
        for _ in range(3):
            resp = await c.post(
                "/api/chapters",
                json={"course_id": course_id, "title": "Chapter"},
                headers=_auth(token),
            )
            assert resp.status_code == 201, resp.text
            created.append(resp.json())

        assert [c["position"] for c in created] == [0, 1, 2]

        # Delete the middle chapter (position 1) — with the old func.count()
        # logic, the next create would compute position = count() = 2, which
        # collides with the still-existing chapter at position 2.
        delete_resp = await c.delete(f"/api/chapters/{created[1]['id']}", headers=_auth(token))
        assert delete_resp.status_code == 204, delete_resp.text

        new_resp = await c.post(
            "/api/chapters",
            json={"course_id": course_id, "title": "Chapter 4"},
            headers=_auth(token),
        )

    assert new_resp.status_code == 201, new_resp.text
    assert new_resp.json()["position"] == 3
