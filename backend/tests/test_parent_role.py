"""Regression tests for the parent role redesign: bidirectional linking
(parent-code request approved by student; student-invite accepted by
parent), ownership scoping on child-data views, the lightweight
request/reply ticket system, and parent notification wiring on the existing
enrollment/wallet triggers.

Self-contained, no shared fixtures — mirrors the pattern in
test_p1_ownership.py.
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
from app.modules.notifications.models import Notification
from app.modules.parents.models import ParentInvite, ParentInviteStatus, ParentStudentLink
from app.modules.wallets import service as wallets_service
from app.modules.enrollments import service as enrollments_service

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


async def _notification_count(user_id: str) -> int:
    async with TestSession() as session:
        result = await session.execute(select(Notification).where(Notification.user_id == uuid.UUID(user_id)))
        return len(result.scalars().all())


@pytest.mark.asyncio
async def test_parent_code_flow_link_then_approve_grants_access():
    await _seed_user("student-pc1@classz.io", Role.STUDENT)
    await _seed_user("parent-pc1@classz.io", Role.PARENT)
    async with _client() as c:
        student_token = await _login(c, "student-pc1@classz.io")
        code_resp = await c.get("/api/students/me/parent-link-code", headers=_auth(student_token))
        assert code_resp.status_code == 200, code_resp.text
        code = code_resp.json()["code"]

        parent_token = await _login(c, "parent-pc1@classz.io")
        submit_resp = await c.post(
            "/api/parents/me/link-requests", json={"code": code}, headers=_auth(parent_token)
        )
        assert submit_resp.status_code == 201, submit_resp.text
        assert submit_resp.json()["status"] == "pending"

        # Not yet approved — no access.
        student_id = submit_resp.json()["student_id"]
        dashboard_before = await c.get(
            f"/api/parents/me/children/{student_id}/dashboard", headers=_auth(parent_token)
        )
        assert dashboard_before.status_code == 403

        pending_resp = await c.get("/api/students/me/parent-link-requests", headers=_auth(student_token))
        assert pending_resp.status_code == 200, pending_resp.text
        assert len(pending_resp.json()) == 1
        link_id = pending_resp.json()[0]["id"]

        approve_resp = await c.post(
            f"/api/students/me/parent-link-requests/{link_id}/approve", headers=_auth(student_token)
        )
        assert approve_resp.status_code == 200, approve_resp.text
        assert approve_resp.json()["status"] == "active"

        children_resp = await c.get("/api/parents/me/children", headers=_auth(parent_token))
        assert children_resp.status_code == 200, children_resp.text
        assert len(children_resp.json()) == 1
        assert children_resp.json()[0]["status"] == "active"

        dashboard_resp = await c.get(
            f"/api/parents/me/children/{student_id}/dashboard", headers=_auth(parent_token)
        )
    assert dashboard_resp.status_code == 200, dashboard_resp.text


@pytest.mark.asyncio
async def test_unlinked_parent_gets_403_on_child_endpoints():
    student_id = await _seed_user("student-pc2@classz.io", Role.STUDENT)
    await _seed_user("parent-pc2@classz.io", Role.PARENT)
    async with _client() as c:
        parent_token = await _login(c, "parent-pc2@classz.io")
        resp = await c.get(f"/api/parents/me/children/{student_id}/dashboard", headers=_auth(parent_token))
        progress_resp = await c.get(f"/api/parents/me/children/{student_id}/progress", headers=_auth(parent_token))
    assert resp.status_code == 403
    assert progress_resp.status_code == 403


@pytest.mark.asyncio
async def test_denied_link_request_leaves_access_forbidden():
    await _seed_user("student-pc3@classz.io", Role.STUDENT)
    await _seed_user("parent-pc3@classz.io", Role.PARENT)
    async with _client() as c:
        student_token = await _login(c, "student-pc3@classz.io")
        code = (await c.get("/api/students/me/parent-link-code", headers=_auth(student_token))).json()["code"]

        parent_token = await _login(c, "parent-pc3@classz.io")
        submit_resp = await c.post(
            "/api/parents/me/link-requests", json={"code": code}, headers=_auth(parent_token)
        )
        student_id = submit_resp.json()["student_id"]

        link_id = (
            await c.get("/api/students/me/parent-link-requests", headers=_auth(student_token))
        ).json()[0]["id"]
        deny_resp = await c.post(
            f"/api/students/me/parent-link-requests/{link_id}/deny", headers=_auth(student_token)
        )
        assert deny_resp.status_code == 200
        assert deny_resp.json()["status"] == "denied"

        dashboard_resp = await c.get(
            f"/api/parents/me/children/{student_id}/dashboard", headers=_auth(parent_token)
        )
    assert dashboard_resp.status_code == 403


@pytest.mark.asyncio
async def test_student_invite_flow_existing_parent_account():
    student_id = await _seed_user("student-inv1@classz.io", Role.STUDENT)
    await _seed_user("parent-inv1@classz.io", Role.PARENT)
    async with _client() as c:
        student_token = await _login(c, "student-inv1@classz.io")
        invite_resp = await c.post(
            "/api/students/me/parent-invites",
            json={"email": "parent-inv1@classz.io"},
            headers=_auth(student_token),
        )
        assert invite_resp.status_code == 201, invite_resp.text
        assert invite_resp.json()["status"] == "matched"

        parent_token = await _login(c, "parent-inv1@classz.io")
        invitations_resp = await c.get("/api/parents/me/link-invitations", headers=_auth(parent_token))
        assert invitations_resp.status_code == 200, invitations_resp.text
        assert len(invitations_resp.json()) == 1
        link_id = invitations_resp.json()[0]["link_id"]

        accept_resp = await c.post(
            f"/api/parents/me/link-invitations/{link_id}/accept", headers=_auth(parent_token)
        )
        assert accept_resp.status_code == 200, accept_resp.text

        children_resp = await c.get("/api/parents/me/children", headers=_auth(parent_token))
        assert children_resp.status_code == 200
        assert any(child["student_id"] == student_id for child in children_resp.json())

        dashboard_resp = await c.get(
            f"/api/parents/me/children/{student_id}/dashboard", headers=_auth(parent_token)
        )
    assert dashboard_resp.status_code == 200, dashboard_resp.text


@pytest.mark.asyncio
async def test_student_invite_flow_no_account_yet_resolves_on_registration():
    student_id = await _seed_user("student-inv2@classz.io", Role.STUDENT)
    async with _client() as c:
        student_token = await _login(c, "student-inv2@classz.io")
        invite_resp = await c.post(
            "/api/students/me/parent-invites",
            json={"email": "new-parent-inv2@classz.io"},
            headers=_auth(student_token),
        )
        assert invite_resp.status_code == 201, invite_resp.text
        assert invite_resp.json()["status"] == "pending"

        register_resp = await c.post(
            "/api/auth/register",
            json={
                "email": "new-parent-inv2@classz.io",
                "password": "Test1234!",
                "full_name": "New Parent",
                "role": "parent",
            },
        )
        assert register_resp.status_code == 201, register_resp.text
        parent_id = register_resp.json()["user"]["id"]

    async with TestSession() as session:
        invite_result = await session.execute(
            select(ParentInvite).where(ParentInvite.invited_email == "new-parent-inv2@classz.io")
        )
        invite = invite_result.scalar_one()
        assert invite.status == ParentInviteStatus.MATCHED
        assert invite.resolved_link_id is not None

        link = await session.get(ParentStudentLink, invite.resolved_link_id)
        assert link is not None
        assert link.parent_id == uuid.UUID(parent_id)
        assert link.student_id == uuid.UUID(student_id)

    assert await _notification_count(parent_id) >= 1


@pytest.mark.asyncio
async def test_request_reply_flow_teacher_target_with_course_auto_resolve():
    teacher_id = await _seed_user("teacher-req1@classz.io", Role.TEACHER)
    other_teacher_id = await _seed_user("teacher-req2@classz.io", Role.TEACHER)
    await _seed_user("parent-req1@classz.io", Role.PARENT)
    async with _client() as c:
        teacher_token = await _login(c, "teacher-req1@classz.io")
        course = await _create_course(c, teacher_token, teacher_id, "course-req1")

    # Seed a student and link it to the parent directly (bypassing the link
    # flow — already covered by other tests).
    student_id = await _seed_user("student-req1@classz.io", Role.STUDENT)
    async with TestSession() as session:
        from app.modules.parents.models import LinkInitiator, ParentLinkStatus

        parent_result = await session.execute(select(User).where(User.email == "parent-req1@classz.io"))
        parent = parent_result.scalar_one()
        link = ParentStudentLink(
            parent_id=parent.id,
            student_id=uuid.UUID(student_id),
            status=ParentLinkStatus.ACTIVE,
            initiated_by=LinkInitiator.PARENT_CODE,
        )
        session.add(link)
        await session.commit()

    async with _client() as c:
        parent_token = await _login(c, "parent-req1@classz.io")
        create_resp = await c.post(
            "/api/parents/me/requests",
            json={
                "student_id": student_id,
                "target_type": "teacher",
                "course_id": course["id"],
                "subject": "Question about homework",
                "body": "Can you clarify the assignment?",
            },
            headers=_auth(parent_token),
        )
        assert create_resp.status_code == 201, create_resp.text
        assert create_resp.json()["teacher_id"] == teacher_id
        request_id = create_resp.json()["id"]

        other_teacher_token = await _login(c, "teacher-req2@classz.io")
        forbidden_reply = await c.post(
            f"/api/parents/requests/{request_id}/reply",
            json={"reply_body": "Not my student"},
            headers=_auth(other_teacher_token),
        )
        assert forbidden_reply.status_code == 403

        owner_token = await _login(c, "teacher-req1@classz.io")
        reply_resp = await c.post(
            f"/api/parents/requests/{request_id}/reply",
            json={"reply_body": "Sure, here's the clarification."},
            headers=_auth(owner_token),
        )
        assert reply_resp.status_code == 200, reply_resp.text
        assert reply_resp.json()["status"] == "replied"

    assert await _notification_count(str(parent.id)) >= 1


@pytest.mark.asyncio
async def test_enrollment_notifies_linked_parent():
    teacher_id = await _seed_user("teacher-notif1@classz.io", Role.TEACHER)
    student_id = await _seed_user("student-notif1@classz.io", Role.STUDENT)
    parent_id = await _seed_user("parent-notif1@classz.io", Role.PARENT)

    async with TestSession() as session:
        from app.modules.courses.models import Course
        from app.modules.parents.models import LinkInitiator, ParentLinkStatus

        course = Course(
            public_code=_next_public_code("CRS"),
            title="Free Course",
            slug=f"free-course-{_nextval('seq_slug')}",
            description="",
            subject="Math",
            grade="9",
            teacher_id=uuid.UUID(teacher_id),
            price=0,
            is_published=True,
        )
        session.add(course)
        await session.flush()
        course_id = course.id

        session.add(
            ParentStudentLink(
                parent_id=uuid.UUID(parent_id),
                student_id=uuid.UUID(student_id),
                status=ParentLinkStatus.ACTIVE,
                initiated_by=LinkInitiator.PARENT_CODE,
            )
        )
        await session.commit()

        await enrollments_service.create_enrollment(session, uuid.UUID(student_id), course_id)

    assert await _notification_count(student_id) >= 1
    assert await _notification_count(parent_id) >= 1


@pytest.mark.asyncio
async def test_wallet_recharge_notifies_linked_parent():
    student_id = await _seed_user("student-notif2@classz.io", Role.STUDENT)
    parent_id = await _seed_user("parent-notif2@classz.io", Role.PARENT)

    async with TestSession() as session:
        from app.modules.parents.models import LinkInitiator, ParentLinkStatus

        session.add(
            ParentStudentLink(
                parent_id=uuid.UUID(parent_id),
                student_id=uuid.UUID(student_id),
                status=ParentLinkStatus.ACTIVE,
                initiated_by=LinkInitiator.PARENT_CODE,
            )
        )
        await session.commit()

        await wallets_service.recharge_wallet(session, uuid.UUID(student_id), 50.0, "Card")

    assert await _notification_count(student_id) >= 1
    assert await _notification_count(parent_id) >= 1
