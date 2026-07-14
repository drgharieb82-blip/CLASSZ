"""Course completion -> automatic certificate issuance — self-contained,
mirrors the in-memory SQLite + httpx ASGI pattern used throughout this
test suite.
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


def _next_public_code() -> str:
    global _public_code_counter
    _public_code_counter += 1
    return f"TST-26-{_public_code_counter:06d}"


async def _seed_user(email: str, role: Role, password: str = "Test1234!") -> str:
    async with TestSession() as session:
        user = User(
            email=email,
            public_code=_next_public_code(),
            full_name=email.split("@")[0].replace(".", " ").title(),
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


async def _create_course(client: httpx.AsyncClient, token: str, teacher_id: str, slug: str) -> dict:
    resp = await client.post(
        "/api/courses",
        json={
            "title": "Completion Course", "slug": slug, "subject": "Math", "grade": "9",
            "teacher_id": teacher_id, "is_published": True,
        },
        headers=_auth(token),
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


async def _create_session_row(client: httpx.AsyncClient, token: str, course_id: str, title: str) -> dict:
    resp = await client.post(
        "/api/sessions",
        json={"course_id": course_id, "title": title, "is_free_preview": False},
        headers=_auth(token),
    )
    assert resp.status_code == 201, resp.text
    session = resp.json()
    publish_resp = await client.patch(
        f"/api/sessions/{session['id']}", json={"status": "published"}, headers=_auth(token)
    )
    assert publish_resp.status_code == 200, publish_resp.text
    return publish_resp.json()


async def _enroll(client: httpx.AsyncClient, student_token: str, course_id: str) -> None:
    resp = await client.post("/api/enrollments", json={"course_id": course_id}, headers=_auth(student_token))
    assert resp.status_code == 201, resp.text


@pytest.mark.asyncio
async def test_completing_all_sessions_issues_certificate():
    teacher_id = await _seed_user("teacher-complete@classz.io", Role.TEACHER)
    await _seed_user("student-complete@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-complete@classz.io")
        student_token = await _login(c, "student-complete@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "completion-course")
        session_one = await _create_session_row(c, teacher_token, course["id"], "Session 1")
        session_two = await _create_session_row(c, teacher_token, course["id"], "Session 2")
        await _enroll(c, student_token, course["id"])

        before = await c.get("/api/certificates/me", headers=_auth(student_token))
        assert before.status_code == 200
        assert before.json() == []

        complete_one = await c.post(
            "/api/progress/complete",
            json={"session_id": session_one["id"]},
            headers=_auth(student_token),
        )
        assert complete_one.status_code == 200, complete_one.text

        mid = await c.get("/api/certificates/me", headers=_auth(student_token))
        assert mid.json() == []  # only one of two sessions done — not complete yet

        complete_two = await c.post(
            "/api/progress/complete",
            json={"session_id": session_two["id"]},
            headers=_auth(student_token),
        )
        assert complete_two.status_code == 200, complete_two.text

        after = await c.get("/api/certificates/me", headers=_auth(student_token))
    assert after.status_code == 200, after.text
    certs = after.json()
    assert len(certs) == 1
    assert certs[0]["title"] == "Completion Course Completion"
    assert certs[0]["course_id"] == course["id"]
    assert certs[0]["status"] == "issued"


@pytest.mark.asyncio
async def test_completing_sessions_again_does_not_duplicate_certificate():
    teacher_id = await _seed_user("teacher-complete2@classz.io", Role.TEACHER)
    await _seed_user("student-complete2@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-complete2@classz.io")
        student_token = await _login(c, "student-complete2@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "completion-course-2")
        session_one = await _create_session_row(c, teacher_token, course["id"], "Only Session")
        await _enroll(c, student_token, course["id"])

        await c.post("/api/progress/complete", json={"session_id": session_one["id"]}, headers=_auth(student_token))
        # Re-completing (e.g. a resumed/replayed session) must not issue a second certificate.
        await c.post("/api/progress/complete", json={"session_id": session_one["id"]}, headers=_auth(student_token))

        certs_resp = await c.get("/api/certificates/me", headers=_auth(student_token))
    assert certs_resp.status_code == 200, certs_resp.text
    assert len(certs_resp.json()) == 1
