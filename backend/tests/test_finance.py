"""Regression tests for the finance role: dashboard aggregation, finance-wide
payment history, teacher revenue, coupon redemption at checkout, invoice
auto-issuance, teacher subscriptions, and payout requests.

Self-contained, no shared fixtures — mirrors the pattern in
test_student_progress_wallet.py / test_parent_role.py.
"""

import uuid

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


async def _seed_course(teacher_id: str, price: float) -> str:
    async with TestSession() as session:
        course = Course(
            public_code=_next_public_code("CRS"),
            title="Algebra I",
            slug=f"algebra-{_nextval('seq_slug')}",
            subject="Math",
            grade="9",
            teacher_id=uuid.UUID(teacher_id),
            price=price,
            is_published=True,
        )
        session.add(course)
        await session.commit()
        await session.refresh(course)
        return str(course.id)


def _client():
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")


async def _login(client: httpx.AsyncClient, email: str, password: str = "Test1234!") -> str:
    resp = await client.post("/api/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


async def _setup_purchase(*, price: float = 100.0, coupon_payload: dict | None = None):
    """Seeds finance/teacher/student, a paid course, an optional coupon, tops
    up the student's wallet, and enrolls them (applying the coupon if given).
    Returns tokens/ids plus the enroll response for assertions."""
    finance_id = await _seed_user("finance@classz.io", Role.FINANCE)
    teacher_id = await _seed_user("teacher@classz.io", Role.TEACHER)
    student_id = await _seed_user("student@classz.io", Role.STUDENT)
    course_id = await _seed_course(teacher_id, price)

    async with _client() as client:
        finance_token = await _login(client, "finance@classz.io")
        student_token = await _login(client, "student@classz.io")

        coupon = None
        if coupon_payload is not None:
            coupon_resp = await client.post("/api/finance/coupons", json=coupon_payload, headers=_auth(finance_token))
            assert coupon_resp.status_code == 201, coupon_resp.text
            coupon = coupon_resp.json()

        recharge = await client.post(
            "/api/wallets/me/recharge",
            json={"amount": price, "payment_method": "Card"},
            headers=_auth(student_token),
        )
        assert recharge.status_code == 201, recharge.text

        enroll_payload = {"course_id": course_id}
        if coupon is not None:
            enroll_payload["coupon_code"] = coupon["code"]
        enroll_resp = await client.post("/api/enrollments", json=enroll_payload, headers=_auth(student_token))

    return {
        "finance_id": finance_id,
        "finance_token": finance_token,
        "teacher_id": teacher_id,
        "student_id": student_id,
        "student_token": student_token,
        "course_id": course_id,
        "coupon": coupon,
        "enroll_resp": enroll_resp,
    }


@pytest.mark.asyncio
async def test_non_finance_role_is_forbidden():
    await _seed_user("student-only@classz.io", Role.STUDENT)
    async with _client() as client:
        token = await _login(client, "student-only@classz.io")
        resp = await client.get("/api/finance/dashboard", headers=_auth(token))
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_dashboard_and_payment_history_reflect_a_real_purchase():
    ctx = await _setup_purchase(price=100.0)
    assert ctx["enroll_resp"].status_code == 201, ctx["enroll_resp"].text

    async with _client() as client:
        dashboard = await client.get("/api/finance/dashboard", headers=_auth(ctx["finance_token"]))
        payments = await client.get("/api/finance/payments", headers=_auth(ctx["finance_token"]))

    assert dashboard.status_code == 200
    body = dashboard.json()
    assert body["gmv"] == 100.0
    assert body["platform_revenue"] == 15.0  # default 15% platform fee
    assert body["platform_fee_percent"] == 15.0

    assert payments.status_code == 200
    rows = payments.json()
    # A topup (wallet recharge) plus the course payment itself.
    assert len(rows) == 2
    payment_row = next(r for r in rows if r["type"] == "payment")
    assert payment_row["amount"] == 100.0
    assert payment_row["teacher_id"] == ctx["teacher_id"]


@pytest.mark.asyncio
async def test_coupon_discount_is_applied_and_redemption_tracked():
    coupon_payload = {"code": "welcome20", "discount_type": "percent", "discount_value": 20, "max_redemptions": 1}
    ctx = await _setup_purchase(price=100.0, coupon_payload=coupon_payload)

    assert ctx["enroll_resp"].status_code == 201, ctx["enroll_resp"].text

    async with _client() as client:
        wallet = await client.get("/api/wallets/me", headers=_auth(ctx["student_token"]))
        coupons = await client.get("/api/finance/coupons", headers=_auth(ctx["finance_token"]))
        invoices = await client.get("/api/finance/invoices", headers=_auth(ctx["finance_token"]))

    # 100 - 20% = 80 debited, so 100 - 80 = 20 left of the 100 top-up.
    assert wallet.json()["balance"] == 20.0

    stored_coupon = next(c for c in coupons.json() if c["code"] == "WELCOME20")
    assert stored_coupon["redemption_count"] == 1

    assert invoices.status_code == 200
    invoice = invoices.json()[0]
    assert invoice["amount"] == 80.0
    assert invoice["status"] == "paid"


@pytest.mark.asyncio
async def test_coupon_redemption_limit_is_enforced():
    coupon_payload = {"code": "onceonly", "discount_type": "fixed", "discount_value": 10, "max_redemptions": 1}
    ctx = await _setup_purchase(price=50.0, coupon_payload=coupon_payload)
    assert ctx["enroll_resp"].status_code == 201, ctx["enroll_resp"].text

    # A second student tries the same single-use coupon on a fresh purchase of the same course.
    second_student_id = await _seed_user("second-student@classz.io", Role.STUDENT)
    async with _client() as client:
        second_token = await _login(client, "second-student@classz.io")
        await client.post(
            "/api/wallets/me/recharge", json={"amount": 50, "payment_method": "Card"}, headers=_auth(second_token)
        )
        resp = await client.post(
            "/api/enrollments",
            json={"course_id": ctx["course_id"], "coupon_code": "ONCEONLY"},
            headers=_auth(second_token),
        )
    assert resp.status_code == 402


@pytest.mark.asyncio
async def test_teacher_revenue_and_payout_lifecycle():
    ctx = await _setup_purchase(price=100.0)
    assert ctx["enroll_resp"].status_code == 201, ctx["enroll_resp"].text

    async with _client() as client:
        teacher_token = await _login(client, "teacher@classz.io")

        revenue = await client.get("/api/finance/teacher-revenue", headers=_auth(ctx["finance_token"]))
        assert revenue.status_code == 200
        entry = next(r for r in revenue.json() if r["teacher_id"] == ctx["teacher_id"])
        # gross 100, 15% platform fee = 15, net = 85, no refunds.
        assert entry["gross_revenue"] == 100.0
        assert entry["platform_fee"] == 15.0
        assert entry["net_revenue"] == 85.0
        assert entry["available_balance"] == 85.0

        # Requesting more than available is rejected.
        over_request = await client.post(
            "/api/finance/payouts/me", json={"amount": 200, "method": "Bank Transfer"}, headers=_auth(teacher_token)
        )
        assert over_request.status_code == 402

        payout_request = await client.post(
            "/api/finance/payouts/me", json={"amount": 85, "method": "Bank Transfer"}, headers=_auth(teacher_token)
        )
        assert payout_request.status_code == 201, payout_request.text
        payout_id = payout_request.json()["id"]

        pending_list = await client.get("/api/finance/payouts", headers=_auth(ctx["finance_token"]))
        assert any(p["id"] == payout_id and p["status"] == "pending" for p in pending_list.json())

        decide = await client.post(
            f"/api/finance/payouts/{payout_id}/decide", json={"status": "paid"}, headers=_auth(ctx["finance_token"])
        )
        assert decide.status_code == 200
        assert decide.json()["status"] == "paid"

        revenue_after = await client.get("/api/finance/teacher-revenue", headers=_auth(ctx["finance_token"]))
        entry_after = next(r for r in revenue_after.json() if r["teacher_id"] == ctx["teacher_id"])
        assert entry_after["paid_out"] == 85.0
        assert entry_after["available_balance"] == 0.0


@pytest.mark.asyncio
async def test_subscription_plan_change_records_payment_and_invoice():
    finance_id = await _seed_user("finance-sub@classz.io", Role.FINANCE)
    teacher_id = await _seed_user("teacher-sub@classz.io", Role.TEACHER)

    async with _client() as client:
        finance_token = await _login(client, "finance-sub@classz.io")

        listing = await client.get("/api/finance/subscriptions", headers=_auth(finance_token))
        assert listing.status_code == 200
        default_entry = next(s for s in listing.json() if s["teacher_id"] == teacher_id)
        assert default_entry["plan"] == "free"
        assert default_entry["monthly_fee"] == 0.0

        update = await client.patch(
            f"/api/finance/subscriptions/{teacher_id}",
            json={"plan": "pro", "status": "active", "record_payment": True},
            headers=_auth(finance_token),
        )
        assert update.status_code == 200
        body = update.json()
        assert body["plan"] == "pro"
        assert body["monthly_fee"] == 49.0
        assert body["payment_status"] == "paid"

        invoices = await client.get("/api/finance/invoices", headers=_auth(finance_token))
        subscription_invoice = next(i for i in invoices.json() if i["user_id"] == teacher_id)
        assert subscription_invoice["amount"] == 49.0
        assert subscription_invoice["course_id"] is None

        dashboard = await client.get("/api/finance/dashboard", headers=_auth(finance_token))
        assert dashboard.json()["active_subscriptions"] >= 1
        assert dashboard.json()["mrr"] >= 49.0
