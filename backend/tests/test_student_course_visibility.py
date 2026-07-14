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
from app.modules.enrollments.models import Enrollment, EnrollmentStatus
from app.modules.materials.models import Material, MaterialStatus, MaterialType
from app.modules.sessions.models import Session, SessionStatus

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


def _next_public_code(prefix: str) -> str:
    global _public_code_counter
    _public_code_counter += 1
    return f"{prefix}-26-{_public_code_counter:06d}"


async def _seed_user(email: str, role: Role, password: str = "Test1234!"):
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
    response = await client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def _seed_visibility_bundle() -> dict[str, str]:
    teacher_id = await _seed_user("teacher-visibility@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-visibility@classz.io", Role.STUDENT)

    async with TestSession() as session:
        published_course = Course(
            public_code=_next_public_code("CRS"),
            title="Published Course",
            slug=f"published-course-{_nextval('seq_slug')}",
            description="Live course",
            subject="Science",
            grade="9",
            teacher_id=teacher_id,
            is_published=True,
        )
        unpublished_course = Course(
            public_code=_next_public_code("CRS"),
            title="Draft Course",
            slug=f"draft-course-{_nextval('seq_slug')}",
            description="Draft course",
            subject="Science",
            grade="9",
            teacher_id=teacher_id,
            is_published=False,
        )
        session.add_all([published_course, unpublished_course])
        await session.flush()

        published_session = Session(
            public_code=_next_public_code("SES"),
            course_id=published_course.id,
            title="Published Session",
            description="Visible session",
            position=1,
            status=SessionStatus.published,
        )
        draft_session = Session(
            public_code=_next_public_code("SES"),
            course_id=published_course.id,
            title="Draft Session",
            description="Hidden session",
            position=2,
            status=SessionStatus.draft,
        )
        unpublished_course_session = Session(
            public_code=_next_public_code("SES"),
            course_id=unpublished_course.id,
            title="Unpublished Course Session",
            description="Hidden by course",
            position=1,
            status=SessionStatus.published,
        )
        session.add_all([published_session, draft_session, unpublished_course_session])
        await session.flush()

        published_material = Material(
            public_code=_next_public_code("MAT"),
            course_id=published_course.id,
            session_id=published_session.id,
            type=MaterialType.notes,
            title="Published Notes",
            notes_content="Visible",
            status=MaterialStatus.published,
            position=1,
        )
        draft_material = Material(
            public_code=_next_public_code("MAT"),
            course_id=published_course.id,
            session_id=published_session.id,
            type=MaterialType.notes,
            title="Draft Notes",
            notes_content="Hidden",
            status=MaterialStatus.draft,
            position=2,
        )
        unpublished_course_material = Material(
            public_code=_next_public_code("MAT"),
            course_id=unpublished_course.id,
            session_id=unpublished_course_session.id,
            type=MaterialType.notes,
            title="Unpublished Course Notes",
            notes_content="Hidden by course",
            status=MaterialStatus.published,
            position=1,
        )
        session.add_all([published_material, draft_material, unpublished_course_material])

        session.add_all(
            [
                Enrollment(
                    student_id=student_id,
                    course_id=published_course.id,
                    status=EnrollmentStatus.ACTIVE,
                ),
                Enrollment(
                    student_id=student_id,
                    course_id=unpublished_course.id,
                    status=EnrollmentStatus.ACTIVE,
                ),
            ]
        )
        await session.commit()
        return {
            "teacher_id": teacher_id,
            "student_id": student_id,
            "published_course_id": str(published_course.id),
            "unpublished_course_id": str(unpublished_course.id),
            "published_session_id": str(published_session.id),
            "draft_session_id": str(draft_session.id),
            "unpublished_course_session_id": str(unpublished_course_session.id),
            "published_material_id": str(published_material.id),
            "draft_material_id": str(draft_material.id),
            "unpublished_course_material_id": str(unpublished_course_material.id),
        }


@pytest.mark.asyncio
async def test_student_cannot_list_unpublished_courses():
    await _seed_visibility_bundle()
    async with _client() as client:
        student_token = await _login(client, "student-visibility@classz.io")
        response = await client.get("/api/courses", headers=_auth(student_token))

    assert response.status_code == 200, response.text
    titles = {item["title"] for item in response.json()}
    assert "Published Course" in titles
    assert "Draft Course" not in titles


@pytest.mark.asyncio
async def test_student_cannot_enroll_in_unpublished_course():
    seeded = await _seed_visibility_bundle()
    await _seed_user("fresh-student@classz.io", Role.STUDENT)

    async with _client() as client:
        student_token = await _login(client, "fresh-student@classz.io")
        response = await client.post(
            "/api/enrollments",
            headers=_auth(student_token),
            json={"course_id": seeded["unpublished_course_id"]},
        )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_student_cannot_access_unpublished_course_content():
    seeded = await _seed_visibility_bundle()
    async with _client() as client:
        student_token = await _login(client, "student-visibility@classz.io")

        course_response = await client.get(
            f"/api/courses/{seeded['unpublished_course_id']}",
            headers=_auth(student_token),
        )
        session_list_response = await client.get(
            f"/api/sessions?course_id={seeded['published_course_id']}",
            headers=_auth(student_token),
        )
        draft_session_detail = await client.get(
            f"/api/student/session-detail/{seeded['draft_session_id']}",
            headers=_auth(student_token),
        )
        unpublished_course_session_detail = await client.get(
            f"/api/student/session-detail/{seeded['unpublished_course_session_id']}",
            headers=_auth(student_token),
        )
        materials_response = await client.get(
            f"/api/materials?course_id={seeded['published_course_id']}",
            headers=_auth(student_token),
        )
        draft_material_response = await client.get(
            f"/api/materials/{seeded['draft_material_id']}",
            headers=_auth(student_token),
        )
        unpublished_course_material_response = await client.get(
            f"/api/materials/{seeded['unpublished_course_material_id']}",
            headers=_auth(student_token),
        )
        enrollments_response = await client.get("/api/enrollments/me", headers=_auth(student_token))
        enrollment_status_response = await client.get(
            f"/api/enrollments/me/{seeded['unpublished_course_id']}",
            headers=_auth(student_token),
        )

    assert course_response.status_code == 404
    assert session_list_response.status_code == 200
    assert [item["title"] for item in session_list_response.json()] == ["Published Session"]
    assert draft_session_detail.status_code == 404
    assert unpublished_course_session_detail.status_code == 404
    assert materials_response.status_code == 200
    assert [item["title"] for item in materials_response.json()] == ["Published Notes"]
    assert draft_material_response.status_code == 404
    assert unpublished_course_material_response.status_code == 404
    assert enrollments_response.status_code == 200
    assert [item["course"]["title"] for item in enrollments_response.json()["items"]] == ["Published Course"]
    assert enrollment_status_response.status_code == 200
    assert enrollment_status_response.json() == {"enrolled": False, "enrollment": None}


@pytest.mark.asyncio
async def test_teacher_can_still_access_and_manage_unpublished_courses():
    seeded = await _seed_visibility_bundle()
    async with _client() as client:
        teacher_token = await _login(client, "teacher-visibility@classz.io")

        course_list_response = await client.get("/api/courses", headers=_auth(teacher_token))
        course_response = await client.get(
            f"/api/courses/{seeded['unpublished_course_id']}",
            headers=_auth(teacher_token),
        )
        session_list_response = await client.get(
            f"/api/sessions?course_id={seeded['unpublished_course_id']}",
            headers=_auth(teacher_token),
        )
        materials_response = await client.get(
            f"/api/materials?course_id={seeded['unpublished_course_id']}",
            headers=_auth(teacher_token),
        )
        create_session_response = await client.post(
            "/api/sessions",
            headers=_auth(teacher_token),
            json={
                "course_id": seeded["unpublished_course_id"],
                "title": "Teacher Draft Session",
                "description": "Managed by teacher",
                "is_free_preview": False,
                "requires_previous_completion": False,
                "is_locked": False,
                "chapter_ids": [],
                "lesson_ids": [],
                "concept_ids": [],
                "atomic_concept_ids": [],
            },
        )

    assert course_list_response.status_code == 200
    titles = {item["title"] for item in course_list_response.json()}
    assert "Draft Course" in titles
    assert course_response.status_code == 200
    assert session_list_response.status_code == 200
    assert [item["title"] for item in session_list_response.json()] == ["Unpublished Course Session"]
    assert materials_response.status_code == 200
    assert [item["title"] for item in materials_response.json()] == ["Unpublished Course Notes"]
    assert create_session_response.status_code == 201, create_session_response.text
    assert create_session_response.json()["course_id"] == seeded["unpublished_course_id"]
