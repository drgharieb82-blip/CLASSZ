from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.ai_core import repository, service
from app.modules.ai_core.schemas import AICompletionRequest, AICompletionResponse

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/complete", response_model=AICompletionResponse)
async def complete(
    payload: AICompletionRequest,
    session: AsyncSession = Depends(get_db_session),
) -> AICompletionResponse:
    return await service.complete_with_ai(payload, session)


@router.get("/usage-summary")
async def usage_summary(session: AsyncSession = Depends(get_db_session)) -> dict[str, object]:
    return await repository.usage_summary(session)
