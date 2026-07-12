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
from app.modules.courses.models import Course
from app.modules.enrollments.models import Enrollment, EnrollmentStatus
from app.modules.lessons.models import Lesson
from app.modules.materials.models import Material, MaterialStatus, MaterialType
from app.modules.session_blocks.models import BlockType, SessionBlock
from app.modules.sessions.models import Session, SessionStatus
from app.modules.videos.models import Video, VideoProvider

TEST_ENGINE = create_async_engine(
    "sqlite+aiosqlite://",
    echo=False,
    poolclass=StaticPool,
)
TestSession = async_sessionmaker(
    bind=TEST_ENGINE, class_=AsyncSession, expire_on_commit=False,
)

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
        return user.id


def _client():
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")


async def _login(client: httpx.AsyncClient, email: str, password: str = "Test1234!") -> str:
    resp = await client.post("/api/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def _seed_student_session_bundle(*, include_video_block: bool = False) -> dict[str, str]:
    teacher_id = await _seed_user("teacher-student-content@classz.io", Role.TEACHER)
    enrolled_student_id = await _seed_user("enrolled-student@classz.io", Role.STUDENT)
    outsider_student_id = await _seed_user("outsider-student@classz.io", Role.STUDENT)

    async with TestSession() as session:
        course = Course(
            public_code=_next_public_code("CRS"),
            title="Biology",
            slug=f"biology-{_nextval('seq_test_slug')}",
            subject="Science",
            grade="9",
            teacher_id=teacher_id,
            is_published=True,
        )
        session.add(course)
        await session.flush()

        chapter = Chapter(
            public_code=_next_public_code("CHP"),
            course_id=course.id,
            title="Chapter 1",
            position=1,
        )
        lesson = Lesson(
            public_code=_next_public_code("LSN"),
            chapter=chapter,
            title="Lesson 1",
            position=1,
        )
        concept = Concept(
            public_code=_next_public_code("CON"),
            lesson=lesson,
            title="Concept 1",
            position=1,
        )
        atomic_concept = AtomicConcept(
            public_code=_next_public_code("ATM"),
            concept=concept,
            title="Atomic Concept 1",
            position=1,
        )

        class_session = Session(
            public_code=_next_public_code("SES"),
            course_id=course.id,
            title="Session 1",
            description="Student-safe session",
            position=1,
            status=SessionStatus.published,
            chapters=[chapter],
            lessons=[lesson],
            concepts=[concept],
            atomic_concepts=[atomic_concept],
        )

        text_block = SessionBlock(
            session=class_session,
            block_type=BlockType.TEXT,
            position=0,
            data_json={"content": "Intro text"},
        )
        pdf_block = SessionBlock(
            session=class_session,
            block_type=BlockType.PDF,
            position=1,
            data_json={"title": "Worksheet", "file_url": "/uploads/worksheet.pdf"},
        )

        session.add_all([chapter, lesson, concept, atomic_concept, class_session, text_block, pdf_block])
        await session.flush()

        if include_video_block:
            video_block = SessionBlock(
                session=class_session,
                block_type=BlockType.VIDEO,
                position=2,
                data_json={},
            )
            session.add(video_block)
            await session.flush()
            session.add(
                Video(
                    session_block_id=video_block.id,
                    title="Recorded Lecture",
                    provider=VideoProvider.LOCAL,
                    provider_video_id="/uploads/lecture.mp4",
                    duration_seconds=180,
                    thumbnail_url="https://example.com/thumb.jpg",
                )
            )

        video_material = Material(
            public_code=_next_public_code("MAT"),
            course_id=course.id,
            session_id=class_session.id,
            type=MaterialType.video,
            title="Session Video Material",
            video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            status=MaterialStatus.published,
            position=2,
            lessons=[lesson],
        )
        notes_material = Material(
            public_code=_next_public_code("MAT"),
            course_id=course.id,
            type=MaterialType.notes,
            title="Lesson Notes",
            notes_content="Important lesson notes",
            status=MaterialStatus.published,
            position=3,
            concepts=[concept],
        )
        draft_material = Material(
            public_code=_next_public_code("MAT"),
            course_id=course.id,
            type=MaterialType.pdf,
            title="Draft Material",
            file_url="/uploads/draft.pdf",
            status=MaterialStatus.draft,
            position=4,
            lessons=[lesson],
        )
        enrollment = Enrollment(
            student_id=enrolled_student_id,
            course_id=course.id,
            status=EnrollmentStatus.ACTIVE,
        )

        session.add_all([video_material, notes_material, draft_material, enrollment])

        await session.commit()

        return {
            "course_id": str(course.id),
            "session_id": str(class_session.id),
            "text_block_id": str(text_block.id),
            "material_title": "Session Video Material",
            "notes_title": "Lesson Notes",
            "material_id": str(video_material.id),
            "teacher_id": teacher_id,
            "enrolled_student_id": enrolled_student_id,
            "outsider_student_id": outsider_student_id,
        }


@pytest.mark.asyncio
async def test_student_cannot_list_sessions_for_unenrolled_course():
    seeded = await _seed_student_session_bundle()
    async with _client() as client:
        outsider_token = await _login(client, "outsider-student@classz.io")
        response = await client.get(
            f"/api/sessions?course_id={seeded['course_id']}",
            headers=_auth(outsider_token),
        )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_student_cannot_list_materials_for_unenrolled_course():
    seeded = await _seed_student_session_bundle()
    async with _client() as client:
        outsider_token = await _login(client, "outsider-student@classz.io")
        response = await client.get(
            f"/api/materials?course_id={seeded['course_id']}",
            headers=_auth(outsider_token),
        )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_student_cannot_get_material_for_unenrolled_course():
    seeded = await _seed_student_session_bundle()
    async with _client() as client:
        outsider_token = await _login(client, "outsider-student@classz.io")
        response = await client.get(
            f"/api/materials/{seeded['material_id']}",
            headers=_auth(outsider_token),
        )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_student_session_blocks_require_owned_session():
    seeded = await _seed_student_session_bundle()
    async with _client() as client:
        outsider_token = await _login(client, "outsider-student@classz.io")
        missing_query_response = await client.get(
            "/api/session-blocks",
            headers=_auth(outsider_token),
        )
        list_response = await client.get(
            f"/api/session-blocks?session_id={seeded['session_id']}",
            headers=_auth(outsider_token),
        )
        get_response = await client.get(
            f"/api/session-blocks/{seeded['text_block_id']}",
            headers=_auth(outsider_token),
        )

    assert missing_query_response.status_code == 400
    assert list_response.status_code == 403
    assert get_response.status_code == 403


@pytest.mark.asyncio
async def test_student_session_detail_returns_aggregated_ordered_content():
    seeded = await _seed_student_session_bundle(include_video_block=True)
    async with _client() as client:
        enrolled_token = await _login(client, "enrolled-student@classz.io")
        response = await client.get(
            f"/api/student/session-detail/{seeded['session_id']}",
            headers=_auth(enrolled_token),
        )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["course"]["id"] == seeded["course_id"]
    assert body["session"]["id"] == seeded["session_id"]
    assert [block["position"] for block in body["blocks"]] == [0, 1, 2]
    assert [material["title"] for material in body["materials"]] == [
        seeded["material_title"],
        seeded["notes_title"],
    ]
    assert [chapter["position"] for chapter in body["chapters"]] == [1]
    assert [lesson["position"] for lesson in body["lessons"]] == [1]
    assert [concept["position"] for concept in body["concepts"]] == [1]
    assert [atomic["position"] for atomic in body["atomic_concepts"]] == [1]
    assert len(body["videos"]) == 1
    assert body["videos"][0]["provider_video_id"] == "/uploads/lecture.mp4"


@pytest.mark.asyncio
async def test_student_session_detail_rejects_unenrolled_student():
    seeded = await _seed_student_session_bundle(include_video_block=True)
    async with _client() as client:
        outsider_token = await _login(client, "outsider-student@classz.io")
        response = await client.get(
            f"/api/student/session-detail/{seeded['session_id']}",
            headers=_auth(outsider_token),
        )

    assert response.status_code == 403
