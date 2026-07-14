from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.user import User
from app.modules.ai_content.schemas import AIContentRequest, AIContentResponse
from app.modules.ai_content.service import generate_content, with_content_type
from app.modules.auth.dependencies import get_current_teacher

router = APIRouter(prefix="/ai-content", tags=["ai-content"])


@router.post("/lesson-outline", response_model=AIContentResponse)
async def lesson_outline(
    payload: AIContentRequest,
    session: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_teacher),
) -> AIContentResponse:
    return await generate_content(with_content_type(payload, "lesson_outline"), session)


@router.post("/lesson-notes", response_model=AIContentResponse)
async def lesson_notes(
    payload: AIContentRequest,
    session: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_teacher),
) -> AIContentResponse:
    return await generate_content(with_content_type(payload, "lesson_notes"), session)


@router.post("/quiz-questions", response_model=AIContentResponse)
async def quiz_questions(
    payload: AIContentRequest,
    session: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_teacher),
) -> AIContentResponse:
    return await generate_content(with_content_type(payload, "quiz_questions"), session)


@router.post("/homework", response_model=AIContentResponse)
async def homework(
    payload: AIContentRequest,
    session: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_teacher),
) -> AIContentResponse:
    return await generate_content(with_content_type(payload, "homework"), session)


@router.post("/flashcards", response_model=AIContentResponse)
async def flashcards(
    payload: AIContentRequest,
    session: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_teacher),
) -> AIContentResponse:
    return await generate_content(with_content_type(payload, "flashcards"), session)


@router.post("/revision-summary", response_model=AIContentResponse)
async def revision_summary(
    payload: AIContentRequest,
    session: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_teacher),
) -> AIContentResponse:
    return await generate_content(with_content_type(payload, "revision_summary"), session)


@router.post("/teacher-script", response_model=AIContentResponse)
async def teacher_script(
    payload: AIContentRequest,
    session: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_teacher),
) -> AIContentResponse:
    return await generate_content(with_content_type(payload, "teacher_script"), session)
