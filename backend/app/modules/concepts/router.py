from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.concepts import service
from app.modules.concepts.schemas import ConceptCreate, ConceptRead

router = APIRouter(prefix="/concepts", tags=["concepts"])


@router.get("", response_model=list[ConceptRead])
async def list_concepts(
    lesson_id: str = Query(...),
    session: AsyncSession = Depends(get_db_session),
) -> list[ConceptRead]:
    try:
        parsed_id = UUID(lesson_id)
    except ValueError:
        return []
    return await service.list_concepts(session, lesson_id=parsed_id)


@router.post("", response_model=ConceptRead, status_code=status.HTTP_201_CREATED)
async def create_concept(
    payload: ConceptCreate,
    session: AsyncSession = Depends(get_db_session),
) -> ConceptRead:
    return await service.create_concept(session, payload)
