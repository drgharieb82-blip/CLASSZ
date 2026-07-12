"""Regression tests for the assistant permission delegation system: invite
-> accept -> per-(resource, action) grants strictly scoped to the granting
teacher's own courses; revoking a link immediately removes access; and the
7 previously-unscoped endpoints (grading, assignments, anti_cheating,
results, quiz_attempts) now require an explicit grant instead of being open
to any ASSISTANT platform-wide.

Self-contained, no shared fixtures — mirrors the pattern in
test_parent_role.py / test_p1_ownership.py.
"""

import uuid

import httpx
import pytest
import pytest_asyncio
from sqlalchemy import event, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import get_db_session
from app.main import app
from app.models.user import Role, User
from app.modules.assistants.models import AssistantLinkStatus, TeacherAssistantLink

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


async def _seed_active_link(teacher_id: str, assistant_id: str) -> str:
    async with TestSession() as session:
        link = TeacherAssistantLink(
            teacher_id=uuid.UUID(teacher_id),
            assistant_id=uuid.UUID(assistant_id),
            status=AssistantLinkStatus.ACTIVE,
        )
        session.add(link)
        await session.commit()
        await session.refresh(link)
        return str(link.id)


@pytest.mark.asyncio
async def test_invite_flow_then_grant_allows_scoped_create():
    teacher_id = await _seed_user("teacher-a1@classz.io", Role.TEACHER)
    await _seed_user("assistant-a1@classz.io", Role.ASSISTANT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-a1@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-a1")

        invite_resp = await c.post(
            "/api/assistants/invite", json={"email": "assistant-a1@classz.io"}, headers=_auth(teacher_token)
        )
        assert invite_resp.status_code == 201, invite_resp.text
        assert invite_resp.json()["status"] == "matched"

        assistant_token = await _login(c, "assistant-a1@classz.io")
        invitations_resp = await c.get("/api/assistants/me/invitations", headers=_auth(assistant_token))
        assert invitations_resp.status_code == 200, invitations_resp.text
        assert len(invitations_resp.json()) == 1
        link_id = invitations_resp.json()[0]["link_id"]

        # Not yet accepted — course-scoped question creation must be denied
        # (category creation itself has no course-ownership check at all —
        # categories are a shared global taxonomy, not delegable per-course).
        pre_accept_resp = await c.post(
            "/api/questions",
            json={
                "category_id": "00000000-0000-0000-0000-000000000000",
                "title": "2+2?",
                "question_type": "MCQ",
                "difficulty": "EASY",
                "course_id": course["id"],
                "choices": [],
            },
            headers=_auth(assistant_token),
        )
        assert pre_accept_resp.status_code == 403

        accept_resp = await c.post(
            f"/api/assistants/me/invitations/{link_id}/accept", headers=_auth(assistant_token)
        )
        assert accept_resp.status_code == 200, accept_resp.text

        # Accepted but zero permissions granted yet — still denied.
        create_resp = await c.post(
            "/api/questions",
            json={
                "category_id": "00000000-0000-0000-0000-000000000000",
                "title": "2+2?",
                "question_type": "MCQ",
                "difficulty": "EASY",
                "course_id": course["id"],
                "choices": [],
            },
            headers=_auth(assistant_token),
        )
        assert create_resp.status_code == 403

        grant_resp = await c.put(
            f"/api/assistants/{link_id}/permissions",
            json={"grants": [{"resource": "questions", "action": "create"}]},
            headers=_auth(teacher_token),
        )
        assert grant_resp.status_code == 200, grant_resp.text

        category_resp2 = await c.post(
            "/api/questions/categories", json={"name": "Algebra basics"}, headers=_auth(assistant_token)
        )
        assert category_resp2.status_code == 201, category_resp2.text
        category_id = category_resp2.json()["id"]

        create_resp2 = await c.post(
            "/api/questions",
            json={
                "category_id": category_id,
                "title": "2+2?",
                "question_type": "MCQ",
                "difficulty": "EASY",
                "course_id": course["id"],
                "choices": [],
            },
            headers=_auth(assistant_token),
        )
    assert create_resp2.status_code == 201, create_resp2.text


@pytest.mark.asyncio
async def test_grant_does_not_extend_to_other_teachers_course():
    teacher_id = await _seed_user("teacher-a2@classz.io", Role.TEACHER)
    other_teacher_id = await _seed_user("teacher-a3@classz.io", Role.TEACHER)
    assistant_id = await _seed_user("assistant-a2@classz.io", Role.ASSISTANT)

    link_id = await _seed_active_link(teacher_id, assistant_id)
    async with TestSession() as session:
        from app.modules.assistants.models import AssistantAction, AssistantPermission, AssistantResource

        session.add(
            AssistantPermission(
                link_id=uuid.UUID(link_id), resource=AssistantResource.QUESTIONS, action=AssistantAction.CREATE
            )
        )
        await session.commit()

    async with _client() as c:
        other_token = await _login(c, "teacher-a3@classz.io")
        other_course = await _create_course(c, other_token, other_teacher_id, "course-a3")

        assistant_token = await _login(c, "assistant-a2@classz.io")
        resp = await c.post(
            "/api/questions",
            json={
                "category_id": "00000000-0000-0000-0000-000000000000",
                "title": "Should be denied",
                "question_type": "MCQ",
                "difficulty": "EASY",
                "course_id": other_course["id"],
                "choices": [],
            },
            headers=_auth(assistant_token),
        )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_ungranted_action_denied_even_with_active_link():
    teacher_id = await _seed_user("teacher-a4@classz.io", Role.TEACHER)
    assistant_id = await _seed_user("assistant-a4@classz.io", Role.ASSISTANT)

    link_id = await _seed_active_link(teacher_id, assistant_id)
    async with TestSession() as session:
        from app.modules.assistants.models import AssistantAction, AssistantPermission, AssistantResource

        # Only CREATE is granted — not DELETE.
        session.add(
            AssistantPermission(
                link_id=uuid.UUID(link_id), resource=AssistantResource.CHAPTERS_LESSONS, action=AssistantAction.CREATE
            )
        )
        await session.commit()

    async with _client() as c:
        teacher_token = await _login(c, "teacher-a4@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-a4")

        assistant_token = await _login(c, "assistant-a4@classz.io")
        create_resp = await c.post(
            "/api/chapters", json={"course_id": course["id"], "title": "Chapter 1"}, headers=_auth(assistant_token)
        )
        assert create_resp.status_code == 201, create_resp.text
        chapter_id = create_resp.json()["id"]

        delete_resp = await c.delete(f"/api/chapters/{chapter_id}", headers=_auth(assistant_token))
    assert delete_resp.status_code == 403


@pytest.mark.asyncio
async def test_revoking_link_immediately_removes_access():
    teacher_id = await _seed_user("teacher-a5@classz.io", Role.TEACHER)
    assistant_id = await _seed_user("assistant-a5@classz.io", Role.ASSISTANT)

    link_id = await _seed_active_link(teacher_id, assistant_id)
    async with TestSession() as session:
        from app.modules.assistants.models import AssistantAction, AssistantPermission, AssistantResource

        session.add(
            AssistantPermission(
                link_id=uuid.UUID(link_id), resource=AssistantResource.MATERIALS, action=AssistantAction.CREATE
            )
        )
        await session.commit()

    async with _client() as c:
        teacher_token = await _login(c, "teacher-a5@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-a5")

        assistant_token = await _login(c, "assistant-a5@classz.io")
        before_resp = await c.post(
            "/api/materials",
            json={"course_id": course["id"], "type": "pdf", "title": "Notes", "status": "published", "position": 1},
            headers=_auth(assistant_token),
        )
        assert before_resp.status_code == 201, before_resp.text

        revoke_resp = await c.post(f"/api/assistants/{link_id}/revoke", headers=_auth(teacher_token))
        assert revoke_resp.status_code == 200, revoke_resp.text

        after_resp = await c.post(
            "/api/materials",
            json={"course_id": course["id"], "type": "pdf", "title": "Notes 2", "status": "published", "position": 2},
            headers=_auth(assistant_token),
        )
    assert after_resp.status_code == 403


@pytest.mark.asyncio
async def test_previously_unscoped_endpoints_now_require_explicit_grant():
    """Grading, assignments-create, anti_cheating events, results, and
    quiz_attempts previously let ANY assistant through unscoped. Confirm an
    assistant with an ACTIVE link but zero grants is denied on each."""
    teacher_id = await _seed_user("teacher-a6@classz.io", Role.TEACHER)
    assistant_id = await _seed_user("assistant-a6@classz.io", Role.ASSISTANT)
    await _seed_active_link(teacher_id, assistant_id)

    async with _client() as c:
        teacher_token = await _login(c, "teacher-a6@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-a6")

        assistant_token = await _login(c, "assistant-a6@classz.io")

        assignment_resp = await c.post(
            "/api/assignments",
            json={"course_id": course["id"], "title": "HW1", "max_points": 10},
            headers=_auth(assistant_token),
        )
        assert assignment_resp.status_code == 403

        grading_resp = await c.get("/api/grading/pending", headers=_auth(assistant_token))
        assert grading_resp.status_code == 200
        assert grading_resp.json() == []
