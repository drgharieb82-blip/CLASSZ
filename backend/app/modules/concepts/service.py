from uuid import UUID

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.identity import EntityType, format_public_code
from app.modules.concepts.models import Concept
from app.modules.concepts.schemas import ConceptCreate, ConceptUpdate


async def _next_concept_public_code(session: AsyncSession) -> str:
    """Real, DB-backed sequence read - see teachers/service.py for why this reads
    the Postgres sequence directly rather than the in-memory CodeGeneratorService."""
    result = await session.execute(text("SELECT nextval('seq_concept_code')"))
    sequence = int(result.scalar_one())
    return format_public_code(EntityType.CONCEPT, sequence)


async def create_concept(session: AsyncSession, payload: ConceptCreate) -> Concept:
    result = await session.execute(
        select(func.coalesce(func.max(Concept.position), -1)).where(Concept.lesson_id == payload.lesson_id)
    )
    position = result.scalar_one() + 1
    public_code = await _next_concept_public_code(session)
    concept = Concept(
        public_code=public_code,
        lesson_id=payload.lesson_id,
        title=payload.title,
        position=position,
    )
    session.add(concept)
    await session.commit()
    await session.refresh(concept)
    return concept


async def list_concepts(session: AsyncSession, lesson_id: UUID) -> list[Concept]:
    result = await session.execute(
        select(Concept)
        .where(Concept.lesson_id == lesson_id)
        .order_by(Concept.position)
    )
    return list(result.scalars().all())


async def update_concept(session: AsyncSession, concept_id: UUID, payload: ConceptUpdate) -> Concept | None:
    concept = await session.get(Concept, concept_id)
    if concept is None:
        return None
    if payload.title is not None:
        concept.title = payload.title
    await session.commit()
    await session.refresh(concept)
    return concept


async def delete_concept(session: AsyncSession, concept_id: UUID) -> bool:
    concept = await session.get(Concept, concept_id)
    if concept is None:
        return False
    await session.delete(concept)
    await session.commit()
    return True
