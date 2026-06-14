from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.concepts.models import Concept, ConceptDependency, StudentConceptState
from app.modules.concepts.schemas import ConceptCreate, ConceptDependencyCreate, ConceptUpdate, StudentConceptStateCreate


async def list_concepts(session: AsyncSession) -> list[Concept]:
    result = await session.execute(select(Concept).order_by(Concept.subject, Concept.name))
    return list(result.scalars().all())


async def get_concept(session: AsyncSession, concept_id: UUID) -> Concept | None:
    result = await session.execute(
        select(Concept)
        .where(Concept.id == concept_id)
        .options(selectinload(Concept.outgoing_dependencies), selectinload(Concept.incoming_dependencies))
    )
    return result.scalar_one_or_none()


async def create_concept(session: AsyncSession, payload: ConceptCreate) -> Concept:
    concept = Concept(**payload.model_dump())
    session.add(concept)
    await session.commit()
    await session.refresh(concept)
    return concept


async def update_concept(session: AsyncSession, concept: Concept, payload: ConceptUpdate) -> Concept:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(concept, key, value)

    await session.commit()
    await session.refresh(concept)
    return concept


async def create_dependency(session: AsyncSession, payload: ConceptDependencyCreate) -> ConceptDependency:
    dependency = ConceptDependency(**payload.model_dump())
    session.add(dependency)
    await session.commit()
    await session.refresh(dependency)
    return dependency


async def list_dependencies(session: AsyncSession, concept_id: UUID) -> list[ConceptDependency]:
    result = await session.execute(
        select(ConceptDependency)
        .where((ConceptDependency.source_concept_id == concept_id) | (ConceptDependency.target_concept_id == concept_id))
        .order_by(ConceptDependency.created_at.desc())
    )
    return list(result.scalars().all())


async def upsert_student_concept_state(session: AsyncSession, payload: StudentConceptStateCreate) -> StudentConceptState:
    result = await session.execute(
        select(StudentConceptState).where(
            StudentConceptState.student_id == payload.student_id,
            StudentConceptState.concept_id == payload.concept_id,
        )
    )
    state = result.scalar_one_or_none()
    if state is None:
        state = StudentConceptState(**payload.model_dump())
        session.add(state)
    else:
        for key, value in payload.model_dump().items():
            setattr(state, key, value)

    await session.commit()
    await session.refresh(state)
    return state


async def list_student_concept_states(session: AsyncSession, student_id: UUID) -> list[StudentConceptState]:
    result = await session.execute(
        select(StudentConceptState)
        .where(StudentConceptState.student_id == student_id)
        .order_by(StudentConceptState.updated_at.desc())
    )
    return list(result.scalars().all())
