"""Teacher > Students section tests — roster, progress, at-risk, wrong
questions, memory, reports, pods, parents, wallets, certificates.

Self-contained, mirrors the in-memory SQLite + httpx ASGI pattern used
throughout this test suite.
"""

import uuid
from datetime import datetime, timedelta, timezone

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
from app.modules.progress.models import SessionProgress
from app.modules.question_bank.models import Difficulty, Question, QuestionCategory, QuestionType
from app.modules.quiz_attempts.models import QuizAttempt, QuizAttemptStatus
from app.modules.results.models import QuestionResult, QuizResult

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


async def _create_session_row(client: httpx.AsyncClient, token: str, course_id: str, title: str) -> dict:
    resp = await client.post("/api/sessions", json={"course_id": course_id, "title": title}, headers=_auth(token))
    assert resp.status_code == 201, resp.text
    return resp.json()


async def _seed_progress(student_id: str, session_id: str, percent: int, completed: bool) -> None:
    async with TestSession() as db:
        row = SessionProgress(
            student_id=uuid.UUID(student_id),
            session_id=uuid.UUID(session_id),
            percent_complete=percent,
            last_position_seconds=600,
            completed_at=datetime.now(timezone.utc) if completed else None,
        )
        db.add(row)
        await db.commit()


async def _seed_quiz_result(
    student_id: str,
    quiz_id: str,
    question_id: str,
    percentage: float,
    is_correct: bool,
    graded_at: datetime | None = None,
) -> None:
    async with TestSession() as db:
        attempt = QuizAttempt(
            quiz_id=uuid.UUID(quiz_id), student_id=uuid.UUID(student_id), status=QuizAttemptStatus.SUBMITTED
        )
        db.add(attempt)
        await db.flush()
        result = QuizResult(
            attempt_id=attempt.id,
            score=int(percentage),
            max_score=100,
            percentage=percentage,
            passed=percentage >= 70,
            graded_at=graded_at or datetime.now(timezone.utc),
        )
        db.add(result)
        await db.flush()
        db.add(
            QuestionResult(
                quiz_result_id=result.id,
                question_id=uuid.UUID(question_id),
                earned_points=1 if is_correct else 0,
                max_points=1,
                is_correct=is_correct,
            )
        )
        await db.commit()


async def _seed_question(title: str = "2+2?") -> str:
    async with TestSession() as db:
        category = QuestionCategory(name=f"General-{_next_public_code()}")
        db.add(category)
        await db.flush()
        question = Question(category_id=category.id, title=title, question_type=QuestionType.MCQ, difficulty=Difficulty.EASY)
        db.add(question)
        await db.commit()
        await db.refresh(question)
        return str(question.id)


# ---------------------------------------------------------------------------
# Roster / progress / at-risk
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_roster_requires_auth():
    async with _client() as c:
        resp = await c.get("/api/students/roster?course_id=00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_roster_rejects_non_owner_teacher():
    teacher_a_id = await _seed_user("teacher-a@classz.io", Role.TEACHER)
    await _seed_user("teacher-b@classz.io", Role.TEACHER)
    async with _client() as c:
        token_a = await _login(c, "teacher-a@classz.io")
        token_b = await _login(c, "teacher-b@classz.io")
        course = await _create_course(c, token_a, teacher_a_id, "course-a")

        resp = await c.get(f"/api/students/roster?course_id={course['id']}", headers=_auth(token_b))
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_roster_reflects_enrollment_and_progress():
    teacher_id = await _seed_user("teacher-c@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-c@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-c@classz.io")
        student_token = await _login(c, "student-c@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-c")
        await _enroll(c, student_token, course["id"])
        session_row = await _create_session_row(c, teacher_token, course["id"], "Session 1")
        await _seed_progress(student_id, session_row["id"], percent=80, completed=True)

        resp = await c.get(f"/api/students/roster?course_id={course['id']}", headers=_auth(teacher_token))
    assert resp.status_code == 200, resp.text
    roster = resp.json()
    assert len(roster) == 1
    assert roster[0]["student_id"] == student_id
    assert roster[0]["progress_percent"] == 80
    assert roster[0]["sessions_completed"] == 1
    assert roster[0]["sessions_total"] == 1


@pytest.mark.asyncio
async def test_at_risk_flags_low_progress_and_inactivity():
    teacher_id = await _seed_user("teacher-d@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-d@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-d@classz.io")
        student_token = await _login(c, "student-d@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-d")
        await _enroll(c, student_token, course["id"])
        session_row = await _create_session_row(c, teacher_token, course["id"], "Session 1")
        await _seed_progress(student_id, session_row["id"], percent=10, completed=False)

        resp = await c.get(f"/api/students/at-risk?course_id={course['id']}", headers=_auth(teacher_token))
    assert resp.status_code == 200, resp.text
    at_risk = resp.json()
    assert len(at_risk) == 1
    assert at_risk[0]["student_id"] == student_id
    assert "Low course progress" in at_risk[0]["risk_reasons"]


# ---------------------------------------------------------------------------
# Wrong questions / memory
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_wrong_questions_aggregation():
    teacher_id = await _seed_user("teacher-e@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-e@classz.io", Role.STUDENT)
    question_id = await _seed_question("What is a derivative?")
    async with _client() as c:
        teacher_token = await _login(c, "teacher-e@classz.io")
        student_token = await _login(c, "student-e@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-e")
        await _enroll(c, student_token, course["id"])

        quiz_resp = await c.post(
            "/api/quizzes", json={"title": "Quiz 1", "course_id": course["id"]}, headers=_auth(teacher_token)
        )
        assert quiz_resp.status_code == 201
        quiz_id = quiz_resp.json()["id"]

        await _seed_quiz_result(student_id, quiz_id, question_id, percentage=40, is_correct=False)
        await _seed_quiz_result(student_id, quiz_id, question_id, percentage=40, is_correct=False)

        resp = await c.get(f"/api/students/wrong-questions?course_id={course['id']}", headers=_auth(teacher_token))
    assert resp.status_code == 200, resp.text
    wrong = resp.json()
    assert len(wrong) == 1
    assert wrong[0]["retry_count"] == 2
    assert wrong[0]["question_title"] == "What is a derivative?"


@pytest.mark.asyncio
async def test_reports_summary_counts_students():
    teacher_id = await _seed_user("teacher-f@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-f@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-f@classz.io")
        student_token = await _login(c, "student-f@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-f")
        await _enroll(c, student_token, course["id"])

        resp = await c.get(f"/api/students/reports?course_id={course['id']}", headers=_auth(teacher_token))
    assert resp.status_code == 200, resp.text
    report = resp.json()
    assert report["total_students"] == 1
    assert student_id  # keep referenced


# ---------------------------------------------------------------------------
# Pods
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_pod_crud_and_membership():
    teacher_id = await _seed_user("teacher-g@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-g@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-g@classz.io")
        student_token = await _login(c, "student-g@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-g")
        await _enroll(c, student_token, course["id"])

        create_resp = await c.post(
            "/api/students/pods",
            json={"course_id": course["id"], "name": "Morning Cohort"},
            headers=_auth(teacher_token),
        )
        assert create_resp.status_code == 201, create_resp.text
        pod_id = create_resp.json()["id"]

        add_resp = await c.post(
            f"/api/students/pods/{pod_id}/members", json={"student_id": student_id}, headers=_auth(teacher_token)
        )
        assert add_resp.status_code == 201, add_resp.text
        assert len(add_resp.json()["members"]) == 1

        list_resp = await c.get(f"/api/students/pods?course_id={course['id']}", headers=_auth(teacher_token))
        assert list_resp.status_code == 200
        assert len(list_resp.json()) == 1

        remove_resp = await c.delete(
            f"/api/students/pods/{pod_id}/members/{student_id}", headers=_auth(teacher_token)
        )
        assert remove_resp.status_code == 204


@pytest.mark.asyncio
async def test_pod_rejects_non_owner():
    teacher_a_id = await _seed_user("teacher-h@classz.io", Role.TEACHER)
    await _seed_user("teacher-i@classz.io", Role.TEACHER)
    async with _client() as c:
        token_a = await _login(c, "teacher-h@classz.io")
        token_b = await _login(c, "teacher-i@classz.io")
        course = await _create_course(c, token_a, teacher_a_id, "course-h")

        resp = await c.post(
            "/api/students/pods", json={"course_id": course["id"], "name": "X"}, headers=_auth(token_b)
        )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Parents
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_parent_contact_crud_and_ownership():
    teacher_id = await _seed_user("teacher-j@classz.io", Role.TEACHER)
    other_teacher_id = await _seed_user("teacher-k@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-j@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-j@classz.io")
        other_token = await _login(c, "teacher-k@classz.io")
        student_token = await _login(c, "student-j@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-j")
        await _enroll(c, student_token, course["id"])

        create_resp = await c.post(
            "/api/parents",
            json={"student_id": student_id, "name": "Mona Ali", "relation": "Mother", "phone": "+201000000000"},
            headers=_auth(teacher_token),
        )
        assert create_resp.status_code == 201, create_resp.text
        contact_id = create_resp.json()["id"]

        # A teacher who doesn't teach this student cannot create/update contacts for them.
        other_resp = await c.post(
            "/api/parents",
            json={"student_id": student_id, "name": "X", "relation": "Father"},
            headers=_auth(other_token),
        )
        assert other_resp.status_code == 403

        list_resp = await c.get(f"/api/parents?course_id={course['id']}", headers=_auth(teacher_token))
        assert list_resp.status_code == 200
        assert len(list_resp.json()) == 1

        update_resp = await c.patch(
            f"/api/parents/{contact_id}", json={"alert_status": "urgent"}, headers=_auth(teacher_token)
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["alert_status"] == "urgent"

        other_update_resp = await c.patch(
            f"/api/parents/{contact_id}", json={"alert_status": "sent"}, headers=_auth(other_token)
        )
        assert other_update_resp.status_code == 403


# ---------------------------------------------------------------------------
# Wallets / payments
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_wallet_transaction_and_balance():
    teacher_id = await _seed_user("teacher-l@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-l@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-l@classz.io")
        student_token = await _login(c, "student-l@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-l")
        await _enroll(c, student_token, course["id"])

        create_resp = await c.post(
            "/api/wallets/transactions",
            json={
                "student_id": student_id,
                "course_id": course["id"],
                "type": "topup",
                "amount": 50,
                "status": "paid",
            },
            headers=_auth(teacher_token),
        )
        assert create_resp.status_code == 201, create_resp.text

        balance_resp = await c.get(f"/api/wallets/{student_id}", headers=_auth(teacher_token))
        assert balance_resp.status_code == 200
        assert balance_resp.json()["balance"] == 50.0

        list_resp = await c.get(f"/api/wallets/transactions?course_id={course['id']}", headers=_auth(teacher_token))
        assert list_resp.status_code == 200
        assert len(list_resp.json()) == 1


@pytest.mark.asyncio
async def test_wallet_transaction_rejects_non_owner_course():
    teacher_a_id = await _seed_user("teacher-m@classz.io", Role.TEACHER)
    await _seed_user("teacher-n@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-m@classz.io", Role.STUDENT)
    async with _client() as c:
        token_a = await _login(c, "teacher-m@classz.io")
        token_b = await _login(c, "teacher-n@classz.io")
        student_token = await _login(c, "student-m@classz.io")
        course = await _create_course(c, token_a, teacher_a_id, "course-m")
        await _enroll(c, student_token, course["id"])

        resp = await c.post(
            "/api/wallets/transactions",
            json={"student_id": student_id, "course_id": course["id"], "type": "topup", "amount": 10, "status": "paid"},
            headers=_auth(token_b),
        )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Certificates
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_certificate_issue_and_list():
    teacher_id = await _seed_user("teacher-o@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-o@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-o@classz.io")
        student_token = await _login(c, "student-o@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-o")
        await _enroll(c, student_token, course["id"])

        create_resp = await c.post(
            "/api/certificates",
            json={"student_id": student_id, "course_id": course["id"], "title": "Algebra I Completion"},
            headers=_auth(teacher_token),
        )
        assert create_resp.status_code == 201, create_resp.text
        cert_id = create_resp.json()["id"]
        assert create_resp.json()["status"] == "issued"

        list_resp = await c.get(f"/api/certificates?course_id={course['id']}", headers=_auth(teacher_token))
        assert list_resp.status_code == 200
        assert len(list_resp.json()) == 1

        revoke_resp = await c.patch(
            f"/api/certificates/{cert_id}", json={"status": "revoked"}, headers=_auth(teacher_token)
        )
        assert revoke_resp.status_code == 200
        assert revoke_resp.json()["status"] == "revoked"


@pytest.mark.asyncio
async def test_certificate_rejects_non_owner_course():
    teacher_a_id = await _seed_user("teacher-p@classz.io", Role.TEACHER)
    await _seed_user("teacher-q@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-p@classz.io", Role.STUDENT)
    async with _client() as c:
        token_a = await _login(c, "teacher-p@classz.io")
        token_b = await _login(c, "teacher-q@classz.io")
        student_token = await _login(c, "student-p@classz.io")
        course = await _create_course(c, token_a, teacher_a_id, "course-p")
        await _enroll(c, student_token, course["id"])

        resp = await c.post(
            "/api/certificates",
            json={"student_id": student_id, "course_id": course["id"], "title": "X"},
            headers=_auth(token_b),
        )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_certificate_me_lists_only_own_certificates():
    teacher_id = await _seed_user("teacher-r@classz.io", Role.TEACHER)
    student_a_id = await _seed_user("student-r1@classz.io", Role.STUDENT)
    student_b_id = await _seed_user("student-r2@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-r@classz.io")
        student_a_token = await _login(c, "student-r1@classz.io")
        student_b_token = await _login(c, "student-r2@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-r")
        await _enroll(c, student_a_token, course["id"])
        await _enroll(c, student_b_token, course["id"])

        await c.post(
            "/api/certificates",
            json={"student_id": student_a_id, "course_id": course["id"], "title": "Student A Cert"},
            headers=_auth(teacher_token),
        )
        await c.post(
            "/api/certificates",
            json={"student_id": student_b_id, "course_id": course["id"], "title": "Student B Cert"},
            headers=_auth(teacher_token),
        )

        resp = await c.get("/api/certificates/me", headers=_auth(student_a_token))
    assert resp.status_code == 200, resp.text
    titles = [item["title"] for item in resp.json()]
    assert titles == ["Student A Cert"]


@pytest.mark.asyncio
async def test_certificate_me_requires_student_role():
    await _seed_user("teacher-s@classz.io", Role.TEACHER)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-s@classz.io")
        resp = await c.get("/api/certificates/me", headers=_auth(teacher_token))
    assert resp.status_code == 403
