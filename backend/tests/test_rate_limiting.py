"""Regression test for the missing rate limiting on unauthenticated auth
endpoints flagged in the 2026-07-11 platform audit — login/register/
forgot-password/reset-password had no throttling, making them trivial to
brute-force or use for account enumeration.
"""

import httpx
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.rate_limit import reset_rate_limits
from app.db.base import Base
from app.db.session import get_db_session
from app.main import app

TEST_ENGINE = create_async_engine("sqlite+aiosqlite://", echo=False, poolclass=StaticPool)
TestSession = async_sessionmaker(bind=TEST_ENGINE, class_=AsyncSession, expire_on_commit=False)


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


def _client():
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")


@pytest.mark.asyncio
async def test_login_is_rate_limited_per_client():
    reset_rate_limits()
    async with _client() as c:
        responses = [
            await c.post("/api/auth/login", json={"email": "nobody@classz.io", "password": "wrong"})
            for _ in range(11)
        ]
    assert all(r.status_code == 401 for r in responses[:10])
    assert responses[10].status_code == 429


@pytest.mark.asyncio
async def test_forgot_password_is_rate_limited_per_client():
    reset_rate_limits()
    async with _client() as c:
        responses = [
            await c.post("/api/auth/forgot-password", json={"email": "nobody@classz.io"}) for _ in range(6)
        ]
    assert all(r.status_code == 200 for r in responses[:5])
    assert responses[5].status_code == 429
