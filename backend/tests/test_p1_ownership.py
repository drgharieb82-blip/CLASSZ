"""Regression tests for the P1 ownership gaps from the 2026-07-11 platform
audit: chapters/lessons/concepts/atomic_concepts list endpoints, session
blocks, videos, and anti-cheating event listing all previously let any
authenticated caller read data outside their own course/enrollment.

Self-contained, no shared fixtures — mirrors the pattern in test_grading.py.
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
from app.modules.atomic_concepts.models import AtomicConcept
from app.modules.chapters.models import Chapter
from app.modules.concepts.models import Concept
from app.modules.enrollments.models import Enrollment, EnrollmentStatus
from app.modules.lessons.models import Lesson
from app.modules.quiz_attempts.models import QuizAttempt, QuizAttemptStatus
from app.modules.quizzes.models import Quiz
from app.modules.session_blocks.models import BlockType, SessionBlock
from app.modules.sessions.models import Session as ClassSession, SessionStatus
from app.modules.videos.models import Video, VideoProvider

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


async def _seed_full_curriculum(course_id: str) -> dict[str, str]:
    """Course -> chapter -> lesson -> concept -> atomic concept, plus a
    session -> session block -> video, all under the given course."""
    async with TestSession() as session:
        chapter = Chapter(
            public_code=_next_public_code("CHP"),
            course_id=uuid.UUID(course_id),
            title="Chapter 1",
            position=1,
        )
        session.add(chapter)
        await session.flush()

        lesson = Lesson(
            public_code=_next_public_code("LSN"),
            chapter_id=chapter.id,
            title="Lesson 1",
            position=1,
        )
        session.add(lesson)
        await session.flush()

        concept = Concept(
            public_code=_next_public_code("CNC"),
            lesson_id=lesson.id,
            title="Concept 1",
            position=1,
        )
        session.add(concept)
        await session.flush()

        atomic_concept = AtomicConcept(
            public_code=_next_public_code("ATC"),
            concept_id=concept.id,
            title="Atomic 1",
            position=1,
        )
        session.add(atomic_concept)

        class_session = ClassSession(
            public_code=_next_public_code("SES"),
            course_id=uuid.UUID(course_id),
            title="Session 1",
            description="Intro",
            position=1,
            status=SessionStatus.published,
        )
        session.add(class_session)
        await session.flush()

        block = SessionBlock(
            session_id=class_session.id,
            block_type=BlockType.TEXT,
            position=1,
            data_json={"content": "intro"},
        )
        session.add(block)
        await session.flush()

        video = Video(
            session_block_id=block.id,
            title="Intro video",
            provider=VideoProvider.LOCAL,
            provider_video_id="abc123",
            duration_seconds=120,
        )
        session.add(video)

        await session.commit()

        return {
            "chapter_id": str(chapter.id),
            "lesson_id": str(lesson.id),
            "concept_id": str(concept.id),
            "atomic_concept_id": str(atomic_concept.id),
            "session_id": str(class_session.id),
            "block_id": str(block.id),
            "video_id": str(video.id),
        }


async def _enroll(student_id: str, course_id: str) -> None:
    async with TestSession() as session:
        session.add(
            Enrollment(
                student_id=uuid.UUID(student_id),
                course_id=uuid.UUID(course_id),
                status=EnrollmentStatus.ACTIVE,
            )
        )
        await session.commit()


@pytest.mark.asyncio
async def test_unenrolled_student_cannot_list_chapters_lessons_concepts_atomic_concepts():
    teacher_id = await _seed_user("teacher-p1a@classz.io", Role.TEACHER)
    await _seed_user("student-p1a@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-p1a@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-p1a")
        ids = await _seed_full_curriculum(course["id"])

        student_token = await _login(c, "student-p1a@classz.io")
        chapters_resp = await c.get(
            "/api/chapters", params={"course_id": course["id"]}, headers=_auth(student_token)
        )
        lessons_resp = await c.get(
            "/api/lessons", params={"chapter_id": ids["chapter_id"]}, headers=_auth(student_token)
        )
        concepts_resp = await c.get(
            "/api/concepts", params={"lesson_id": ids["lesson_id"]}, headers=_auth(student_token)
        )
        atomic_resp = await c.get(
            "/api/atomic-concepts", params={"concept_id": ids["concept_id"]}, headers=_auth(student_token)
        )

    assert chapters_resp.status_code == 403, chapters_resp.text
    assert lessons_resp.status_code == 403, lessons_resp.text
    assert concepts_resp.status_code == 403, concepts_resp.text
    assert atomic_resp.status_code == 403, atomic_resp.text


@pytest.mark.asyncio
async def test_enrolled_student_can_list_chapters_lessons_concepts_atomic_concepts():
    teacher_id = await _seed_user("teacher-p1b@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-p1b@classz.io", Role.STUDENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-p1b@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-p1b")
        ids = await _seed_full_curriculum(course["id"])
        await _enroll(student_id, course["id"])

        student_token = await _login(c, "student-p1b@classz.io")
        chapters_resp = await c.get(
            "/api/chapters", params={"course_id": course["id"]}, headers=_auth(student_token)
        )
        lessons_resp = await c.get(
            "/api/lessons", params={"chapter_id": ids["chapter_id"]}, headers=_auth(student_token)
        )
        concepts_resp = await c.get(
            "/api/concepts", params={"lesson_id": ids["lesson_id"]}, headers=_auth(student_token)
        )
        atomic_resp = await c.get(
            "/api/atomic-concepts", params={"concept_id": ids["concept_id"]}, headers=_auth(student_token)
        )

    assert chapters_resp.status_code == 200, chapters_resp.text
    assert len(chapters_resp.json()) == 1
    assert lessons_resp.status_code == 200, lessons_resp.text
    assert len(lessons_resp.json()) == 1
    assert concepts_resp.status_code == 200, concepts_resp.text
    assert len(concepts_resp.json()) == 1
    assert atomic_resp.status_code == 200, atomic_resp.text
    assert len(atomic_resp.json()) == 1


@pytest.mark.asyncio
async def test_non_owning_teacher_cannot_read_session_block_or_video():
    teacher_id = await _seed_user("teacher-p1c@classz.io", Role.TEACHER)
    await _seed_user("teacher-p1d@classz.io", Role.TEACHER)
    async with _client() as c:
        owner_token = await _login(c, "teacher-p1c@classz.io")
        course = await _create_course(c, owner_token, teacher_id, "course-p1c")
        ids = await _seed_full_curriculum(course["id"])

        other_token = await _login(c, "teacher-p1d@classz.io")
        block_resp = await c.get(f"/api/session-blocks/{ids['block_id']}", headers=_auth(other_token))
        list_resp = await c.get("/api/session-blocks", headers=_auth(other_token))
        video_resp = await c.get(f"/api/videos/{ids['video_id']}", headers=_auth(other_token))
        video_list_resp = await c.get("/api/videos", headers=_auth(other_token))

    assert block_resp.status_code == 403, block_resp.text
    assert list_resp.status_code == 200, list_resp.text
    assert all(b["id"] != ids["block_id"] for b in list_resp.json())
    assert video_resp.status_code == 403, video_resp.text
    assert video_list_resp.status_code == 200, video_list_resp.text
    assert all(v["id"] != ids["video_id"] for v in video_list_resp.json())


@pytest.mark.asyncio
async def test_owning_teacher_can_read_session_block_and_video():
    teacher_id = await _seed_user("teacher-p1e@classz.io", Role.TEACHER)
    async with _client() as c:
        owner_token = await _login(c, "teacher-p1e@classz.io")
        course = await _create_course(c, owner_token, teacher_id, "course-p1e")
        ids = await _seed_full_curriculum(course["id"])

        block_resp = await c.get(f"/api/session-blocks/{ids['block_id']}", headers=_auth(owner_token))
        video_resp = await c.get(f"/api/videos/{ids['video_id']}", headers=_auth(owner_token))

    assert block_resp.status_code == 200, block_resp.text
    assert video_resp.status_code == 200, video_resp.text


@pytest.mark.asyncio
async def test_non_owning_teacher_cannot_list_other_teachers_anti_cheating_events():
    teacher_id = await _seed_user("teacher-p1f@classz.io", Role.TEACHER)
    await _seed_user("teacher-p1g@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-p1f@classz.io", Role.STUDENT)
    async with _client() as c:
        owner_token = await _login(c, "teacher-p1f@classz.io")
        course = await _create_course(c, owner_token, teacher_id, "course-p1f")

        async with TestSession() as session:
            quiz = Quiz(course_id=uuid.UUID(course["id"]), title="Quiz 1")
            session.add(quiz)
            await session.flush()
            attempt = QuizAttempt(
                quiz_id=quiz.id,
                student_id=uuid.UUID(student_id),
                status=QuizAttemptStatus.SUBMITTED,
                started_at=datetime.now(timezone.utc),
            )
            session.add(attempt)
            await session.commit()
            attempt_id = str(attempt.id)

        other_token = await _login(c, "teacher-p1g@classz.io")
        resp = await c.get(f"/api/anti-cheating/attempts/{attempt_id}/events", headers=_auth(other_token))
        owner_resp = await c.get(f"/api/anti-cheating/attempts/{attempt_id}/events", headers=_auth(owner_token))

    assert resp.status_code == 403, resp.text
    assert owner_resp.status_code == 200, owner_resp.text
