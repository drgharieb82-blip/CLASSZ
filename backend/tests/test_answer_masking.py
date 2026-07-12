"""Regression tests for two P0 findings from the 2026-07-11 platform audit:

- question_bank / quizzes GET endpoints were leaking `QuestionChoice.is_correct`
  (the answer key) to any authenticated caller, including students.
- The grading, quiz_bank and quizzes modules had no TEACHER course-ownership
  scoping, so any teacher could read/act on another teacher's data.

Self-contained, no shared fixtures — mirrors the pattern in test_grading.py.
"""

import uuid

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
            "is_published": True,
        },
        headers=_auth(token),
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


async def _create_category(client: httpx.AsyncClient, token: str) -> str:
    resp = await client.post(
        "/api/questions/categories",
        json={"name": f"General-{_next_public_code()}"},
        headers=_auth(token),
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


async def _create_question(
    client: httpx.AsyncClient, token: str, category_id: str, course_id: str | None
) -> dict:
    resp = await client.post(
        "/api/questions",
        json={
            "category_id": category_id,
            "title": "What is 2 + 2?",
            "question_type": "MCQ",
            "difficulty": "EASY",
            "course_id": course_id,
            "choices": [
                {"choice_text": "3", "is_correct": False, "position": 0},
                {"choice_text": "4", "is_correct": True, "position": 1},
            ],
        },
        headers=_auth(token),
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


@pytest.mark.asyncio
async def test_student_cannot_see_is_correct_on_question():
    teacher_id = await _seed_user("teacher-am1@classz.io", Role.TEACHER)
    await _seed_user("student-am1@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-am1@classz.io")
        category_id = await _create_category(c, teacher_token)
        course = await _create_course(c, teacher_token, teacher_id, "course-am1")
        question = await _create_question(c, teacher_token, category_id, course["id"])

        student_token = await _login(c, "student-am1@classz.io")
        resp = await c.get(f"/api/questions/{question['id']}", headers=_auth(student_token))
    assert resp.status_code == 200, resp.text
    choices = resp.json()["choices"]
    assert len(choices) == 2
    assert all(choice["is_correct"] is False for choice in choices)


@pytest.mark.asyncio
async def test_owning_teacher_still_sees_is_correct_on_question():
    teacher_id = await _seed_user("teacher-am2@classz.io", Role.TEACHER)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-am2@classz.io")
        category_id = await _create_category(c, teacher_token)
        course = await _create_course(c, teacher_token, teacher_id, "course-am2")
        question = await _create_question(c, teacher_token, category_id, course["id"])

        resp = await c.get(f"/api/questions/{question['id']}", headers=_auth(teacher_token))
    assert resp.status_code == 200, resp.text
    choices = resp.json()["choices"]
    assert any(choice["is_correct"] for choice in choices)


@pytest.mark.asyncio
async def test_non_owning_teacher_cannot_read_other_teachers_question():
    teacher_id = await _seed_user("teacher-am3@classz.io", Role.TEACHER)
    await _seed_user("teacher-am4@classz.io", Role.TEACHER)
    async with _client() as c:
        owner_token = await _login(c, "teacher-am3@classz.io")
        category_id = await _create_category(c, owner_token)
        course = await _create_course(c, owner_token, teacher_id, "course-am3")
        question = await _create_question(c, owner_token, category_id, course["id"])

        other_token = await _login(c, "teacher-am4@classz.io")
        resp = await c.get(f"/api/questions/{question['id']}", headers=_auth(other_token))
        list_resp = await c.get("/api/questions", headers=_auth(other_token))

    assert resp.status_code == 403, resp.text
    assert list_resp.status_code == 200, list_resp.text
    assert all(q["id"] != question["id"] for q in list_resp.json())


@pytest.mark.asyncio
async def test_student_cannot_see_is_correct_on_quiz():
    teacher_id = await _seed_user("teacher-am5@classz.io", Role.TEACHER)
    await _seed_user("student-am5@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-am5@classz.io")
        category_id = await _create_category(c, teacher_token)
        course = await _create_course(c, teacher_token, teacher_id, "course-am5")
        question = await _create_question(c, teacher_token, category_id, course["id"])

        quiz_resp = await c.post(
            "/api/quizzes",
            json={"title": "Quiz 1", "course_id": course["id"]},
            headers=_auth(teacher_token),
        )
        assert quiz_resp.status_code == 201, quiz_resp.text
        quiz = quiz_resp.json()

        add_resp = await c.post(
            f"/api/quizzes/{quiz['id']}/questions",
            json={"question_id": question["id"], "position": 0, "points": 1},
            headers=_auth(teacher_token),
        )
        assert add_resp.status_code == 201, add_resp.text

        student_token = await _login(c, "student-am5@classz.io")
        resp = await c.get(f"/api/quizzes/{quiz['id']}", headers=_auth(student_token))

    assert resp.status_code == 200, resp.text
    nested_choices = resp.json()["questions"][0]["question"]["choices"]
    assert all(choice["is_correct"] is False for choice in nested_choices)


@pytest.mark.asyncio
async def test_non_owning_teacher_cannot_read_other_teachers_quiz():
    teacher_id = await _seed_user("teacher-am6@classz.io", Role.TEACHER)
    await _seed_user("teacher-am7@classz.io", Role.TEACHER)
    async with _client() as c:
        owner_token = await _login(c, "teacher-am6@classz.io")
        category_id = await _create_category(c, owner_token)
        course = await _create_course(c, owner_token, teacher_id, "course-am6")
        question = await _create_question(c, owner_token, category_id, course["id"])
        quiz_resp = await c.post(
            "/api/quizzes",
            json={"title": "Quiz 1", "course_id": course["id"]},
            headers=_auth(owner_token),
        )
        quiz = quiz_resp.json()
        await c.post(
            f"/api/quizzes/{quiz['id']}/questions",
            json={"question_id": question["id"], "position": 0, "points": 1},
            headers=_auth(owner_token),
        )

        other_token = await _login(c, "teacher-am7@classz.io")
        resp = await c.get(f"/api/quizzes/{quiz['id']}", headers=_auth(other_token))
        list_resp = await c.get("/api/quizzes", headers=_auth(other_token))

    assert resp.status_code == 403, resp.text
    assert list_resp.status_code == 200, list_resp.text
    assert all(q["id"] != quiz["id"] for q in list_resp.json())


@pytest.mark.asyncio
async def test_non_owning_teacher_cannot_access_other_teachers_grade():
    teacher_id = await _seed_user("teacher-am8@classz.io", Role.TEACHER)
    await _seed_user("teacher-am9@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-am8@classz.io", Role.STUDENT)
    async with _client() as c:
        owner_token = await _login(c, "teacher-am8@classz.io")
        course = await _create_course(c, owner_token, teacher_id, "course-am8")

        from app.modules.assignments.models import Assignment, AssignmentSubmission

        async with TestSession() as session:
            assignment = Assignment(course_id=uuid.UUID(course["id"]), title="Essay HW", max_points=50)
            session.add(assignment)
            await session.flush()
            submission = AssignmentSubmission(
                assignment_id=assignment.id,
                student_id=uuid.UUID(student_id),
                submission_text="My submission",
            )
            session.add(submission)
            await session.commit()

        pending = await c.get("/api/grading/pending", headers=_auth(owner_token))
        assert pending.status_code == 200, pending.text
        grade_id = pending.json()[0]["id"]

        other_token = await _login(c, "teacher-am9@classz.io")
        resp = await c.get(f"/api/grading/{grade_id}", headers=_auth(other_token))
        list_resp = await c.get("/api/grading/pending", headers=_auth(other_token))

    assert resp.status_code == 403, resp.text
    assert list_resp.status_code == 200, list_resp.text
    assert list_resp.json() == []
