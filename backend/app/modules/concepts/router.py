from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_owns_concept, assert_owns_lesson, assert_student_enrolled_in_lesson
from app.modules.assistants.models import AssistantAction
from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_teacher, get_current_user
from app.modules.concepts import service
from app.modules.concepts.schemas import ConceptCreate, ConceptRead, ConceptUpdate

router = APIRouter(prefix="/concepts", tags=["concepts"])


@router.get("", response_model=list[ConceptRead])
async def list_concepts(
    lesson_id: str = Query(...),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> list[ConceptRead]:
    try:
        parsed_id = UUID(lesson_id)
    except ValueError:
        return []
    await assert_student_enrolled_in_lesson(session, parsed_id, current_user)
    return await service.list_concepts(session, lesson_id=parsed_id)


@router.post("", response_model=ConceptRead, status_code=status.HTTP_201_CREATED)
async def create_concept(
    payload: ConceptCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> ConceptRead:
    await assert_owns_lesson(session, payload.lesson_id, current_user, action=AssistantAction.CREATE)
    return await service.create_concept(session, payload)


@router.patch("/{concept_id}", response_model=ConceptRead)
async def update_concept(
    concept_id: UUID,
    payload: ConceptUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> ConceptRead:
    await assert_owns_concept(session, concept_id, current_user)
    concept = await service.update_concept(session, concept_id, payload)
    if concept is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Concept not found")
    return concept


@router.delete("/{concept_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_concept(
    concept_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> None:
    await assert_owns_concept(session, concept_id, current_user, action=AssistantAction.DELETE)
    deleted = await service.delete_concept(session, concept_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Concept not found")
