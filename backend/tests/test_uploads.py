"""Upload + material storage tests — self-contained, no shared fixtures.

Mirrors the in-memory SQLite + httpx ASGI pattern used in test_auth.py /
test_permissions.py. Writes go to a pytest tmp_path, never the real
backend/uploads directory.
"""

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
from app.modules.uploads import router as uploads_router

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
async def _fresh_db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    app.dependency_overrides[get_db_session] = _override_session
    monkeypatch.setattr(uploads_router, "UPLOAD_ROOT", tmp_path)
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
        json={"title": "Algebra I", "slug": slug, "subject": "Math", "grade": "9", "teacher_id": teacher_id},
        headers=_auth(token),
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


_PDF_BYTES = b"%PDF-1.4 fake pdf content"


# ---------------------------------------------------------------------------
# Public (unauthenticated) registration-document categories still work
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_identity_upload_works_without_auth():
    async with _client() as c:
        resp = await c.post(
            "/api/uploads",
            data={"category": "identity"},
            files={"file": ("id.pdf", _PDF_BYTES, "application/pdf")},
        )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["url"].startswith("/uploads/identity/")


# ---------------------------------------------------------------------------
# Material uploads require auth + ownership
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_material_upload_requires_auth():
    async with _client() as c:
        resp = await c.post(
            "/api/uploads",
            data={"category": "material"},
            files={"file": ("notes.pdf", _PDF_BYTES, "application/pdf")},
        )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_material_upload_rejects_non_owner_course():
    teacher_a_id = await _seed_user("teacher-a@classz.io", Role.TEACHER)
    await _seed_user("teacher-b@classz.io", Role.TEACHER)
    async with _client() as c:
        token_a = await _login(c, "teacher-a@classz.io")
        token_b = await _login(c, "teacher-b@classz.io")
        course = await _create_course(c, token_a, teacher_a_id, "course-a")

        resp = await c.post(
            "/api/uploads",
            data={"category": "material", "course_id": course["id"]},
            files={"file": ("notes.pdf", _PDF_BYTES, "application/pdf")},
            headers=_auth(token_b),
        )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_material_upload_stores_under_organized_path_and_creates_material():
    teacher_id = await _seed_user("teacher-c@classz.io", Role.TEACHER)
    async with _client() as c:
        token = await _login(c, "teacher-c@classz.io")
        course = await _create_course(c, token, teacher_id, "course-c")

        upload_resp = await c.post(
            "/api/uploads",
            data={"category": "material", "course_id": course["id"]},
            files={"file": ("lecture-notes.pdf", _PDF_BYTES, "application/pdf")},
            headers=_auth(token),
        )
        assert upload_resp.status_code == 201, upload_resp.text
        body = upload_resp.json()
        assert body["url"].startswith(f"/uploads/material/{teacher_id}/{course['id']}/pdf/")
        assert body["size_bytes"] == len(_PDF_BYTES)
        assert body["mime_type"] == "application/pdf"

        material_resp = await c.post(
            "/api/materials",
            json={
                "course_id": course["id"],
                "type": "pdf",
                "title": "Lecture Notes",
                "file_url": body["url"],
                "file_name": body["file_name"],
                "file_size_bytes": body["size_bytes"],
                "mime_type": body["mime_type"],
            },
            headers=_auth(token),
        )
        assert material_resp.status_code == 201, material_resp.text
        material = material_resp.json()
        assert material["file_url"] == body["url"]
        assert material["file_size_bytes"] == len(_PDF_BYTES)

        list_resp = await c.get(f"/api/materials?course_id={course['id']}", headers=_auth(token))
        assert list_resp.status_code == 200
        assert len(list_resp.json()) == 1


@pytest.mark.asyncio
async def test_reupload_identical_file_does_not_duplicate_on_disk(tmp_path: Path):
    teacher_id = await _seed_user("teacher-d@classz.io", Role.TEACHER)
    async with _client() as c:
        token = await _login(c, "teacher-d@classz.io")
        course = await _create_course(c, token, teacher_id, "course-d")

        first = await c.post(
            "/api/uploads",
            data={"category": "material", "course_id": course["id"]},
            files={"file": ("a.pdf", _PDF_BYTES, "application/pdf")},
            headers=_auth(token),
        )
        second = await c.post(
            "/api/uploads",
            data={"category": "material", "course_id": course["id"]},
            files={"file": ("b-renamed.pdf", _PDF_BYTES, "application/pdf")},
            headers=_auth(token),
        )
    assert first.status_code == 201 and second.status_code == 201
    assert first.json()["url"] == second.json()["url"]
    pdf_dir = tmp_path / "material" / teacher_id / course["id"] / "pdf"
    assert len(list(pdf_dir.iterdir())) == 1


@pytest.mark.asyncio
async def test_material_reorder_requires_ownership():
    teacher_a_id = await _seed_user("teacher-e@classz.io", Role.TEACHER)
    await _seed_user("teacher-f@classz.io", Role.TEACHER)
    async with _client() as c:
        token_a = await _login(c, "teacher-e@classz.io")
        token_b = await _login(c, "teacher-f@classz.io")
        course = await _create_course(c, token_a, teacher_a_id, "course-e")

        resp = await c.post(
            "/api/materials/reorder",
            json={"course_id": course["id"], "ordered_ids": [teacher_a_id]},
            headers=_auth(token_b),
        )
    assert resp.status_code == 403
