from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.concepts import service
from app.modules.concepts.schemas import (
    ConceptCreate,
    ConceptDependencyCreate,
    ConceptDependencyRead,
    ConceptRead,
    ConceptUpdate,
    StudentConceptStateCreate,
    StudentConceptStateRead,
)

router = APIRouter(prefix="/concepts", tags=["concepts"])


@router.get("", response_model=list[ConceptRead])
async def list_concepts(session: AsyncSession = Depends(get_db_session)) -> list[ConceptRead]:
    return await service.list_concepts(session)


@router.get("/students/{student_id}/states", response_model=list[StudentConceptStateRead])
async def list_student_concept_states(student_id: UUID, session: AsyncSession = Depends(get_db_session)) -> list[StudentConceptStateRead]:
    return await service.list_student_concept_states(session, student_id)


@router.post("/students/states", response_model=StudentConceptStateRead, status_code=status.HTTP_201_CREATED)
async def upsert_student_concept_state(
    payload: StudentConceptStateCreate,
    session: AsyncSession = Depends(get_db_session),
) -> StudentConceptStateRead:
    return await service.upsert_student_concept_state(session, payload)


@router.get("/{concept_id}", response_model=ConceptRead)
async def get_concept(concept_id: UUID, session: AsyncSession = Depends(get_db_session)) -> ConceptRead:
    concept = await service.get_concept(session, concept_id)
    if concept is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Concept not found")

    return concept


@router.post("", response_model=ConceptRead, status_code=status.HTTP_201_CREATED)
async def create_concept(payload: ConceptCreate, session: AsyncSession = Depends(get_db_session)) -> ConceptRead:
    return await service.create_concept(session, payload)


@router.patch("/{concept_id}", response_model=ConceptRead)
async def update_concept(concept_id: UUID, payload: ConceptUpdate, session: AsyncSession = Depends(get_db_session)) -> ConceptRead:
    concept = await service.update_concept(session, concept_id, payload)
    if concept is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Concept not found")

    return concept


@router.get("/{concept_id}/dependencies", response_model=list[ConceptDependencyRead])
async def list_dependencies(concept_id: UUID, session: AsyncSession = Depends(get_db_session)) -> list[ConceptDependencyRead]:
    return await service.list_dependencies(session, concept_id)


@router.post("/dependencies", response_model=ConceptDependencyRead, status_code=status.HTTP_201_CREATED)
async def create_dependency(payload: ConceptDependencyCreate, session: AsyncSession = Depends(get_db_session)) -> ConceptDependencyRead:
    return await service.create_dependency(session, payload)
