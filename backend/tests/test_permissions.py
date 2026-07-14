"""Authorization/ownership tests for the P0 security sprint — self-contained,
no shared fixtures. Mirrors the in-memory SQLite + httpx ASGI pattern used in
test_auth.py.
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
from app.modules.question_bank.models import Difficulty, Question, QuestionCategory, QuestionType

TEST_ENGINE = create_async_engine(
    "sqlite+aiosqlite://",
    echo=False,
    poolclass=StaticPool,
)
TestSession = async_sessionmaker(
    bind=TEST_ENGINE, class_=AsyncSession, expire_on_commit=False,
)

# Production code generates public codes via Postgres sequences
# (`SELECT nextval('seq_course_code')`, etc). SQLite has no such function, so
# tests that exercise real course/user creation register a simple in-memory
# stand-in here rather than touching production code.
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
    # Re-point the override on every test rather than once at import time —
    # multiple test files share the same `app` singleton and each has its own
    # engine, so whichever module imported last would otherwise "win" for the
    # whole session when tests run together.
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
    """Creates a user and returns their id as a string."""
    async with TestSession() as session:
        user = User(
            email=email,
            public_code=_next_public_code(),
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


async def _create_course(client: httpx.AsyncClient, token: str, teacher_id: str, slug: str) -> dict:
    resp = await client.post(
        "/api/courses",
        json={
            "title": "Algebra I",
            "slug": slug,
            "subject": "Math",
            "grade": "9",
            "teacher_id": teacher_id,
        },
        headers=_auth(token),
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


# ---------------------------------------------------------------------------
# Unauthenticated access is rejected
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_courses_requires_auth():
    async with _client() as c:
        resp = await c.get("/api/courses")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_create_course_requires_auth():
    async with _client() as c:
        resp = await c.post(
            "/api/courses",
            json={"title": "x", "slug": "x", "subject": "x", "grade": "9", "teacher_id": str(await _seed_user("t0@classz.io", Role.TEACHER))},
        )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_grading_pending_requires_auth():
    async with _client() as c:
        resp = await c.get("/api/grading/pending")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Role checks
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_student_cannot_create_course():
    student_id = await _seed_user("student@classz.io", Role.STUDENT)
    async with _client() as c:
        token = await _login(c, "student@classz.io")
        resp = await c.post(
            "/api/courses",
            json={"title": "x", "slug": "x-course", "subject": "x", "grade": "9", "teacher_id": student_id},
            headers=_auth(token),
        )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_student_cannot_view_grading_queue():
    await _seed_user("student2@classz.io", Role.STUDENT)
    async with _client() as c:
        token = await _login(c, "student2@classz.io")
        resp = await c.get("/api/grading/pending", headers=_auth(token))
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Ownership checks
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_teacher_cannot_create_course_for_another_teacher():
    teacher_a = await _seed_user("teacher-a@classz.io", Role.TEACHER)
    teacher_b_id = await _seed_user("teacher-b@classz.io", Role.TEACHER)
    async with _client() as c:
        token_a = await _login(c, "teacher-a@classz.io")
        resp = await c.post(
            "/api/courses",
            json={"title": "x", "slug": "spoofed-course", "subject": "x", "grade": "9", "teacher_id": teacher_b_id},
            headers=_auth(token_a),
        )
    assert resp.status_code == 403
    assert teacher_a  # silence unused-var lint; id used only to seed


@pytest.mark.asyncio
async def test_teacher_cannot_add_chapter_to_another_teachers_course():
    teacher_a_id = await _seed_user("teacher-a2@classz.io", Role.TEACHER)
    await _seed_user("teacher-b2@classz.io", Role.TEACHER)
    async with _client() as c:
        token_a = await _login(c, "teacher-a2@classz.io")
        token_b = await _login(c, "teacher-b2@classz.io")
        course = await _create_course(c, token_a, teacher_a_id, "course-a2")

        resp = await c.post(
            "/api/chapters",
            json={"course_id": course["id"], "title": "Chapter 1"},
            headers=_auth(token_b),
        )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_teacher_can_add_chapter_to_own_course():
    teacher_a_id = await _seed_user("teacher-a3@classz.io", Role.TEACHER)
    async with _client() as c:
        token_a = await _login(c, "teacher-a3@classz.io")
        course = await _create_course(c, token_a, teacher_a_id, "course-a3")

        resp = await c.post(
            "/api/chapters",
            json={"course_id": course["id"], "title": "Chapter 1"},
            headers=_auth(token_a),
        )
    assert resp.status_code == 201


@pytest.mark.asyncio
async def test_teacher_cannot_update_another_teachers_chapter():
    teacher_a_id = await _seed_user("teacher-a4@classz.io", Role.TEACHER)
    await _seed_user("teacher-b4@classz.io", Role.TEACHER)
    async with _client() as c:
        token_a = await _login(c, "teacher-a4@classz.io")
        token_b = await _login(c, "teacher-b4@classz.io")
        course = await _create_course(c, token_a, teacher_a_id, "course-a4")
        chapter = await c.post(
            "/api/chapters",
            json={"course_id": course["id"], "title": "Chapter 1"},
            headers=_auth(token_a),
        )
        assert chapter.status_code == 201
        chapter_id = chapter.json()["id"]

        resp = await c.patch(
            f"/api/chapters/{chapter_id}",
            json={"title": "Hijacked"},
            headers=_auth(token_b),
        )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_admin_bypasses_course_ownership():
    teacher_a_id = await _seed_user("teacher-a5@classz.io", Role.TEACHER)
    await _seed_user("admin@classz.io", Role.ADMIN)
    async with _client() as c:
        token_a = await _login(c, "teacher-a5@classz.io")
        token_admin = await _login(c, "admin@classz.io")
        course = await _create_course(c, token_a, teacher_a_id, "course-a5")

        resp = await c.post(
            "/api/chapters",
            json={"course_id": course["id"], "title": "Admin-added chapter"},
            headers=_auth(token_admin),
        )
    assert resp.status_code == 201


async def _seed_question(title: str = "2+2?") -> str:
    """Seeds a category + question directly via ORM — question_bank has no
    category CRUD endpoint yet, so the API alone can't produce one."""
    async with TestSession() as session:
        category = QuestionCategory(name=f"General-{_next_public_code()}")
        session.add(category)
        await session.flush()
        question = Question(
            category_id=category.id,
            title=title,
            question_type=QuestionType.MCQ,
            difficulty=Difficulty.EASY,
        )
        session.add(question)
        await session.commit()
        await session.refresh(question)
        return str(question.id)


@pytest.mark.asyncio
async def test_teacher_cannot_add_question_to_another_teachers_quiz():
    teacher_a_id = await _seed_user("teacher-a6@classz.io", Role.TEACHER)
    await _seed_user("teacher-b6@classz.io", Role.TEACHER)
    question_id = await _seed_question()
    async with _client() as c:
        token_a = await _login(c, "teacher-a6@classz.io")
        token_b = await _login(c, "teacher-b6@classz.io")
        course = await _create_course(c, token_a, teacher_a_id, "course-a6")

        quiz_resp = await c.post(
            "/api/quizzes",
            json={"title": "Quiz 1", "course_id": course["id"]},
            headers=_auth(token_a),
        )
        assert quiz_resp.status_code == 201
        quiz_id = quiz_resp.json()["id"]

        resp = await c.post(
            f"/api/quizzes/{quiz_id}/questions",
            json={"question_id": question_id, "position": 0},
            headers=_auth(token_b),
        )
        assert resp.status_code == 403
