"""Auth endpoint tests — self-contained, no shared fixtures.

Uses an in-memory SQLite database and httpx ASGI transport so tests
run without Docker or PostgreSQL.
"""

import logging
from datetime import datetime, timedelta, timezone

import httpx
import pytest
import pytest_asyncio
from jose import jwt
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import get_db_session
from app.main import app
from app.models.user import Role, User

TEST_ENGINE = create_async_engine(
    "sqlite+aiosqlite://",
    echo=False,
    poolclass=StaticPool,
)
TestSession = async_sessionmaker(
    bind=TEST_ENGINE, class_=AsyncSession, expire_on_commit=False,
)

# Registration generates public codes via Postgres sequences
# (`SELECT nextval('seq_student_code')`, etc), which SQLite doesn't support.
# Register a simple in-memory stand-in for tests rather than touching
# production code.
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
    # Re-point the override on every test rather than once at import time —
    # multiple test files share the same `app` singleton and each has its own
    # engine, so whichever module imported last would otherwise "win" for the
    # whole session when tests run together.
    app.dependency_overrides[get_db_session] = _override_session
    async with TEST_ENGINE.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield


async def _seed_user(
    email: str = "test@classz.io",
    password: str = "Test1234!",
    role: Role = Role.STUDENT,
    is_active: bool = True,
) -> None:
    async with TestSession() as session:
        user = User(
            email=email,
            public_code=f"TST-26-{_nextval('seq_test_seed_user'):06d}",
            full_name="Test User",
            hashed_password=hash_password(password),
            role=role,
            is_active=is_active,
        )
        session.add(user)
        await session.commit()


def _client():
    return httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test",
    )


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_login_success():
    await _seed_user()
    async with _client() as c:
        resp = await c.post(
            "/api/auth/login",
            json={"email": "test@classz.io", "password": "Test1234!"},
        )
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == "test@classz.io"
    assert body["user"]["role"] == "student"
    assert body["user"]["is_active"] is True


@pytest.mark.asyncio
async def test_login_wrong_password():
    await _seed_user()
    async with _client() as c:
        resp = await c.post(
            "/api/auth/login",
            json={"email": "test@classz.io", "password": "WrongPass!"},
        )
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid email or password"


@pytest.mark.asyncio
async def test_login_nonexistent_email():
    async with _client() as c:
        resp = await c.post(
            "/api/auth/login",
            json={"email": "nobody@classz.io", "password": "Whatever1!"},
        )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_inactive_user():
    await _seed_user(email="inactive@classz.io", is_active=False)
    async with _client() as c:
        resp = await c.post(
            "/api/auth/login",
            json={"email": "inactive@classz.io", "password": "Test1234!"},
        )
    assert resp.status_code == 403
    assert resp.json()["detail"] == "Account deactivated"


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_register_student():
    async with _client() as c:
        resp = await c.post(
            "/api/auth/register",
            json={
                "email": "newstudent@classz.io",
                "password": "Strong12!",
                "full_name": "Aya Mahmoud",
            },
        )
    assert resp.status_code == 201
    body = resp.json()
    assert body["user"]["email"] == "newstudent@classz.io"
    assert body["user"]["role"] == "student"
    assert "access_token" in body


@pytest.mark.asyncio
async def test_register_student_persists_profile_and_parent_contact():
    async with _client() as c:
        resp = await c.post(
            "/api/auth/register",
            json={
                "email": "profile-student@classz.io",
                "password": "Strong12!",
                "full_name": "Aya Mahmoud",
                "date_of_birth": "2012-05-01",
                "gender": "Female",
                "national_id": "12345678901234",
                "whatsapp": "+201000000000",
                "nickname": "Aya",
                "avatar": "\U0001F98A",
                "parent_name": "Mahmoud Ali",
                "parent_relation": "Father",
                "parent_whatsapp": "+201111111111",
            },
        )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["student"] is not None
    assert body["student"]["date_of_birth"] == "2012-05-01"
    assert body["student"]["gender"] == "Female"
    assert body["student"]["nickname"] == "Aya"

    token = body["access_token"]
    async with _client() as c:
        me_resp = await c.get("/api/students/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200, me_resp.text
    assert me_resp.json()["whatsapp"] == "+201000000000"


@pytest.mark.asyncio
async def test_register_student_without_profile_fields_omits_student():
    async with _client() as c:
        resp = await c.post(
            "/api/auth/register",
            json={
                "email": "bare-student@classz.io",
                "password": "Strong12!",
                "full_name": "Bare Student",
            },
        )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["student"] is not None
    assert body["student"]["date_of_birth"] is None
    assert body["student"]["nickname"] is None


@pytest.mark.asyncio
async def test_student_can_update_own_profile():
    async with _client() as c:
        register_resp = await c.post(
            "/api/auth/register",
            json={
                "email": "update-student@classz.io",
                "password": "Strong12!",
                "full_name": "Update Student",
            },
        )
        token = register_resp.json()["access_token"]

        update_resp = await c.patch(
            "/api/students/me",
            json={"nickname": "Newname", "whatsapp": "+201234567890"},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert update_resp.status_code == 200, update_resp.text
    assert update_resp.json()["nickname"] == "Newname"
    assert update_resp.json()["whatsapp"] == "+201234567890"


def _extract_logged_token(caplog: pytest.LogCaptureFixture, email: str) -> str | None:
    for record in caplog.records:
        message = record.getMessage()
        if "Password reset requested for" in message and email in message:
            marker = "token="
            start = message.index(marker) + len(marker)
            end = message.index(" ", start)
            return message[start:end]
    return None


@pytest.mark.asyncio
async def test_forgot_password_then_reset_succeeds(caplog):
    caplog.set_level(logging.INFO, logger="app.modules.auth.service")

    async with _client() as c:
        register_resp = await c.post(
            "/api/auth/register",
            json={
                "email": "reset-flow@classz.io",
                "password": "OldPass123!",
                "full_name": "Reset Flow",
            },
        )
        assert register_resp.status_code == 201

        forgot_resp = await c.post("/api/auth/forgot-password", json={"email": "reset-flow@classz.io"})
        assert forgot_resp.status_code == 200, forgot_resp.text

        token = _extract_logged_token(caplog, "reset-flow@classz.io")
        assert token is not None

        reset_resp = await c.post(
            "/api/auth/reset-password",
            json={"token": token, "new_password": "NewPass456!"},
        )
        assert reset_resp.status_code == 200, reset_resp.text

        old_login = await c.post(
            "/api/auth/login", json={"email": "reset-flow@classz.io", "password": "OldPass123!"}
        )
        assert old_login.status_code == 401

        new_login = await c.post(
            "/api/auth/login", json={"email": "reset-flow@classz.io", "password": "NewPass456!"}
        )
        assert new_login.status_code == 200


@pytest.mark.asyncio
async def test_forgot_password_does_not_reveal_account_existence():
    async with _client() as c:
        resp = await c.post("/api/auth/forgot-password", json={"email": "nobody@classz.io"})
    assert resp.status_code == 200
    assert "sent" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_reset_password_rejects_invalid_token():
    async with _client() as c:
        resp = await c.post(
            "/api/auth/reset-password",
            json={"token": "not-a-real-token", "new_password": "WhateverPass123!"},
        )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_reset_token_is_single_use(caplog):
    caplog.set_level(logging.INFO, logger="app.modules.auth.service")

    async with _client() as c:
        await c.post(
            "/api/auth/register",
            json={"email": "single-use@classz.io", "password": "OldPass123!", "full_name": "Single Use"},
        )
        await c.post("/api/auth/forgot-password", json={"email": "single-use@classz.io"})
        token = _extract_logged_token(caplog, "single-use@classz.io")
        assert token is not None

        first = await c.post("/api/auth/reset-password", json={"token": token, "new_password": "NewPass456!"})
        assert first.status_code == 200

        second = await c.post("/api/auth/reset-password", json={"token": token, "new_password": "AnotherPass789!"})
        assert second.status_code == 400


@pytest.mark.asyncio
async def test_register_parent():
    async with _client() as c:
        resp = await c.post(
            "/api/auth/register",
            json={
                "email": "parent@classz.io",
                "password": "Strong12!",
                "full_name": "Ahmed Parent",
                "role": "parent",
            },
        )
    assert resp.status_code == 201
    assert resp.json()["user"]["role"] == "parent"


@pytest.mark.asyncio
async def test_register_duplicate_email():
    await _seed_user(email="dup@classz.io")
    async with _client() as c:
        resp = await c.post(
            "/api/auth/register",
            json={
                "email": "dup@classz.io",
                "password": "Strong12!",
                "full_name": "Duplicate",
            },
        )
    assert resp.status_code == 409
    assert resp.json()["detail"] == "Email already registered"


@pytest.mark.asyncio
async def test_register_restricted_role_teacher():
    async with _client() as c:
        resp = await c.post(
            "/api/auth/register",
            json={
                "email": "teacher@classz.io",
                "password": "Strong12!",
                "full_name": "Teacher",
                "role": "teacher",
            },
        )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_register_restricted_role_admin():
    async with _client() as c:
        resp = await c.post(
            "/api/auth/register",
            json={
                "email": "admin@classz.io",
                "password": "Strong12!",
                "full_name": "Admin",
                "role": "admin",
            },
        )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_register_weak_password():
    async with _client() as c:
        resp = await c.post(
            "/api/auth/register",
            json={
                "email": "weak@classz.io",
                "password": "short",
                "full_name": "Weak Password",
            },
        )
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# GET /me
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_me_authenticated():
    await _seed_user()
    async with _client() as c:
        login_resp = await c.post(
            "/api/auth/login",
            json={"email": "test@classz.io", "password": "Test1234!"},
        )
        token = login_resp.json()["access_token"]
        resp = await c.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == "test@classz.io"
    assert body["role"] == "student"


@pytest.mark.asyncio
async def test_me_no_token():
    async with _client() as c:
        resp = await c.get("/api/auth/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_invalid_token():
    async with _client() as c:
        resp = await c.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer not-a-real-jwt"},
        )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_expired_token():
    expired = jwt.encode(
        {
            "sub": "00000000-0000-0000-0000-000000000000",
            "exp": datetime.now(timezone.utc) - timedelta(minutes=5),
        },
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    async with _client() as c:
        resp = await c.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {expired}"},
        )
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Register → Login → Me round-trip
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_register_then_login():
    async with _client() as c:
        reg = await c.post(
            "/api/auth/register",
            json={
                "email": "roundtrip@classz.io",
                "password": "Roundtrip1!",
                "full_name": "Round Trip",
            },
        )
        assert reg.status_code == 201

        login = await c.post(
            "/api/auth/login",
            json={"email": "roundtrip@classz.io", "password": "Roundtrip1!"},
        )
        assert login.status_code == 200

        token = login.json()["access_token"]
        me = await c.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me.status_code == 200
        assert me.json()["email"] == "roundtrip@classz.io"


# ---------------------------------------------------------------------------
# Refresh token / logout
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_login_issues_refresh_token():
    await _seed_user(email="refresh1@classz.io")
    async with _client() as c:
        resp = await c.post("/api/auth/login", json={"email": "refresh1@classz.io", "password": "Test1234!"})
    assert resp.status_code == 200
    assert resp.json()["refresh_token"]


@pytest.mark.asyncio
async def test_refresh_token_rotates_and_issues_new_access_token():
    await _seed_user(email="refresh2@classz.io")
    async with _client() as c:
        login = await c.post("/api/auth/login", json={"email": "refresh2@classz.io", "password": "Test1234!"})
        old_refresh = login.json()["refresh_token"]

        refreshed = await c.post("/api/auth/refresh", json={"refresh_token": old_refresh})
        assert refreshed.status_code == 200, refreshed.text
        new_access = refreshed.json()["access_token"]
        new_refresh = refreshed.json()["refresh_token"]
        assert new_refresh != old_refresh

        me = await c.get("/api/auth/me", headers={"Authorization": f"Bearer {new_access}"})
        assert me.status_code == 200

        # the rotated-out refresh token must no longer work
        reused = await c.post("/api/auth/refresh", json={"refresh_token": old_refresh})
        assert reused.status_code == 401


@pytest.mark.asyncio
async def test_refresh_rejects_invalid_token():
    async with _client() as c:
        resp = await c.post("/api/auth/refresh", json={"refresh_token": "not-a-real-token"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_logout_revokes_refresh_token():
    await _seed_user(email="logout1@classz.io")
    async with _client() as c:
        login = await c.post("/api/auth/login", json={"email": "logout1@classz.io", "password": "Test1234!"})
        refresh_token = login.json()["refresh_token"]

        logout_resp = await c.post("/api/auth/logout", json={"refresh_token": refresh_token})
        assert logout_resp.status_code == 200

        refresh_after_logout = await c.post("/api/auth/refresh", json={"refresh_token": refresh_token})
        assert refresh_after_logout.status_code == 401


@pytest.mark.asyncio
async def test_logout_with_unknown_token_does_not_error():
    async with _client() as c:
        resp = await c.post("/api/auth/logout", json={"refresh_token": "already-gone"})
    assert resp.status_code == 200
