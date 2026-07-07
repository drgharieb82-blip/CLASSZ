from uuid import UUID

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.identity import EntityType, format_public_code
from app.modules.concepts.models import Concept
from app.modules.concepts.schemas import ConceptCreate


async def _next_concept_public_code(session: AsyncSession) -> str:
    """Real, DB-backed sequence read - see teachers/service.py for why this reads
    the Postgres sequence directly rather than the in-memory CodeGeneratorService."""
    result = await session.execute(text("SELECT nextval('seq_concept_code')"))
    sequence = int(result.scalar_one())
    return format_public_code(EntityType.CONCEPT, sequence)


async def create_concept(session: AsyncSession, payload: ConceptCreate) -> Concept:
    result = await session.execute(
        select(func.count(Concept.id)).where(Concept.lesson_id == payload.lesson_id)
    )
    position = result.scalar_one()
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
