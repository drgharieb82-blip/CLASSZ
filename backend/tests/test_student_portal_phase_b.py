import uuid
from datetime import datetime, timezone
from pathlib import Path

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
from app.modules.materials import router as materials_router
from app.modules.materials.models import Material, MaterialStatus, MaterialType
from app.modules.progress.models import SessionProgress
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
async def _fresh_db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(materials_router, "_UPLOAD_ROOT", tmp_path)
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


async def _seed_portal_bundle() -> dict[str, str]:
    teacher_id = await _seed_user("teacher-portal@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-portal@classz.io", Role.STUDENT)

    async with TestSession() as session:
        course = Course(
            public_code=_next_public_code("CRS"),
            title="Portal Calculus",
            slug=f"portal-calculus-{_nextval('seq_slug')}",
            description="Student portal test course",
            subject="Mathematics",
            grade="12",
            teacher_id=uuid.UUID(teacher_id),
            price=25,
            is_published=True,
        )
        session.add(course)
        await session.flush()

        session_one = Session(
            public_code=_next_public_code("SES"),
            course_id=course.id,
            title="Portal Session 1",
            description="Intro",
            position=1,
            status=SessionStatus.published,
        )
        session_two = Session(
            public_code=_next_public_code("SES"),
            course_id=course.id,
            title="Portal Session 2",
            description="Practice",
            position=2,
            status=SessionStatus.published,
        )
        session.add_all([session_one, session_two])
        await session.flush()

        material = Material(
            public_code=_next_public_code("MAT"),
            course_id=course.id,
            session_id=session_one.id,
            type=MaterialType.pdf,
            title="Portal Notes",
            description="Signed access test",
            file_url="/uploads/materials/test.pdf",
            file_name="test.pdf",
            mime_type="application/pdf",
            status=MaterialStatus.published,
            position=1,
        )
        session.add(material)
        await session.flush()

        session.add(
            SessionProgress(
                student_id=uuid.UUID(student_id),
                session_id=session_one.id,
                started_at=datetime.now(timezone.utc),
                completed_at=datetime.now(timezone.utc),
                percent_complete=100,
                last_position_seconds=900,
            )
        )
        session.add(
            SessionProgress(
                student_id=uuid.UUID(student_id),
                session_id=session_two.id,
                started_at=datetime.now(timezone.utc),
                percent_complete=35,
                last_position_seconds=360,
            )
        )
        await session.commit()

        return {
            "teacher_id": teacher_id,
            "student_id": student_id,
            "course_id": str(course.id),
            "material_id": str(material.id),
        }


@pytest.mark.asyncio
async def test_student_portal_dashboard_profile_and_notifications():
    seeded = await _seed_portal_bundle()
    async with _client() as client:
        token = await _login(client, "student-portal@classz.io")

        recharge_response = await client.post(
            "/api/wallets/me/recharge",
            json={"amount": 50, "payment_method": "Card"},
            headers=_auth(token),
        )
        assert recharge_response.status_code == 201, recharge_response.text

        enroll_response = await client.post(
            "/api/enrollments",
            json={"course_id": seeded["course_id"]},
            headers=_auth(token),
        )
        assert enroll_response.status_code == 201, enroll_response.text

        dashboard_response = await client.get("/api/student/me/dashboard", headers=_auth(token))
        profile_update_response = await client.patch(
            "/api/student/me/profile",
            json={
                "full_name": "Portal Student",
                "headline": "Consistent learner",
                "bio": "I am using the real student portal.",
                "avatar_url": "https://example.com/avatar.png",
            },
            headers=_auth(token),
        )
        settings_update_response = await client.patch(
            "/api/student/me/settings",
            json={
                "timezone": "Africa/Cairo",
                "language": "en",
                "theme": "dark",
                "notifications_enabled": True,
                "email_notifications": True,
                "push_notifications": False,
                "weekly_digest_enabled": True,
                "study_reminder_enabled": True,
                "study_goal_minutes": 90,
            },
            headers=_auth(token),
        )
        notifications_response = await client.get("/api/notifications/me", headers=_auth(token))

    assert dashboard_response.status_code == 200, dashboard_response.text
    dashboard = dashboard_response.json()
    assert dashboard["progress"]["total_courses_enrolled"] == 1
    assert dashboard["progress"]["total_sessions"] == 2
    assert dashboard["wallet_balance"] == 25.0
    assert dashboard["notifications"]["unread_count"] >= 2
    assert dashboard["featured_courses"][0]["course_title"] == "Portal Calculus"

    assert profile_update_response.status_code == 200, profile_update_response.text
    assert profile_update_response.json()["full_name"] == "Portal Student"
    assert settings_update_response.status_code == 200, settings_update_response.text
    assert settings_update_response.json()["theme"] == "dark"

    notifications = notifications_response.json()["items"]
    assert len(notifications) >= 2
    assert any(item["title"] == "Wallet recharge successful" for item in notifications)
    assert any(item["title"].startswith("Enrollment confirmed") for item in notifications)


@pytest.mark.asyncio
async def test_material_access_issues_signed_redirect(tmp_path: Path):
    seeded = await _seed_portal_bundle()

    file_dir = tmp_path / "materials"
    file_dir.mkdir(parents=True, exist_ok=True)
    file_bytes = b"%PDF-1.4 test material contents"
    (file_dir / "test.pdf").write_bytes(file_bytes)

    async with _client() as client:
        token = await _login(client, "student-portal@classz.io")
        await client.post(
            "/api/wallets/me/recharge",
            json={"amount": 50, "payment_method": "Card"},
            headers=_auth(token),
        )
        await client.post("/api/enrollments", json={"course_id": seeded["course_id"]}, headers=_auth(token))
        access_response = await client.post(
            f"/api/materials/{seeded['material_id']}/access",
            json={"access_type": "download"},
            headers=_auth(token),
        )

        assert access_response.status_code == 200, access_response.text
        access_url = access_response.json()["access_url"]

        file_response = await client.get(access_url, headers=_auth(token), follow_redirects=False)

    assert file_response.status_code == 200, file_response.text
    assert file_response.content == file_bytes
