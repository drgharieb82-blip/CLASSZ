from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.ai_core.models import AIRequestLog, AIRequestStatus
from app.modules.ai_core.schemas import AICompletionResponse


async def log_ai_request(
    session: AsyncSession | None,
    feature: str,
    response: AICompletionResponse | None,
    status: AIRequestStatus,
    error_message: str | None = None,
) -> AIRequestLog | None:
    if session is None:
        return None

    usage = response.usage if response else None
    log = AIRequestLog(
        feature=feature,
        provider=response.provider if response else "unknown",
        model=response.model if response else "unknown",
        status=status.value,
        prompt_tokens=usage.prompt_tokens if usage else 0,
        completion_tokens=usage.completion_tokens if usage else 0,
        total_tokens=usage.total_tokens if usage else 0,
        estimated_cost=usage.estimated_cost if usage else 0.0,
        success=status == AIRequestStatus.SUCCESS,
        error_message=error_message,
        metadata_json={"fallbackUsed": response.fallback_used} if response else {},
    )
    session.add(log)
    await session.commit()
    await session.refresh(log)
    return log


async def usage_summary(session: AsyncSession) -> dict[str, object]:
    result = await session.execute(
        select(
            AIRequestLog.feature,
            AIRequestLog.provider,
            AIRequestLog.model,
            func.count(AIRequestLog.id),
            func.sum(AIRequestLog.total_tokens),
            func.sum(AIRequestLog.estimated_cost),
        ).group_by(AIRequestLog.feature, AIRequestLog.provider, AIRequestLog.model)
    )

    return {
        "items": [
            {
                "feature": row[0],
                "provider": row[1],
                "model": row[2],
                "requestCount": row[3],
                "totalTokens": row[4] or 0,
                "estimatedCost": float(row[5] or 0),
            }
            for row in result.all()
        ]
    }
