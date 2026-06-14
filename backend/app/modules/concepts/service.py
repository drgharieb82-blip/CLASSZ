from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.concepts import repository
from app.modules.concepts.models import Concept, ConceptDependency, StudentConceptState
from app.modules.concepts.schemas import ConceptCreate, ConceptDependencyCreate, ConceptUpdate, StudentConceptStateCreate


async def list_concepts(session: AsyncSession) -> list[Concept]:
    return await repository.list_concepts(session)


async def get_concept(session: AsyncSession, concept_id: UUID) -> Concept | None:
    return await repository.get_concept(session, concept_id)


async def create_concept(session: AsyncSession, payload: ConceptCreate) -> Concept:
    return await repository.create_concept(session, payload)


async def update_concept(session: AsyncSession, concept_id: UUID, payload: ConceptUpdate) -> Concept | None:
    concept = await repository.get_concept(session, concept_id)
    if concept is None:
        return None

    return await repository.update_concept(session, concept, payload)


async def create_dependency(session: AsyncSession, payload: ConceptDependencyCreate) -> ConceptDependency:
    return await repository.create_dependency(session, payload)


async def list_dependencies(session: AsyncSession, concept_id: UUID) -> list[ConceptDependency]:
    return await repository.list_dependencies(session, concept_id)


async def upsert_student_concept_state(session: AsyncSession, payload: StudentConceptStateCreate) -> StudentConceptState:
    return await repository.upsert_student_concept_state(session, payload)


async def list_student_concept_states(session: AsyncSession, student_id: UUID) -> list[StudentConceptState]:
    return await repository.list_student_concept_states(session, student_id)
