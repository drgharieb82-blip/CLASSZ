from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.results import service
from app.modules.results.schemas import QuizResultRead

router = APIRouter(prefix="/results", tags=["results"])


@router.post("/grade/{attempt_id}", response_model=QuizResultRead)
async def grade_attempt(
    attempt_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> QuizResultRead:
    result = await service.grade_attempt(session, attempt_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")

    return result


@router.get("/{attempt_id}", response_model=QuizResultRead)
async def get_result(
    attempt_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> QuizResultRead:
    result = await service.get_result_by_attempt(session, attempt_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz result not found")

    return result
