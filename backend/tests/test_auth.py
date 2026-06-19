"""Auth endpoint tests — self-contained, no shared fixtures.

Uses an in-memory SQLite database and httpx ASGI transport so tests
run without Docker or PostgreSQL.
"""

from datetime import datetime, timedelta, timezone

import httpx
import pytest
import pytest_asyncio
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import get_db_session
from app.main import app
from app.models.user import Role, User

TEST_ENGINE = create_async_engine("sqlite+aiosqlite://", echo=False)
TestSession = async_sessionmaker(
    bind=TEST_ENGINE, class_=AsyncSession, expire_on_commit=False,
)


async def _override_session():
    async with TestSession() as session:
        yield session


app.dependency_overrides[get_db_session] = _override_session


@pytest_asyncio.fixture(autouse=True)
async def _fresh_db():
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
