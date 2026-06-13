from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.modules.ai_core.models import AIRequestStatus
from app.modules.ai_core.providers import MockAIProvider, get_ai_provider
from app.modules.ai_core.repository import log_ai_request
from app.modules.ai_core.schemas import AICompletionRequest, AICompletionResponse


async def complete_with_ai(
    request: AICompletionRequest,
    session: AsyncSession | None = None,
) -> AICompletionResponse:
    provider = get_ai_provider()

    for attempt in range(settings.ai_max_retries + 1):
        try:
            response = await provider.complete(request)
            await log_ai_request(session, request.feature, response, AIRequestStatus.SUCCESS)
            return response
        except Exception as exc:
            if attempt >= settings.ai_max_retries:
                fallback = await MockAIProvider().complete(request)
                fallback.fallback_used = True
                await log_ai_request(session, request.feature, fallback, AIRequestStatus.FALLBACK, str(exc))
                return fallback

    fallback = await MockAIProvider().complete(request)
    fallback.fallback_used = True
    return fallback
