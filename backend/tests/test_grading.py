"""Grading module tests — self-contained, no shared fixtures.

Mirrors the in-memory SQLite + httpx ASGI pattern used across the suite.
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
from app.modules.assignments.models import Assignment, AssignmentSubmission
from app.modules.question_bank.models import Difficulty, Question, QuestionCategory, QuestionType
from app.modules.quiz_attempts.models import QuizAttempt, QuizAttemptStatus
from app.modules.quizzes.models import Quiz
from app.modules.results.models import QuestionResult, QuizResult

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


async def _seed_assignment_submission(course_id: str, student_id: str) -> str:
    """Seeds an assignment + a submission directly via ORM and returns the
    submission id — surfaces as a PENDING ManualGrade once a grading endpoint
    is queried (grading/service.py lazily materializes ManualGrade rows)."""
    async with TestSession() as session:
        assignment = Assignment(course_id=uuid.UUID(course_id), title="Essay HW", max_points=50)
        session.add(assignment)
        await session.flush()
        submission = AssignmentSubmission(
            assignment_id=assignment.id,
            student_id=uuid.UUID(student_id),
            submission_text="My submission",
        )
        session.add(submission)
        await session.commit()
        await session.refresh(submission)
        return str(submission.id)


async def _seed_essay_question_result(course_id: str, student_id: str) -> str:
    """Seeds category/question/quiz/attempt/result/question_result for a
    pending-manual-review essay question and returns the question_result id."""
    async with TestSession() as session:
        category = QuestionCategory(name=f"General-{_next_public_code()}")
        session.add(category)
        await session.flush()
        question = Question(
            category_id=category.id,
            title="Explain photosynthesis",
            question_type=QuestionType.ESSAY,
            difficulty=Difficulty.MEDIUM,
        )
        session.add(question)
        await session.flush()
        quiz = Quiz(course_id=uuid.UUID(course_id), title="Quiz 1")
        session.add(quiz)
        await session.flush()
        attempt = QuizAttempt(
            quiz_id=quiz.id,
            student_id=uuid.UUID(student_id),
            status=QuizAttemptStatus.SUBMITTED,
        )
        session.add(attempt)
        await session.flush()
        quiz_result = QuizResult(attempt_id=attempt.id, score=0, max_score=10, percentage=0, passed=False)
        session.add(quiz_result)
        await session.flush()
        question_result = QuestionResult(
            quiz_result_id=quiz_result.id,
            question_id=question.id,
            earned_points=0,
            max_points=10,
            is_correct=False,
            pending_manual_review=True,
        )
        session.add(question_result)
        await session.commit()
        await session.refresh(question_result)
        return str(question_result.id)


@pytest.mark.asyncio
async def test_grading_pending_requires_grader_role():
    await _seed_user("student-g1@classz.io", Role.STUDENT)
    async with _client() as c:
        token = await _login(c, "student-g1@classz.io")
        resp = await c.get("/api/grading/pending", headers=_auth(token))
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_list_all_grades_requires_grader_role():
    await _seed_user("student-g2@classz.io", Role.STUDENT)
    async with _client() as c:
        token = await _login(c, "student-g2@classz.io")
        resp = await c.get("/api/grading", headers=_auth(token))
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_pending_grades_surfaces_assignment_submission():
    teacher_id = await _seed_user("teacher-g1@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-g3@classz.io", Role.STUDENT)
    async with _client() as c:
        token = await _login(c, "teacher-g1@classz.io")
        course = await _create_course(c, token, teacher_id, "course-g1")
        submission_id = await _seed_assignment_submission(course["id"], student_id)

        resp = await c.get("/api/grading/pending", headers=_auth(token))
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert len(body) == 1
    assert body[0]["status"] == "PENDING"
    assert body[0]["assignment_submission"]["id"] == submission_id


@pytest.mark.asyncio
async def test_list_all_grades_includes_graded_and_pending():
    teacher_id = await _seed_user("teacher-g2@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-g4@classz.io", Role.STUDENT)
    async with _client() as c:
        token = await _login(c, "teacher-g2@classz.io")
        course = await _create_course(c, token, teacher_id, "course-g2")
        await _seed_assignment_submission(course["id"], student_id)
        await _seed_essay_question_result(course["id"], student_id)

        # Materialize both pending grades, then grade one of them.
        pending = await c.get("/api/grading/pending", headers=_auth(token))
        assert pending.status_code == 200
        grades = pending.json()
        assert len(grades) == 2

        grade_resp = await c.post(
            f"/api/grading/{grades[0]['id']}/grade",
            json={"grader_id": teacher_id, "score": 8, "feedback": "Good work"},
            headers=_auth(token),
        )
        assert grade_resp.status_code == 200, grade_resp.text

        all_resp = await c.get("/api/grading", headers=_auth(token))
    assert all_resp.status_code == 200, all_resp.text
    all_grades = all_resp.json()
    assert len(all_grades) == 2
    statuses = {g["status"] for g in all_grades}
    assert statuses == {"GRADED", "PENDING"}


@pytest.mark.asyncio
async def test_grade_essay_recalculates_quiz_result():
    teacher_id = await _seed_user("teacher-g3@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-g5@classz.io", Role.STUDENT)
    async with _client() as c:
        token = await _login(c, "teacher-g3@classz.io")
        course = await _create_course(c, token, teacher_id, "course-g3")
        await _seed_essay_question_result(course["id"], student_id)

        pending = await c.get("/api/grading/pending", headers=_auth(token))
        grade_id = pending.json()[0]["id"]

        graded = await c.post(
            f"/api/grading/{grade_id}/grade",
            json={"grader_id": teacher_id, "score": 10, "feedback": "Perfect"},
            headers=_auth(token),
        )
    assert graded.status_code == 200, graded.text
    body = graded.json()
    assert body["status"] == "GRADED"
    assert body["score"] == 10
    assert body["question_result"]["is_correct"] is True


@pytest.mark.asyncio
async def test_return_grade_sets_returned_status():
    teacher_id = await _seed_user("teacher-g4@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-g6@classz.io", Role.STUDENT)
    async with _client() as c:
        token = await _login(c, "teacher-g4@classz.io")
        course = await _create_course(c, token, teacher_id, "course-g4")
        await _seed_assignment_submission(course["id"], student_id)

        pending = await c.get("/api/grading/pending", headers=_auth(token))
        grade_id = pending.json()[0]["id"]

        returned = await c.post(
            f"/api/grading/{grade_id}/return",
            json={"grader_id": teacher_id, "feedback": "Please revise"},
            headers=_auth(token),
        )
    assert returned.status_code == 200, returned.text
    assert returned.json()["status"] == "RETURNED"
