from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.ai_core.prompting import prompt_templates
from app.modules.ai_core.schemas import AICompletionRequest, AIMessage
from app.modules.ai_core.service import complete_with_ai
from app.modules.ai_core.structured_output import StructuredOutputError, require_keys
from app.modules.ai_teacher.schemas import AITeacherRequest, AITeacherResponse


def build_teacher_prompt(payload: AITeacherRequest, memory_context: str | None = None) -> str:
    context = payload.concept_context or "No concept engine context available."
    if memory_context:
        context = f"{context}\nStudent memory: {memory_context}"

    prompt = prompt_templates.render(
        "teacher.explain",
        concept=payload.concept,
        student_level=payload.student_level,
        language="Arabic" if payload.language == "ar" else "English",
        mode=payload.mode,
        context=context,
    )

    if payload.mode == "guided_hint":
        prompt += "\nGive a guiding hint. Do not reveal the final answer directly."
    if payload.question:
        prompt += f"\nStudent question: {payload.question}"
    if payload.student_answer:
        prompt += f"\nStudent answer: {payload.student_answer}"

    return prompt


def validate_teacher_payload(payload: dict[str, object], request: AITeacherRequest, fallback_used: bool) -> AITeacherResponse:
    try:
        require_keys(payload, {"title", "answer", "steps", "nextStep"})
        steps = payload["steps"] if isinstance(payload["steps"], list) else [str(payload["steps"])]
        answer = str(payload["answer"])
        if request.mode == "guided_hint" and "final answer is" in answer.lower():
            raise StructuredOutputError("Guided hint included a direct final answer.")

        return AITeacherResponse(
            title=str(payload["title"]),
            answer=answer,
            steps=[str(step) for step in steps],
            nextStep=str(payload["nextStep"]),
            language=request.language,
            mode=request.mode,
            fallbackUsed=fallback_used,
        )
    except StructuredOutputError:
        return AITeacherResponse(
            title=f"{request.concept} support",
            answer="Start from the core rule, connect it to one example, then test the idea with a short question.",
            steps=["Read the concept rule.", "Apply it to one small example.", "Check the answer against the rule."],
            nextStep="Solve one focused practice question.",
            language=request.language,
            mode=request.mode,
            fallbackUsed=True,
        )


async def teach(payload: AITeacherRequest, session: AsyncSession | None = None, memory_context: str | None = None) -> AITeacherResponse:
    prompt = build_teacher_prompt(payload, memory_context)
    response = await complete_with_ai(
        AICompletionRequest(
            feature=f"ai_teacher.{payload.mode}",
            messages=[
                AIMessage(role="system", content=prompt_templates.render("system.teacher")),
                AIMessage(role="user", content=prompt),
            ],
        ),
        session,
    )
    return validate_teacher_payload(response.structured, payload, response.fallback_used)
