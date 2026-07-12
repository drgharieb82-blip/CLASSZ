from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.ai_content.schemas import AIContentRequest, AIContentResponse, ContentType

try:
    from app.modules.ai_core.prompting import prompt_templates
    from app.modules.ai_core.schemas import AICompletionRequest, AIMessage
    from app.modules.ai_core.service import complete_with_ai
except ModuleNotFoundError:
    prompt_templates = None
    AICompletionRequest = None
    AIMessage = None
    complete_with_ai = None


def fallback_items(payload: AIContentRequest) -> list[dict[str, object]]:
    return [
        {
            "title": f"{payload.topic} item {index + 1}",
            "description": f"Structured {payload.content_type.replace('_', ' ')} item for {payload.topic}.",
        }
        for index in range(max(1, payload.count))
    ]


def normalize_content_response(payload: AIContentRequest, structured: dict[str, object], fallback_used: bool) -> AIContentResponse:
    raw_items = structured.get("items")
    items = raw_items if isinstance(raw_items, list) else fallback_items(payload)

    return AIContentResponse(
        title=str(structured.get("title", f"{payload.topic} {payload.content_type.replace('_', ' ')}")),
        content_type=payload.content_type,
        items=[item if isinstance(item, dict) else {"description": str(item)} for item in items],
        summary=str(structured.get("summary", f"Generated {payload.content_type.replace('_', ' ')} for {payload.topic}.")),
        language=payload.language,
        fallback_used=fallback_used,
    )


async def generate_content(payload: AIContentRequest, session: AsyncSession | None = None) -> AIContentResponse:
    if prompt_templates is None or AICompletionRequest is None or AIMessage is None or complete_with_ai is None:
        return normalize_content_response(payload, {}, True)

    prompt = prompt_templates.render(
        "content.generate",
        content_type=payload.content_type.replace("_", " "),
        subject=payload.subject,
        grade=payload.grade,
        topic=payload.topic,
        language="Arabic" if payload.language == "ar" else "English",
    )
    prompt += f"\nDifficulty: {payload.difficulty}. Count: {payload.count}. Include an items array and summary."
    response = await complete_with_ai(
        AICompletionRequest(
            feature=f"ai_content.{payload.content_type}",
            messages=[
                AIMessage(role="system", content=prompt_templates.render("system.teacher")),
                AIMessage(role="user", content=prompt),
            ],
        ),
        session,
    )
    return normalize_content_response(payload, response.structured, response.fallback_used)


def with_content_type(payload: AIContentRequest, content_type: ContentType) -> AIContentRequest:
    return payload.model_copy(update={"content_type": content_type})
