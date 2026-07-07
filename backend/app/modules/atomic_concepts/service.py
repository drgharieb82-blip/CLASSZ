from uuid import UUID

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.identity import EntityType, format_public_code
from app.modules.atomic_concepts.models import AtomicConcept
from app.modules.atomic_concepts.schemas import AtomicConceptCreate


async def _next_atomic_concept_public_code(session: AsyncSession) -> str:
    """Real, DB-backed sequence read - see teachers/service.py for why this reads
    the Postgres sequence directly rather than the in-memory CodeGeneratorService."""
    result = await session.execute(text("SELECT nextval('seq_atomic_concept_code')"))
    sequence = int(result.scalar_one())
    return format_public_code(EntityType.ATOMIC_CONCEPT, sequence)


async def create_atomic_concept(session: AsyncSession, payload: AtomicConceptCreate) -> AtomicConcept:
    result = await session.execute(
        select(func.count(AtomicConcept.id)).where(AtomicConcept.concept_id == payload.concept_id)
    )
    position = result.scalar_one()
    public_code = await _next_atomic_concept_public_code(session)
    atomic_concept = AtomicConcept(
        public_code=public_code,
        concept_id=payload.concept_id,
        title=payload.title,
        position=position,
    )
    session.add(atomic_concept)
    await session.commit()
    await session.refresh(atomic_concept)
    return atomic_concept


async def list_atomic_concepts(session: AsyncSession, concept_id: UUID) -> list[AtomicConcept]:
    result = await session.execute(
        select(AtomicConcept)
        .where(AtomicConcept.concept_id == concept_id)
        .order_by(AtomicConcept.position)
    )
    return list(result.scalars().all())
