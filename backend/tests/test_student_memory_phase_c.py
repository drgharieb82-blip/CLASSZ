import uuid
from datetime import UTC, datetime, timedelta

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
from app.modules.chapters.models import Chapter
from app.modules.concepts.models import Concept
from app.modules.courses.models import Course
from app.modules.enrollments.models import Enrollment
from app.modules.lessons.models import Lesson
from app.modules.question_bank.models import Question, QuestionCategory, QuestionChoice, QuestionType, Difficulty
from app.modules.quiz_attempts.models import QuizAttempt, QuizAttemptStatus
from app.modules.quizzes.models import Quiz
from app.modules.results.models import QuestionResult, QuizResult
from app.modules.sessions.models import Session, SessionStatus

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


async def _seed_learning_bundle() -> dict[str, str]:
    teacher_id = await _seed_user("teacher-memory@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-memory@classz.io", Role.STUDENT)

    async with TestSession() as session:
        course = Course(
            public_code=_next_public_code("CRS"),
            title="Memory Calculus",
            slug=f"memory-calculus-{_nextval('seq_slug')}",
            description="Phase C test course",
            subject="Mathematics",
            grade="12",
            teacher_id=uuid.UUID(teacher_id),
            price=0,
            is_published=True,
        )
        session.add(course)
        await session.flush()

        chapter = Chapter(
            public_code=_next_public_code("CHP"),
            course_id=course.id,
            title="Revision Foundations",
            position=1,
        )
        session.add(chapter)
        await session.flush()

        lesson = Lesson(
            public_code=_next_public_code("LES"),
            chapter_id=chapter.id,
            title="Core Limits",
            position=1,
        )
        session.add(lesson)
        await session.flush()

        concept = Concept(
            public_code=_next_public_code("CPT"),
            lesson_id=lesson.id,
            title="Limit Laws",
            position=1,
        )
        session.add(concept)
        await session.flush()

        session_record = Session(
            public_code=_next_public_code("SES"),
            course_id=course.id,
            title="Revision Session",
            description="Study workspace",
            position=1,
            status=SessionStatus.published,
        )
        session.add(session_record)
        await session.flush()

        quiz = Quiz(
            title="Revision Quiz",
            description="For wrong-question tracking",
            course_id=course.id,
            session_id=session_record.id,
            duration_minutes=20,
            passing_score=60,
            is_published=True,
        )
        session.add(quiz)
        await session.flush()

        category = QuestionCategory(name="Core Questions", description="Revision bucket")
        session.add(category)
        await session.flush()

        question = Question(
            course_id=course.id,
            category_id=category.id,
            title="What is the limit of 1/x as x approaches 0?",
            question_type=QuestionType.MCQ,
            difficulty=Difficulty.MEDIUM,
            explanation="It depends on the direction of approach.",
            points=5,
            answer_data_json={"kind": "mcq", "correctChoiceId": "choice-2"},
        )
        question.chapters = [chapter]
        question.lessons = [lesson]
        question.concepts = [concept]
        session.add(question)
        await session.flush()

        session.add_all(
            [
                QuestionChoice(question_id=question.id, choice_text="0", is_correct=False, position=1),
                QuestionChoice(question_id=question.id, choice_text="Does not exist", is_correct=True, position=2),
            ]
        )
        await session.flush()

        quiz_attempt = QuizAttempt(
            quiz_id=quiz.id,
            student_id=uuid.UUID(student_id),
            status=QuizAttemptStatus.SUBMITTED,
            started_at=datetime.now(UTC) - timedelta(days=2),
            submitted_at=datetime.now(UTC) - timedelta(days=2),
        )
        session.add(quiz_attempt)
        await session.flush()

        quiz_result = QuizResult(
            attempt_id=quiz_attempt.id,
            score=0,
            max_score=5,
            percentage=0,
            passed=False,
            graded_at=datetime.now(UTC) - timedelta(days=1),
        )
        session.add(quiz_result)
        await session.flush()

        session.add(
            QuestionResult(
                quiz_result_id=quiz_result.id,
                question_id=question.id,
                earned_points=0,
                max_points=5,
                is_correct=False,
                pending_manual_review=False,
            )
        )
        session.add(Enrollment(student_id=uuid.UUID(student_id), course_id=course.id))
        await session.commit()

        return {
            "teacher_id": teacher_id,
            "student_id": student_id,
            "course_id": str(course.id),
            "question_id": str(question.id),
        }


@pytest.mark.asyncio
async def test_student_notes_bookmarks_revision_and_context():
    seeded = await _seed_learning_bundle()
    async with _client() as client:
        token = await _login(client, "student-memory@classz.io")

        create_note_response = await client.post(
            "/api/student/me/notes",
            json={
                "body": "The squeeze theorem is useful when a direct limit is hard.",
                "subject_name": "Mathematics",
                "course_name": "Memory Calculus",
                "session_title": "Revision Session",
                "session_item_title": "Core Limits",
                "session_item_id": "limits-1",
                "item_type": "notes",
                "tags": ["limits", "revision"],
                "importance": "high",
            },
            headers=_auth(token),
        )
        assert create_note_response.status_code == 201, create_note_response.text
        note_id = create_note_response.json()["id"]

        patch_note_response = await client.patch(
            f"/api/student/me/notes/{note_id}",
            json={"body": "The squeeze theorem helps with difficult limits.", "pinned": True},
            headers=_auth(token),
        )
        assert patch_note_response.status_code == 200, patch_note_response.text
        assert patch_note_response.json()["pinned"] is True

        notes_response = await client.get("/api/student/me/notes", headers=_auth(token))
        bookmark_response = await client.patch(
            f"/api/student/wrong-questions/{seeded['question_id']}/bookmark",
            json={"bookmarked": True},
            headers=_auth(token),
        )
        wrong_questions_response = await client.get("/api/student/wrong-questions", headers=_auth(token))
        revision_response = await client.get("/api/student/me/revision", headers=_auth(token))
        context_response = await client.get("/api/student/me/assistant-context", headers=_auth(token))

        delete_note_response = await client.delete(f"/api/student/me/notes/{note_id}", headers=_auth(token))

    assert notes_response.status_code == 200, notes_response.text
    assert len(notes_response.json()) == 1

    assert bookmark_response.status_code == 200, bookmark_response.text
    assert bookmark_response.json()["bookmarked"] is True

    wrong_questions = wrong_questions_response.json()
    assert wrong_questions[0]["bookmarked"] is True

    revision = revision_response.json()
    assert revision["items"]
    assert any(item["source"] == "wrong_question" for item in revision["items"])

    context = context_response.json()
    assert context["overview"]
    assert context["recommendations"]
    assert context["quick_prompts"]
    assert context["revision_summary"]["items"]
    assert context["recent_notes"][0]["body"].startswith("The squeeze theorem")

    assert delete_note_response.status_code == 204, delete_note_response.text
