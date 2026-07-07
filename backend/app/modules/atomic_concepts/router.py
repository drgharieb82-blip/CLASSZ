from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.atomic_concepts import service
from app.modules.atomic_concepts.schemas import AtomicConceptCreate, AtomicConceptRead

router = APIRouter(prefix="/atomic-concepts", tags=["atomic_concepts"])


@router.get("", response_model=list[AtomicConceptRead])
async def list_atomic_concepts(
    concept_id: str = Query(...),
    session: AsyncSession = Depends(get_db_session),
) -> list[AtomicConceptRead]:
    try:
        parsed_id = UUID(concept_id)
    except ValueError:
        return []
    return await service.list_atomic_concepts(session, concept_id=parsed_id)


@router.post("", response_model=AtomicConceptRead, status_code=status.HTTP_201_CREATED)
async def create_atomic_concept(
    payload: AtomicConceptCreate,
    session: AsyncSession = Depends(get_db_session),
) -> AtomicConceptRead:
    return await service.create_atomic_concept(session, payload)
