import secrets
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import migrations  # noqa: F401
from app.models.user import Role, User
from app.modules.courses.models import Course
from app.modules.enrollments.models import Enrollment
from app.modules.notifications import service as notifications_service
from app.modules.parents.models import LinkInitiator, ParentInvite, ParentInviteStatus, ParentLinkStatus, ParentStudentLink
from app.modules.progress.models import SessionProgress
from app.modules.question_bank.models import Question
from app.modules.quiz_attempts.models import QuizAttempt
from app.modules.quizzes.models import Quiz
from app.modules.results.models import QuestionResult, QuizResult
from app.modules.sessions.models import Session as ClassSession
from app.modules.students.models import Student, StudentPod, StudentPodMember
from app.modules.students.schemas import (
    AtRiskEntry,
    ConceptScore,
    CourseReportSummary,
    MemoryInsightEntry,
    ParentLinkRequestRead,
    PodMemberAdd,
    StudentPodCreate,
    StudentPodUpdate,
    StudentProfileUpdate,
    StudentProgressEntry,
    StudentRosterEntry,
    WrongQuestionEntry,
)

_INACTIVITY_THRESHOLD_DAYS = 7
_LOW_PROGRESS_THRESHOLD = 40
_LOW_QUIZ_THRESHOLD = 60


# ---------------------------------------------------------------------------
# Profile (self-service)
# ---------------------------------------------------------------------------


async def get_profile(session: AsyncSession, user_id: UUID) -> Student | None:
    result = await session.execute(select(Student).where(Student.user_id == user_id))
    return result.scalar_one_or_none()


async def update_profile(session: AsyncSession, user_id: UUID, payload: StudentProfileUpdate) -> Student:
    student = await get_profile(session, user_id)
    if student is None:
        student = Student(user_id=user_id)
        session.add(student)

    if payload.whatsapp is not None:
        student.whatsapp = payload.whatsapp
    if payload.nickname is not None:
        student.nickname = payload.nickname
    if payload.avatar is not None:
        student.avatar = payload.avatar

    await session.commit()
    await session.refresh(student)
    return student


# ---------------------------------------------------------------------------
# Parent linking (student side)
# ---------------------------------------------------------------------------


async def get_or_create_link_code(session: AsyncSession, user_id: UUID) -> str:
    student = await get_profile(session, user_id)
    if student is None:
        student = Student(user_id=user_id)
        session.add(student)
    if not student.parent_link_code:
        student.parent_link_code = secrets.token_urlsafe(9)
        await session.commit()
        await session.refresh(student)
    return student.parent_link_code


async def regenerate_link_code(session: AsyncSession, user_id: UUID) -> str:
    student = await get_profile(session, user_id)
    if student is None:
        student = Student(user_id=user_id)
        session.add(student)
    student.parent_link_code = secrets.token_urlsafe(9)
    await session.commit()
    await session.refresh(student)
    return student.parent_link_code


async def list_pending_link_requests(session: AsyncSession, user_id: UUID) -> list[ParentLinkRequestRead]:
    result = await session.execute(
        select(ParentStudentLink, User)
        .join(User, User.id == ParentStudentLink.parent_id)
        .where(
            ParentStudentLink.student_id == user_id,
            ParentStudentLink.status == ParentLinkStatus.PENDING,
            ParentStudentLink.initiated_by == LinkInitiator.PARENT_CODE,
        )
        .order_by(ParentStudentLink.requested_at.desc())
    )
    return [
        ParentLinkRequestRead(
            id=link.id,
            parent_id=parent.id,
            parent_full_name=parent.full_name,
            parent_public_code=parent.public_code,
            status=link.status.value,
            requested_at=link.requested_at,
        )
        for link, parent in result.all()
    ]


async def decide_link_request(
    session: AsyncSession, user_id: UUID, link_id: UUID, approve: bool
) -> ParentStudentLink | None:
    link = await session.get(ParentStudentLink, link_id)
    if link is None or link.student_id != user_id or link.initiated_by != LinkInitiator.PARENT_CODE:
        return None

    link.status = ParentLinkStatus.ACTIVE if approve else ParentLinkStatus.DENIED
    link.decided_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(link)

    requester = await session.get(User, user_id)
    student_name = requester.full_name if requester else "Your child"
    await notifications_service.create_notification(
        session, notifications_service.notify_link_decided(link.parent_id, student_name, approve)
    )
    return link


async def create_parent_invite(session: AsyncSession, user_id: UUID, email: str) -> ParentInvite:
    normalized_email = email.strip().lower()

    parent_result = await session.execute(
        select(User).where(func.lower(User.email) == normalized_email, User.role == Role.PARENT)
    )
    parent = parent_result.scalar_one_or_none()

    invite = ParentInvite(student_id=user_id, invited_email=normalized_email)
    session.add(invite)
    await session.flush()

    if parent is not None:
        link_result = await session.execute(
            select(ParentStudentLink).where(
                ParentStudentLink.parent_id == parent.id, ParentStudentLink.student_id == user_id
            )
        )
        link = link_result.scalar_one_or_none()
        if link is None:
            link = ParentStudentLink(
                parent_id=parent.id,
                student_id=user_id,
                status=ParentLinkStatus.PENDING,
                initiated_by=LinkInitiator.STUDENT_INVITE,
            )
            session.add(link)
        elif link.status in (ParentLinkStatus.REVOKED, ParentLinkStatus.DENIED):
            link.status = ParentLinkStatus.PENDING
            link.initiated_by = LinkInitiator.STUDENT_INVITE
            link.decided_at = None
        await session.flush()

        invite.status = ParentInviteStatus.MATCHED
        invite.resolved_link_id = link.id
        invite.resolved_at = datetime.now(timezone.utc)
        await session.commit()

        requester = await session.get(User, user_id)
        student_name = requester.full_name if requester else "A student"
        await notifications_service.create_notification(
            session, notifications_service.notify_invite_received(parent.id, student_name)
        )
    else:
        await session.commit()

    await session.refresh(invite)
    return invite


async def list_parent_invites(session: AsyncSession, user_id: UUID) -> list[ParentInvite]:
    result = await session.execute(
        select(ParentInvite).where(ParentInvite.student_id == user_id).order_by(ParentInvite.created_at.desc())
    )
    return list(result.scalars().all())


async def cancel_parent_invite(session: AsyncSession, user_id: UUID, invite_id: UUID) -> ParentInvite | None:
    invite = await session.get(ParentInvite, invite_id)
    if invite is None or invite.student_id != user_id or invite.status != ParentInviteStatus.PENDING:
        return None
    invite.status = ParentInviteStatus.CANCELLED
    await session.commit()
    await session.refresh(invite)
    return invite


class _StudentStats:
    __slots__ = (
        "sessions_completed",
        "progress_percent",
        "watch_time_minutes",
        "quiz_average",
        "last_activity_at",
    )

    def __init__(self) -> None:
        self.sessions_completed = 0
        self.progress_percent = 0.0
        self.watch_time_minutes = 0
        self.quiz_average: float | None = None
        self.last_activity_at: datetime | None = None


async def _compute_stats(
    session: AsyncSession, course_id: UUID, student_ids: list[UUID]
) -> tuple[dict[UUID, _StudentStats], int]:
    stats: dict[UUID, _StudentStats] = defaultdict(_StudentStats)
    if not student_ids:
        return stats, 0

    session_ids_result = await session.execute(select(ClassSession.id).where(ClassSession.course_id == course_id))
    session_ids = list(session_ids_result.scalars().all())
    sessions_total = len(session_ids)

    if session_ids:
        progress_result = await session.execute(
            select(
                SessionProgress.student_id,
                func.avg(SessionProgress.percent_complete).label("avg_pct"),
                func.sum(case((SessionProgress.completed_at.isnot(None), 1), else_=0)).label("completed"),
                func.sum(SessionProgress.last_position_seconds).label("watch_seconds"),
                func.max(SessionProgress.updated_at).label("last_at"),
            )
            .where(SessionProgress.session_id.in_(session_ids), SessionProgress.student_id.in_(student_ids))
            .group_by(SessionProgress.student_id)
        )
        for row in progress_result.all():
            entry = stats[row.student_id]
            entry.progress_percent = float(row.avg_pct or 0)
            entry.sessions_completed = int(row.completed or 0)
            entry.watch_time_minutes = int((row.watch_seconds or 0) // 60)
            entry.last_activity_at = row.last_at

    quiz_result = await session.execute(
        select(
            QuizAttempt.student_id,
            func.avg(QuizResult.percentage).label("avg_score"),
            func.max(QuizAttempt.started_at).label("last_at"),
        )
        .join(QuizResult, QuizResult.attempt_id == QuizAttempt.id)
        .join(Quiz, Quiz.id == QuizAttempt.quiz_id)
        .where(Quiz.course_id == course_id, QuizAttempt.student_id.in_(student_ids))
        .group_by(QuizAttempt.student_id)
    )
    for row in quiz_result.all():
        entry = stats[row.student_id]
        entry.quiz_average = float(row.avg_score) if row.avg_score is not None else None
        if row.last_at is not None and (entry.last_activity_at is None or row.last_at > entry.last_activity_at):
            entry.last_activity_at = row.last_at

    return stats, sessions_total


async def list_roster(session: AsyncSession, course_id: UUID) -> list[StudentRosterEntry]:
    enrollment_result = await session.execute(
        select(Enrollment, User)
        .join(User, User.id == Enrollment.student_id)
        .where(Enrollment.course_id == course_id)
        .order_by(Enrollment.enrolled_at.desc())
    )
    rows = enrollment_result.all()
    student_ids = [row.User.id for row in rows]
    stats, sessions_total = await _compute_stats(session, course_id, student_ids)

    entries: list[StudentRosterEntry] = []
    for row in rows:
        enrollment, user = row.Enrollment, row.User
        s = stats.get(user.id, _StudentStats())
        entries.append(
            StudentRosterEntry(
                student_id=user.id,
                public_code=user.public_code,
                full_name=user.full_name,
                email=user.email,
                course_id=course_id,
                enrolled_at=enrollment.enrolled_at,
                progress_percent=round(s.progress_percent, 1),
                quiz_average=round(s.quiz_average, 1) if s.quiz_average is not None else None,
                sessions_completed=s.sessions_completed,
                sessions_total=sessions_total,
                last_activity_at=s.last_activity_at,
            )
        )
    return entries


async def list_progress(session: AsyncSession, course_id: UUID) -> list[StudentProgressEntry]:
    roster = await list_roster(session, course_id)
    student_ids = [r.student_id for r in roster]
    stats, _ = await _compute_stats(session, course_id, student_ids)
    return [
        StudentProgressEntry(
            student_id=r.student_id,
            full_name=r.full_name,
            course_id=r.course_id,
            sessions_completed=r.sessions_completed,
            sessions_total=r.sessions_total,
            progress_percent=r.progress_percent,
            quiz_average=r.quiz_average,
            watch_time_minutes=stats.get(r.student_id, _StudentStats()).watch_time_minutes,
        )
        for r in roster
    ]


async def list_at_risk(session: AsyncSession, course_id: UUID) -> list[AtRiskEntry]:
    roster = await list_roster(session, course_id)
    now = datetime.now(timezone.utc)
    entries: list[AtRiskEntry] = []

    for r in roster:
        reasons: list[str] = []
        if r.quiz_average is not None and r.quiz_average < _LOW_QUIZ_THRESHOLD:
            reasons.append(f"Quiz average below {_LOW_QUIZ_THRESHOLD}%")
        if r.progress_percent < _LOW_PROGRESS_THRESHOLD:
            reasons.append("Low course progress")
        if r.last_activity_at is None:
            reasons.append("No activity recorded")
        else:
            last_at = r.last_activity_at if r.last_activity_at.tzinfo else r.last_activity_at.replace(tzinfo=timezone.utc)
            if (now - last_at) > timedelta(days=_INACTIVITY_THRESHOLD_DAYS):
                reasons.append(f"Inactive for {_INACTIVITY_THRESHOLD_DAYS}+ days")

        if not reasons:
            continue

        risk_level = "high" if len(reasons) >= 2 else "medium"
        entries.append(
            AtRiskEntry(
                student_id=r.student_id,
                full_name=r.full_name,
                course_id=course_id,
                risk_level=risk_level,
                risk_reasons=reasons,
                progress_percent=r.progress_percent,
                quiz_average=r.quiz_average,
                last_activity_at=r.last_activity_at,
            )
        )
    return entries


async def list_wrong_questions(
    session: AsyncSession, course_id: UUID, student_id: UUID | None = None
) -> list[WrongQuestionEntry]:
    query = (
        select(
            QuizAttempt.student_id,
            QuestionResult.question_id,
            func.count(QuestionResult.id).label("retry_count"),
            func.max(QuizResult.graded_at).label("last_wrong_at"),
        )
        .select_from(QuestionResult)
        .join(QuizResult, QuizResult.id == QuestionResult.quiz_result_id)
        .join(QuizAttempt, QuizAttempt.id == QuizResult.attempt_id)
        .join(Quiz, Quiz.id == QuizAttempt.quiz_id)
        .where(QuestionResult.is_correct.is_(False), Quiz.course_id == course_id)
        .group_by(QuizAttempt.student_id, QuestionResult.question_id)
    )
    if student_id is not None:
        query = query.where(QuizAttempt.student_id == student_id)

    rows = (await session.execute(query)).all()
    if not rows:
        return []

    question_ids = list({row.question_id for row in rows})
    student_ids = list({row.student_id for row in rows})

    questions_result = await session.execute(
        select(Question)
        .where(Question.id.in_(question_ids))
        .options(
            selectinload(Question.chapters),
            selectinload(Question.concepts),
            selectinload(Question.atomic_concepts),
        )
    )
    questions_by_id = {q.id: q for q in questions_result.scalars().all()}

    users_result = await session.execute(select(User).where(User.id.in_(student_ids)))
    users_by_id = {u.id: u for u in users_result.scalars().all()}

    course = await session.get(Course, course_id)
    course_title = course.title if course is not None else ""

    entries: list[WrongQuestionEntry] = []
    for row in rows:
        question = questions_by_id.get(row.question_id)
        user = users_by_id.get(row.student_id)
        if question is None or user is None:
            continue
        entries.append(
            WrongQuestionEntry(
                student_id=row.student_id,
                full_name=user.full_name,
                question_id=question.id,
                question_title=question.title,
                course_id=course_id,
                course_title=course_title,
                chapter=question.chapters[0].title if question.chapters else None,
                concept=question.concepts[0].title if question.concepts else None,
                atomic_concept=question.atomic_concepts[0].title if question.atomic_concepts else None,
                question_type=question.question_type.value,
                difficulty=question.difficulty.value,
                retry_count=int(row.retry_count),
                last_wrong_at=row.last_wrong_at,
            )
        )
    entries.sort(key=lambda e: e.retry_count, reverse=True)
    return entries


async def list_memory_insights(
    session: AsyncSession, course_id: UUID, student_id: UUID | None = None
) -> list[MemoryInsightEntry]:
    query = (
        select(
            QuizAttempt.student_id,
            QuestionResult.is_correct,
            QuizResult.graded_at,
            Question.id.label("question_id"),
        )
        .select_from(QuestionResult)
        .join(QuizResult, QuizResult.id == QuestionResult.quiz_result_id)
        .join(QuizAttempt, QuizAttempt.id == QuizResult.attempt_id)
        .join(Quiz, Quiz.id == QuizAttempt.quiz_id)
        .join(Question, Question.id == QuestionResult.question_id)
        .where(Quiz.course_id == course_id)
    )
    if student_id is not None:
        query = query.where(QuizAttempt.student_id == student_id)

    rows = (await session.execute(query)).all()
    if not rows:
        return []

    question_ids = list({row.question_id for row in rows})
    questions_result = await session.execute(
        select(Question).where(Question.id.in_(question_ids)).options(selectinload(Question.concepts))
    )
    concept_titles_by_question: dict[UUID, list[str]] = {
        q.id: [c.title for c in q.concepts] for q in questions_result.scalars().all()
    }

    # student_id -> concept -> [is_correct, ...], and last practiced timestamp
    per_student: dict[UUID, dict[str, list[bool]]] = defaultdict(lambda: defaultdict(list))
    last_practiced: dict[tuple[UUID, str], datetime] = {}
    for row in rows:
        concepts = concept_titles_by_question.get(row.question_id) or ["General"]
        for concept in concepts:
            per_student[row.student_id][concept].append(bool(row.is_correct))
            key = (row.student_id, concept)
            if row.graded_at is not None and (key not in last_practiced or row.graded_at > last_practiced[key]):
                last_practiced[key] = row.graded_at

    user_ids = list(per_student.keys())
    users_result = await session.execute(select(User).where(User.id.in_(user_ids)))
    users_by_id = {u.id: u for u in users_result.scalars().all()}

    entries: list[MemoryInsightEntry] = []
    for uid, concept_map in per_student.items():
        user = users_by_id.get(uid)
        if user is None:
            continue
        scores = [
            ConceptScore(
                concept=concept,
                score=round(100 * sum(results) / len(results), 1),
                last_practiced_at=last_practiced.get((uid, concept)),
            )
            for concept, results in concept_map.items()
        ]
        strengths = [s.concept for s in scores if s.score >= 80]
        weak = sorted([s for s in scores if s.score < 60], key=lambda s: s.score)
        recommendations = [f"Review {w.concept} — {w.score:.0f}% accuracy so far" for w in weak[:5]]
        entries.append(
            MemoryInsightEntry(
                student_id=uid,
                full_name=user.full_name,
                strengths=strengths,
                weak_concepts=weak,
                recommendations=recommendations,
            )
        )
    return entries


async def course_report_summary(session: AsyncSession, course_id: UUID) -> CourseReportSummary:
    # Local imports: certificates/wallets are separate modules and this is
    # the only place students-reporting needs to read across them.
    from app.modules.certificates.models import Certificate, CertificateStatus
    from app.modules.wallets.models import TransactionStatus, TransactionType, Wallet, WalletTransaction

    course = await session.get(Course, course_id)
    course_title = course.title if course is not None else ""

    roster = await list_roster(session, course_id)
    at_risk = await list_at_risk(session, course_id)

    total_students = len(roster)
    now = datetime.now(timezone.utc)
    active_students = 0
    for r in roster:
        if r.last_activity_at is None:
            continue
        last_at = r.last_activity_at if r.last_activity_at.tzinfo else r.last_activity_at.replace(tzinfo=timezone.utc)
        if (now - last_at) <= timedelta(days=30):
            active_students += 1

    avg_progress = round(sum(r.progress_percent for r in roster) / total_students, 1) if total_students else 0.0
    quiz_scores = [r.quiz_average for r in roster if r.quiz_average is not None]
    avg_quiz = round(sum(quiz_scores) / len(quiz_scores), 1) if quiz_scores else None

    certificates_issued_result = await session.execute(
        select(func.count(Certificate.id)).where(
            Certificate.course_id == course_id, Certificate.status == CertificateStatus.ISSUED
        )
    )
    certificates_issued = int(certificates_issued_result.scalar_one() or 0)

    revenue_result = await session.execute(
        select(func.coalesce(func.sum(WalletTransaction.amount), 0))
        .join(Wallet, Wallet.id == WalletTransaction.wallet_id)
        .where(
            WalletTransaction.course_id == course_id,
            WalletTransaction.type == TransactionType.PAYMENT,
            WalletTransaction.status == TransactionStatus.PAID,
        )
    )
    total_revenue = float(revenue_result.scalar_one() or 0)

    pending_result = await session.execute(
        select(func.coalesce(func.sum(WalletTransaction.amount), 0)).where(
            WalletTransaction.course_id == course_id,
            WalletTransaction.status == TransactionStatus.PENDING,
        )
    )
    pending_payments = float(pending_result.scalar_one() or 0)

    return CourseReportSummary(
        course_id=course_id,
        course_title=course_title,
        total_students=total_students,
        active_students=active_students,
        average_progress_percent=avg_progress,
        average_quiz_score=avg_quiz,
        at_risk_count=len(at_risk),
        certificates_issued=certificates_issued,
        total_revenue=total_revenue,
        pending_payments=pending_payments,
    )


# ---------------------------------------------------------------------------
# Pods
# ---------------------------------------------------------------------------


def _pod_options():
    return (selectinload(StudentPod.members),)


async def _pod_to_read(session: AsyncSession, pod: StudentPod):
    from app.modules.students.schemas import StudentPodMemberRead, StudentPodRead

    member_ids = [m.student_id for m in pod.members]
    users_by_id: dict[UUID, User] = {}
    if member_ids:
        result = await session.execute(select(User).where(User.id.in_(member_ids)))
        users_by_id = {u.id: u for u in result.scalars().all()}

    return StudentPodRead(
        id=pod.id,
        course_id=pod.course_id,
        name=pod.name,
        description=pod.description,
        created_at=pod.created_at,
        updated_at=pod.updated_at,
        members=[
            StudentPodMemberRead(student_id=m.student_id, full_name=users_by_id[m.student_id].full_name, email=users_by_id[m.student_id].email)
            for m in pod.members
            if m.student_id in users_by_id
        ],
    )


async def list_pods(session: AsyncSession, course_id: UUID):
    result = await session.execute(
        select(StudentPod).where(StudentPod.course_id == course_id).options(*_pod_options()).order_by(StudentPod.created_at)
    )
    pods = list(result.scalars().all())
    return [await _pod_to_read(session, pod) for pod in pods]


async def create_pod(session: AsyncSession, payload: StudentPodCreate):
    pod = StudentPod(course_id=payload.course_id, name=payload.name, description=payload.description)
    session.add(pod)
    await session.commit()
    pod = await get_pod(session, pod.id)
    return await _pod_to_read(session, pod)


async def get_pod(session: AsyncSession, pod_id: UUID) -> StudentPod | None:
    result = await session.execute(
        select(StudentPod)
        .where(StudentPod.id == pod_id)
        .options(*_pod_options())
        .execution_options(populate_existing=True)
    )
    return result.scalar_one_or_none()


async def update_pod(session: AsyncSession, pod_id: UUID, payload: StudentPodUpdate):
    pod = await get_pod(session, pod_id)
    if pod is None:
        return None
    if payload.name is not None:
        pod.name = payload.name
    if payload.description is not None:
        pod.description = payload.description
    await session.commit()
    pod = await get_pod(session, pod_id)
    return await _pod_to_read(session, pod)


async def delete_pod(session: AsyncSession, pod_id: UUID) -> bool:
    pod = await session.get(StudentPod, pod_id)
    if pod is None:
        return False
    await session.delete(pod)
    await session.commit()
    return True


async def add_pod_member(session: AsyncSession, pod_id: UUID, payload: PodMemberAdd):
    pod = await get_pod(session, pod_id)
    if pod is None:
        return None
    existing = await session.execute(
        select(StudentPodMember).where(
            StudentPodMember.pod_id == pod_id, StudentPodMember.student_id == payload.student_id
        )
    )
    if existing.scalar_one_or_none() is None:
        session.add(StudentPodMember(pod_id=pod_id, student_id=payload.student_id))
        await session.commit()
    pod = await get_pod(session, pod_id)
    return await _pod_to_read(session, pod)


async def remove_pod_member(session: AsyncSession, pod_id: UUID, student_id: UUID) -> bool:
    result = await session.execute(
        select(StudentPodMember).where(StudentPodMember.pod_id == pod_id, StudentPodMember.student_id == student_id)
    )
    member = result.scalar_one_or_none()
    if member is None:
        return False
    await session.delete(member)
    await session.commit()
    return True
