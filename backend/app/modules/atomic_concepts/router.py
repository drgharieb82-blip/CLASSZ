from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_owns_atomic_concept, assert_owns_concept, assert_student_enrolled_in_concept
from app.modules.assistants.models import AssistantAction
from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_teacher, get_current_user
from app.modules.atomic_concepts import service
from app.modules.atomic_concepts.schemas import AtomicConceptCreate, AtomicConceptRead, AtomicConceptUpdate

router = APIRouter(prefix="/atomic-concepts", tags=["atomic_concepts"])


@router.get("", response_model=list[AtomicConceptRead])
async def list_atomic_concepts(
    concept_id: str = Query(...),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> list[AtomicConceptRead]:
    try:
        parsed_id = UUID(concept_id)
    except ValueError:
        return []
    await assert_student_enrolled_in_concept(session, parsed_id, current_user)
    return await service.list_atomic_concepts(session, concept_id=parsed_id)


@router.post("", response_model=AtomicConceptRead, status_code=status.HTTP_201_CREATED)
async def create_atomic_concept(
    payload: AtomicConceptCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> AtomicConceptRead:
    await assert_owns_concept(session, payload.concept_id, current_user, action=AssistantAction.CREATE)
    return await service.create_atomic_concept(session, payload)


@router.patch("/{atomic_concept_id}", response_model=AtomicConceptRead)
async def update_atomic_concept(
    atomic_concept_id: UUID,
    payload: AtomicConceptUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> AtomicConceptRead:
    await assert_owns_atomic_concept(session, atomic_concept_id, current_user)
    atomic_concept = await service.update_atomic_concept(session, atomic_concept_id, payload)
    if atomic_concept is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Atomic concept not found")
    return atomic_concept


@router.delete("/{atomic_concept_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_atomic_concept(
    atomic_concept_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> None:
    await assert_owns_atomic_concept(session, atomic_concept_id, current_user, action=AssistantAction.DELETE)
    deleted = await service.delete_atomic_concept(session, atomic_concept_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Atomic concept not found")
