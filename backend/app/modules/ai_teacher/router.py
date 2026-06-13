from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.ai_teacher.schemas import AITeacherRequest, AITeacherResponse
from app.modules.ai_teacher.service import teach

router = APIRouter(prefix="/ai-teacher", tags=["ai-teacher"])


@router.post("/explain-concept", response_model=AITeacherResponse, response_model_by_alias=True)
async def explain_concept(payload: AITeacherRequest, session: AsyncSession = Depends(get_db_session)) -> AITeacherResponse:
    return await teach(payload, session)


@router.post("/simplify", response_model=AITeacherResponse, response_model_by_alias=True)
async def simplify(payload: AITeacherRequest, session: AsyncSession = Depends(get_db_session)) -> AITeacherResponse:
    return await teach(payload.model_copy(update={"mode": "direct_explanation"}), session)


@router.post("/examples", response_model=AITeacherResponse, response_model_by_alias=True)
async def generate_examples(payload: AITeacherRequest, session: AsyncSession = Depends(get_db_session)) -> AITeacherResponse:
    return await teach(payload.model_copy(update={"mode": "exam_preparation"}), session)


@router.post("/hint", response_model=AITeacherResponse, response_model_by_alias=True)
async def generate_hint(payload: AITeacherRequest, session: AsyncSession = Depends(get_db_session)) -> AITeacherResponse:
    return await teach(payload.model_copy(update={"mode": "guided_hint"}), session)


@router.post("/answer-question", response_model=AITeacherResponse, response_model_by_alias=True)
async def answer_student_question(payload: AITeacherRequest, session: AsyncSession = Depends(get_db_session)) -> AITeacherResponse:
    return await teach(payload, session)


@router.post("/adaptive-explanation", response_model=AITeacherResponse, response_model_by_alias=True)
async def adaptive_explanation(payload: AITeacherRequest, session: AsyncSession = Depends(get_db_session)) -> AITeacherResponse:
    return await teach(payload, session)
