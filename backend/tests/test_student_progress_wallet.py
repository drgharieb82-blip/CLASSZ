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
from app.modules.courses.models import Course
from app.modules.enrollments.models import Enrollment
from app.modules.progress.models import SessionProgress
from app.modules.question_bank.models import Difficulty, Question, QuestionCategory, QuestionType
from app.modules.quizzes.models import Quiz
from app.modules.quiz_attempts.models import QuizAttempt, QuizAttemptStatus
from app.modules.results.models import QuestionResult, QuizResult
from app.modules.sessions.models import Session, SessionStatus

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
    await TEST_ENGINE.dispose()


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
    response = await client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def _seed_course_bundle(*, price: float = 0, pre_enroll: bool = True) -> dict[str, str]:
    teacher_id = await _seed_user("teacher-progress@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-progress@classz.io", Role.STUDENT)
    other_student_id = await _seed_user("other-student@classz.io", Role.STUDENT)

    async with TestSession() as session:
        course = Course(
            public_code=_next_public_code("CRS"),
            title="Calculus",
            slug=f"calculus-{_nextval('seq_slug')}",
            description="Progress test course",
            subject="Mathematics",
            grade="12",
            teacher_id=uuid.UUID(teacher_id),
            price=price,
            is_published=True,
        )
        session.add(course)
        await session.flush()

        session_one = Session(
            public_code=_next_public_code("SES"),
            course_id=course.id,
            title="Session 1",
            description="Intro",
            position=1,
            status=SessionStatus.published,
        )
        session_two = Session(
            public_code=_next_public_code("SES"),
            course_id=course.id,
            title="Session 2",
            description="Practice",
            position=2,
            status=SessionStatus.published,
        )
        session.add_all([session_one, session_two])
        await session.flush()

        category = QuestionCategory(name=f"General-{_next_public_code()}")
        session.add(category)
        await session.flush()
        question = Question(
            category_id=category.id,
            title="What is the derivative of x^2?",
            question_type=QuestionType.MCQ,
            difficulty=Difficulty.EASY,
            is_active=True,
        )
        session.add(question)
        await session.flush()

        quiz = Quiz(
            title="Quiz 1",
            course_id=course.id,
            session_id=session_one.id,
            duration_minutes=15,
            passing_score=70,
            is_published=True,
        )
        session.add(quiz)
        await session.flush()

        attempt = QuizAttempt(
            quiz_id=quiz.id,
            student_id=uuid.UUID(student_id),
            status=QuizAttemptStatus.SUBMITTED,
            submitted_at=datetime.now(timezone.utc),
        )
        session.add(attempt)
        await session.flush()

        quiz_result = QuizResult(
            attempt_id=attempt.id,
            score=8,
            max_score=10,
            percentage=80,
            passed=True,
        )
        session.add(quiz_result)
        await session.flush()
        session.add(
            QuestionResult(
                quiz_result_id=quiz_result.id,
                question_id=question.id,
                earned_points=1,
                max_points=1,
                is_correct=True,
            )
        )

        session.add(
            SessionProgress(
                student_id=uuid.UUID(student_id),
                session_id=session_one.id,
                started_at=datetime.now(timezone.utc),
                completed_at=datetime.now(timezone.utc),
                percent_complete=100,
                last_position_seconds=1200,
            )
        )
        session.add(
            SessionProgress(
                student_id=uuid.UUID(student_id),
                session_id=session_two.id,
                started_at=datetime.now(timezone.utc),
                percent_complete=30,
                last_position_seconds=420,
            )
        )
        if pre_enroll:
            session.add(Enrollment(student_id=uuid.UUID(student_id), course_id=course.id))
        await session.commit()

        return {
            "course_id": str(course.id),
            "teacher_id": teacher_id,
            "student_id": student_id,
            "other_student_id": other_student_id,
        }


@pytest.mark.asyncio
async def test_student_progress_summary_and_course_rollup():
    seeded = await _seed_course_bundle()
    async with _client() as client:
        token = await _login(client, "student-progress@classz.io")
        summary_response = await client.get("/api/progress/me", headers=_auth(token))
        course_response = await client.get(
            f"/api/progress/me/course/{seeded['course_id']}",
            headers=_auth(token),
        )
        enrollments_response = await client.get("/api/enrollments/me", headers=_auth(token))

    assert summary_response.status_code == 200, summary_response.text
    summary = summary_response.json()
    assert summary["total_courses_enrolled"] == 1
    assert summary["total_sessions"] == 2
    assert summary["total_sessions_completed"] == 1
    assert summary["overall_progress_percent"] == 50.0
    assert summary["total_quizzes"] == 1
    assert summary["total_quizzes_completed"] == 1
    assert summary["overall_average_score"] == 80.0

    assert course_response.status_code == 200, course_response.text
    course = course_response.json()
    assert course["course_title"] == "Calculus"
    assert course["sessions_completed"] == 1
    assert course["sessions_total"] == 2
    assert course["quizzes_completed"] == 1
    assert course["quizzes_total"] == 1
    assert course["average_score"] == 80.0
    assert course["last_session_title"] == "Session 1"
    assert course["next_session_title"] == "Session 2"

    assert enrollments_response.status_code == 200, enrollments_response.text
    enrollment = enrollments_response.json()["items"][0]
    assert enrollment["progress"]["progress_percent"] == 50.0
    assert enrollment["progress"]["sessions_completed"] == 1


@pytest.mark.asyncio
async def test_student_wallet_is_scoped_to_current_user():
    seeded = await _seed_course_bundle()
    async with _client() as client:
        student_token = await _login(client, "student-progress@classz.io")
        other_token = await _login(client, "other-student@classz.io")

        recharge_response = await client.post(
            "/api/wallets/me/recharge",
            json={"amount": 40, "payment_method": "Card"},
            headers=_auth(student_token),
        )
        assert recharge_response.status_code == 201, recharge_response.text

        student_wallet = await client.get("/api/wallets/me", headers=_auth(student_token))
        student_transactions = await client.get("/api/wallets/me/transactions", headers=_auth(student_token))
        other_wallet = await client.get("/api/wallets/me", headers=_auth(other_token))
        teacher_route_forbidden = await client.get(
            f"/api/wallets/{seeded['student_id']}",
            headers=_auth(student_token),
        )

    assert student_wallet.status_code == 200
    assert student_wallet.json()["balance"] == 40.0
    assert len(student_transactions.json()) == 1
    assert other_wallet.status_code == 200
    assert other_wallet.json()["balance"] == 0.0
    assert teacher_route_forbidden.status_code == 403


@pytest.mark.asyncio
async def test_paid_enrollment_requires_balance_and_debits_wallet():
    seeded = await _seed_course_bundle(price=30, pre_enroll=False)
    async with _client() as client:
        student_token = await _login(client, "student-progress@classz.io")

        rejected = await client.post(
            "/api/enrollments",
            json={"course_id": seeded["course_id"]},
            headers=_auth(student_token),
        )
        assert rejected.status_code == 402, rejected.text

        topup_response = await client.post(
            "/api/wallets/me/recharge",
            json={"amount": 50, "payment_method": "Card"},
            headers=_auth(student_token),
        )
        assert topup_response.status_code == 201, topup_response.text

        enrolled = await client.post(
            "/api/enrollments",
            json={"course_id": seeded["course_id"]},
            headers=_auth(student_token),
        )
        wallet_response = await client.get("/api/wallets/me", headers=_auth(student_token))
        transactions_response = await client.get("/api/wallets/me/transactions", headers=_auth(student_token))
        enrollments_response = await client.get("/api/enrollments/me", headers=_auth(student_token))

    assert enrolled.status_code == 201, enrolled.text
    assert wallet_response.status_code == 200
    assert wallet_response.json()["balance"] == 20.0
    transactions = transactions_response.json()
    # SQLite's `func.now()` truncates to whole seconds, so the payment and
    # topup created in this test can tie on created_at and sort arbitrarily
    # relative to each other (Postgres's microsecond precision avoids this
    # in production) — assert membership rather than a specific tie order.
    assert {item["type"] for item in transactions} == {"payment", "topup"}
    assert len(transactions) == 2
    assert {item["amount"] for item in transactions} == {30.0, 50.0}
    assert enrollments_response.status_code == 200
    assert enrollments_response.json()["items"][0]["progress"]["course_title"] == "Calculus"
