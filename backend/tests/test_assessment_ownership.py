"""Ownership/IDOR regression tests for quiz_attempts, results, and
assignments — added after FULL_AUDIT_2026-07-10.md flagged that these
modules trusted broad authentication without course-ownership or
enrollment scoping. Self-contained, mirrors the in-memory SQLite + httpx
ASGI pattern used throughout this test suite.
"""

import uuid
from datetime import datetime, timezone

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
from app.modules.quiz_attempts.models import QuizAttempt, QuizAttemptStatus
from app.modules.quizzes.models import Quiz

TEST_ENGINE = create_async_engine(
    "sqlite+aiosqlite://",
    echo=False,
    poolclass=StaticPool,
)
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
            "title": "Algebra I", "slug": slug, "subject": "Math", "grade": "9",
            "teacher_id": teacher_id, "is_published": True,
        },
        headers=_auth(token),
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


async def _enroll(client: httpx.AsyncClient, student_token: str, course_id: str) -> None:
    resp = await client.post("/api/enrollments", json={"course_id": course_id}, headers=_auth(student_token))
    assert resp.status_code == 201, resp.text


async def _seed_quiz_and_attempt(course_id: str, student_id: str) -> tuple[str, str]:
    """Seeds a quiz + a submitted attempt directly via ORM and returns
    (quiz_id, attempt_id) — avoids needing real quiz questions for tests
    that only exercise ownership scoping, not grading correctness."""
    async with TestSession() as session:
        quiz = Quiz(course_id=uuid.UUID(course_id), title="Quiz 1")
        session.add(quiz)
        await session.flush()
        attempt = QuizAttempt(
            quiz_id=quiz.id,
            student_id=uuid.UUID(student_id),
            status=QuizAttemptStatus.SUBMITTED,
            submitted_at=datetime.now(timezone.utc),
        )
        session.add(attempt)
        await session.commit()
        await session.refresh(quiz)
        await session.refresh(attempt)
        return str(quiz.id), str(attempt.id)


async def _create_assignment(client: httpx.AsyncClient, teacher_token: str, course_id: str, title: str) -> dict:
    resp = await client.post(
        "/api/assignments",
        json={"title": title, "course_id": course_id},
        headers=_auth(teacher_token),
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


# ---------------------------------------------------------------------------
# quiz_attempts: GET /{attempt_id}
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_attempt_rejects_unrelated_role():
    teacher_id = await _seed_user("teacher-a1@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-a1@classz.io", Role.STUDENT)
    await _seed_user("parent-a1@classz.io", Role.PARENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-a1@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-a1")
        _quiz_id, attempt_id = await _seed_quiz_and_attempt(course["id"], student_id)

        parent_token = await _login(c, "parent-a1@classz.io")
        resp = await c.get(f"/api/quiz-attempts/{attempt_id}", headers=_auth(parent_token))
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_get_attempt_rejects_non_owner_teacher():
    teacher_a_id = await _seed_user("teacher-a2@classz.io", Role.TEACHER)
    teacher_b_id = await _seed_user("teacher-b2@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-a2@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_a_token = await _login(c, "teacher-a2@classz.io")
        course = await _create_course(c, teacher_a_token, teacher_a_id, "course-a2")
        _quiz_id, attempt_id = await _seed_quiz_and_attempt(course["id"], student_id)

        teacher_b_token = await _login(c, "teacher-b2@classz.io")
        resp = await c.get(f"/api/quiz-attempts/{attempt_id}", headers=_auth(teacher_b_token))
    assert resp.status_code == 403
    assert teacher_b_id  # keep referenced for clarity


@pytest.mark.asyncio
async def test_get_attempt_allows_owning_teacher():
    teacher_id = await _seed_user("teacher-a3@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-a3@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-a3@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-a3")
        _quiz_id, attempt_id = await _seed_quiz_and_attempt(course["id"], student_id)

        resp = await c.get(f"/api/quiz-attempts/{attempt_id}", headers=_auth(teacher_token))
    assert resp.status_code == 200, resp.text
    assert resp.json()["id"] == attempt_id


@pytest.mark.asyncio
async def test_get_attempt_allows_owning_student():
    teacher_id = await _seed_user("teacher-a4@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-a4@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-a4@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-a4")
        _quiz_id, attempt_id = await _seed_quiz_and_attempt(course["id"], student_id)

        student_token = await _login(c, "student-a4@classz.io")
        resp = await c.get(f"/api/quiz-attempts/{attempt_id}", headers=_auth(student_token))
    assert resp.status_code == 200, resp.text


# ---------------------------------------------------------------------------
# quiz_attempts: GET /quiz/{quiz_id}/submissions
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_submissions_rejects_non_owner_teacher():
    teacher_a_id = await _seed_user("teacher-b1@classz.io", Role.TEACHER)
    await _seed_user("teacher-b2b@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-b1@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_a_token = await _login(c, "teacher-b1@classz.io")
        course = await _create_course(c, teacher_a_token, teacher_a_id, "course-b1")
        quiz_id, _attempt_id = await _seed_quiz_and_attempt(course["id"], student_id)

        teacher_b_token = await _login(c, "teacher-b2b@classz.io")
        resp = await c.get(f"/api/quiz-attempts/quiz/{quiz_id}/submissions", headers=_auth(teacher_b_token))
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_list_submissions_allows_owning_teacher():
    teacher_id = await _seed_user("teacher-b3@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-b3@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-b3@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-b3")
        quiz_id, attempt_id = await _seed_quiz_and_attempt(course["id"], student_id)

        resp = await c.get(f"/api/quiz-attempts/quiz/{quiz_id}/submissions", headers=_auth(teacher_token))
    assert resp.status_code == 200, resp.text
    assert [item["id"] for item in resp.json()] == [attempt_id]


# ---------------------------------------------------------------------------
# results: POST /grade/{attempt_id}, GET /{attempt_id}
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_grade_attempt_rejects_non_owner_teacher():
    teacher_a_id = await _seed_user("teacher-c1@classz.io", Role.TEACHER)
    await _seed_user("teacher-c2@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-c1@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_a_token = await _login(c, "teacher-c1@classz.io")
        course = await _create_course(c, teacher_a_token, teacher_a_id, "course-c1")
        _quiz_id, attempt_id = await _seed_quiz_and_attempt(course["id"], student_id)

        teacher_b_token = await _login(c, "teacher-c2@classz.io")
        resp = await c.post(f"/api/results/grade/{attempt_id}", headers=_auth(teacher_b_token))
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_grade_attempt_allows_owning_teacher():
    teacher_id = await _seed_user("teacher-c3@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-c3@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-c3@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-c3")
        _quiz_id, attempt_id = await _seed_quiz_and_attempt(course["id"], student_id)

        resp = await c.post(f"/api/results/grade/{attempt_id}", headers=_auth(teacher_token))
    assert resp.status_code == 200, resp.text


@pytest.mark.asyncio
async def test_get_result_rejects_unrelated_role_and_non_owner_teacher():
    teacher_a_id = await _seed_user("teacher-c4@classz.io", Role.TEACHER)
    await _seed_user("teacher-c5@classz.io", Role.TEACHER)
    await _seed_user("finance-c4@classz.io", Role.FINANCE)
    student_id = await _seed_user("student-c4@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_a_token = await _login(c, "teacher-c4@classz.io")
        course = await _create_course(c, teacher_a_token, teacher_a_id, "course-c4")
        _quiz_id, attempt_id = await _seed_quiz_and_attempt(course["id"], student_id)
        grade_resp = await c.post(f"/api/results/grade/{attempt_id}", headers=_auth(teacher_a_token))
        assert grade_resp.status_code == 200, grade_resp.text

        teacher_b_token = await _login(c, "teacher-c5@classz.io")
        resp_teacher_b = await c.get(f"/api/results/{attempt_id}", headers=_auth(teacher_b_token))
        assert resp_teacher_b.status_code == 403

        finance_token = await _login(c, "finance-c4@classz.io")
        resp_finance = await c.get(f"/api/results/{attempt_id}", headers=_auth(finance_token))
        assert resp_finance.status_code == 403

        resp_owner = await c.get(f"/api/results/{attempt_id}", headers=_auth(teacher_a_token))
        assert resp_owner.status_code == 200, resp_owner.text


# ---------------------------------------------------------------------------
# assignments: list / get / create / submit
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_assignments_scopes_to_student_enrollment():
    teacher_id = await _seed_user("teacher-d1@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-d1@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-d1@classz.io")
        course_enrolled = await _create_course(c, teacher_token, teacher_id, "course-d1-enrolled")
        course_other = await _create_course(c, teacher_token, teacher_id, "course-d1-other")
        await _create_assignment(c, teacher_token, course_enrolled["id"], "Enrolled HW")
        await _create_assignment(c, teacher_token, course_other["id"], "Other HW")

        student_token = await _login(c, "student-d1@classz.io")
        await _enroll(c, student_token, course_enrolled["id"])

        resp = await c.get("/api/assignments", headers=_auth(student_token))
    assert resp.status_code == 200, resp.text
    titles = {item["title"] for item in resp.json()}
    assert titles == {"Enrolled HW"}


@pytest.mark.asyncio
async def test_list_assignments_scopes_to_teacher_ownership():
    teacher_a_id = await _seed_user("teacher-d2@classz.io", Role.TEACHER)
    teacher_b_id = await _seed_user("teacher-d3@classz.io", Role.TEACHER)
    async with _client() as c:
        teacher_a_token = await _login(c, "teacher-d2@classz.io")
        course_a = await _create_course(c, teacher_a_token, teacher_a_id, "course-d2")
        await _create_assignment(c, teacher_a_token, course_a["id"], "Teacher A HW")

        teacher_b_token = await _login(c, "teacher-d3@classz.io")
        course_b = await _create_course(c, teacher_b_token, teacher_b_id, "course-d3")
        await _create_assignment(c, teacher_b_token, course_b["id"], "Teacher B HW")

        resp = await c.get("/api/assignments", headers=_auth(teacher_a_token))
    assert resp.status_code == 200, resp.text
    titles = {item["title"] for item in resp.json()}
    assert titles == {"Teacher A HW"}


@pytest.mark.asyncio
async def test_get_assignment_rejects_unenrolled_student():
    teacher_id = await _seed_user("teacher-d4@classz.io", Role.TEACHER)
    await _seed_user("student-d4@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-d4@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-d4")
        assignment = await _create_assignment(c, teacher_token, course["id"], "Locked HW")

        student_token = await _login(c, "student-d4@classz.io")
        resp = await c.get(f"/api/assignments/{assignment['id']}", headers=_auth(student_token))
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_get_assignment_rejects_non_owner_teacher():
    teacher_a_id = await _seed_user("teacher-d5@classz.io", Role.TEACHER)
    await _seed_user("teacher-d6@classz.io", Role.TEACHER)
    async with _client() as c:
        teacher_a_token = await _login(c, "teacher-d5@classz.io")
        course = await _create_course(c, teacher_a_token, teacher_a_id, "course-d5")
        assignment = await _create_assignment(c, teacher_a_token, course["id"], "Teacher A HW")

        teacher_b_token = await _login(c, "teacher-d6@classz.io")
        resp = await c.get(f"/api/assignments/{assignment['id']}", headers=_auth(teacher_b_token))
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_create_assignment_rejects_non_owner_course():
    teacher_a_id = await _seed_user("teacher-d7@classz.io", Role.TEACHER)
    await _seed_user("teacher-d8@classz.io", Role.TEACHER)
    async with _client() as c:
        teacher_a_token = await _login(c, "teacher-d7@classz.io")
        course = await _create_course(c, teacher_a_token, teacher_a_id, "course-d7")

        teacher_b_token = await _login(c, "teacher-d8@classz.io")
        resp = await c.post(
            "/api/assignments",
            json={"title": "Sneaky HW", "course_id": course["id"]},
            headers=_auth(teacher_b_token),
        )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_submit_assignment_rejects_unenrolled_student():
    teacher_id = await _seed_user("teacher-d9@classz.io", Role.TEACHER)
    await _seed_user("student-d9@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-d9@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-d9")
        assignment = await _create_assignment(c, teacher_token, course["id"], "Locked HW")

        student_token = await _login(c, "student-d9@classz.io")
        resp = await c.post(
            f"/api/assignments/{assignment['id']}/submit",
            json={"submission_text": "trying anyway"},
            headers=_auth(student_token),
        )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_list_assignments_hides_other_students_submissions():
    teacher_id = await _seed_user("teacher-d11@classz.io", Role.TEACHER)
    student_a_id = await _seed_user("student-d11a@classz.io", Role.STUDENT)
    student_b_id = await _seed_user("student-d11b@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-d11@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-d11")
        assignment = await _create_assignment(c, teacher_token, course["id"], "Shared HW")

        student_a_token = await _login(c, "student-d11a@classz.io")
        student_b_token = await _login(c, "student-d11b@classz.io")
        await _enroll(c, student_a_token, course["id"])
        await _enroll(c, student_b_token, course["id"])

        await c.post(
            f"/api/assignments/{assignment['id']}/submit",
            json={"submission_text": "student A's private answer"},
            headers=_auth(student_a_token),
        )
        await c.post(
            f"/api/assignments/{assignment['id']}/submit",
            json={"submission_text": "student B's private answer"},
            headers=_auth(student_b_token),
        )

        list_resp = await c.get("/api/assignments", headers=_auth(student_a_token))
        get_resp = await c.get(f"/api/assignments/{assignment['id']}", headers=_auth(student_a_token))
        teacher_get_resp = await c.get(f"/api/assignments/{assignment['id']}", headers=_auth(teacher_token))

    assert list_resp.status_code == 200, list_resp.text
    list_submissions = list_resp.json()[0]["submissions"]
    assert len(list_submissions) == 1
    assert list_submissions[0]["student_id"] == student_a_id

    assert get_resp.status_code == 200, get_resp.text
    get_submissions = get_resp.json()["submissions"]
    assert len(get_submissions) == 1
    assert get_submissions[0]["student_id"] == student_a_id

    assert teacher_get_resp.status_code == 200, teacher_get_resp.text
    teacher_submissions = teacher_get_resp.json()["submissions"]
    student_ids = {s["student_id"] for s in teacher_submissions}
    assert student_ids == {student_a_id, student_b_id}


@pytest.mark.asyncio
async def test_submit_assignment_allows_enrolled_student():
    teacher_id = await _seed_user("teacher-d10@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-d10@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-d10@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-d10")
        assignment = await _create_assignment(c, teacher_token, course["id"], "Open HW")

        student_token = await _login(c, "student-d10@classz.io")
        await _enroll(c, student_token, course["id"])

        resp = await c.post(
            f"/api/assignments/{assignment['id']}/submit",
            json={"submission_text": "my work"},
            headers=_auth(student_token),
        )
    assert resp.status_code == 201, resp.text
    assert resp.json()["student_id"] == student_id
