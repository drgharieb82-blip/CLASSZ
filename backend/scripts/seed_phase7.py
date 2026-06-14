import asyncio
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.user import Role, User
from app.modules.assistant.models import ExplainableInsight, InsightType
from app.modules.concepts.models import Concept, ConceptDependency, ConceptStateStatus, StudentConceptState
from app.modules.revision_plans.models import RevisionPlan, RevisionPlanStatus
from app.modules.students.models import Student
from app.modules.student_memory.models import MemoryEvent, MemoryEventType, MemoryImportance
from app.modules.teachers.models import Teacher

SAMPLE_STUDENT_USER_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")
SAMPLE_TEACHER_USER_ID = uuid.UUID("22222222-2222-2222-2222-222222222222")
SAMPLE_STUDENT_ID = uuid.UUID("33333333-3333-3333-3333-333333333333")
SAMPLE_TEACHER_ID = uuid.UUID("44444444-4444-4444-4444-444444444444")


async def get_or_create_user(user_id: uuid.UUID, email: str, full_name: str, role: Role) -> User:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is not None:
            return user

        user = User(
            id=user_id,
            email=email,
            full_name=full_name,
            hashed_password=hash_password("Classz123!"),
            role=role,
            is_active=True,
        )
        session.add(user)
        await session.commit()
        return user


async def seed() -> None:
    await get_or_create_user(SAMPLE_STUDENT_USER_ID, "mariam.student@classz.local", "Mariam Hassan", Role.STUDENT)
    await get_or_create_user(SAMPLE_TEACHER_USER_ID, "science.teacher@classz.local", "Science Teacher", Role.TEACHER)

    async with AsyncSessionLocal() as session:
        student = await session.get(Student, SAMPLE_STUDENT_ID)
        if student is None:
            student = Student(
                id=SAMPLE_STUDENT_ID,
                user_id=SAMPLE_STUDENT_USER_ID,
                display_name="Mariam Hassan",
                grade="Secondary 3",
            )
            session.add(student)

        teacher = await session.get(Teacher, SAMPLE_TEACHER_ID)
        if teacher is None:
            session.add(
                Teacher(
                    id=SAMPLE_TEACHER_ID,
                    user_id=SAMPLE_TEACHER_USER_ID,
                    display_name="Science Teacher",
                    specialization="Chemistry",
                )
            )

        concept_result = await session.execute(select(Concept).where(Concept.slug.in_(("oxidation-number", "galvanic-cell", "electrolysis"))))
        existing_concepts = {concept.slug: concept for concept in concept_result.scalars().all()}
        concepts = {
            "oxidation-number": existing_concepts.get("oxidation-number")
            or Concept(
                name="Oxidation Number",
                slug="oxidation-number",
                subject="Chemistry",
                description="Assign oxidation numbers in redox equations.",
                difficulty_level=3,
            ),
            "galvanic-cell": existing_concepts.get("galvanic-cell")
            or Concept(
                name="Galvanic Cell",
                slug="galvanic-cell",
                subject="Chemistry",
                description="Explain anode, cathode, salt bridge, and electron flow.",
                difficulty_level=2,
            ),
            "electrolysis": existing_concepts.get("electrolysis")
            or Concept(
                name="Electrolysis",
                slug="electrolysis",
                subject="Chemistry",
                description="Predict products and electrode behavior in electrolysis.",
                difficulty_level=4,
            ),
        }
        for concept in concepts.values():
            session.add(concept)

        await session.flush()

        dependency_result = await session.execute(
            select(ConceptDependency).where(
                ConceptDependency.source_concept_id == concepts["oxidation-number"].id,
                ConceptDependency.target_concept_id == concepts["electrolysis"].id,
            )
        )
        if dependency_result.scalar_one_or_none() is None:
            session.add(
                ConceptDependency(
                    source_concept_id=concepts["oxidation-number"].id,
                    target_concept_id=concepts["electrolysis"].id,
                    relation_type="prerequisite",
                    weight=0.85,
                )
            )

        state_result = await session.execute(
            select(StudentConceptState).where(
                StudentConceptState.student_id == SAMPLE_STUDENT_ID,
                StudentConceptState.concept_id == concepts["oxidation-number"].id,
            )
        )
        if state_result.scalar_one_or_none() is None:
            session.add(
                StudentConceptState(
                    student_id=SAMPLE_STUDENT_ID,
                    concept_id=concepts["oxidation-number"].id,
                    mastery_score=35,
                    confidence_score=88,
                    weakness_score=65,
                    status=ConceptStateStatus.REVIEW,
                    last_practiced_at=datetime.now(UTC) - timedelta(days=1),
                    next_review_at=datetime.now(UTC) + timedelta(days=1),
                )
            )

        event_result = await session.execute(select(MemoryEvent).where(MemoryEvent.student_id == SAMPLE_STUDENT_ID))
        if event_result.first() is None:
            session.add(
                MemoryEvent(
                    student_id=SAMPLE_STUDENT_ID,
                    concept_id=concepts["oxidation-number"].id,
                    event_type=MemoryEventType.WEAKNESS_DETECTED,
                    title="Weakness detected in oxidation numbers",
                    description="Repeated mistakes while assigning oxidation numbers in redox equations.",
                    importance=MemoryImportance.HIGH,
                    metadata_json={"source": "phase7_seed"},
                )
            )

        plan_result = await session.execute(select(RevisionPlan).where(RevisionPlan.student_id == SAMPLE_STUDENT_ID))
        if plan_result.first() is None:
            session.add(
                RevisionPlan(
                    student_id=SAMPLE_STUDENT_ID,
                    title="Oxidation repair plan",
                    description="Short review loop for oxidation numbers before electrolysis practice.",
                    status=RevisionPlanStatus.ACTIVE,
                    priority="high",
                    starts_at=datetime.now(UTC),
                    due_at=datetime.now(UTC) + timedelta(days=3),
                    plan_items=[
                        {"type": "lesson", "title": "Review oxidation number rules"},
                        {"type": "practice", "title": "Solve 10 focused redox questions"},
                    ],
                )
            )

        insight_result = await session.execute(select(ExplainableInsight).where(ExplainableInsight.student_id == SAMPLE_STUDENT_ID))
        if insight_result.first() is None:
            session.add(
                ExplainableInsight(
                    student_id=SAMPLE_STUDENT_ID,
                    concept_id=concepts["oxidation-number"].id,
                    insight_type=InsightType.WEAKNESS,
                    title="Repair oxidation number first",
                    summary="Oxidation Number is blocking progress into electrolysis.",
                    explanation="The concept dependency graph links oxidation number as a prerequisite for electrolysis.",
                    evidence=[{"type": "memory_event", "title": "Weakness detected in oxidation numbers"}],
                    confidence=86,
                )
            )

        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())
