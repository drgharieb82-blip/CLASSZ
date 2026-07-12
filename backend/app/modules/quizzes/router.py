from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_can, assert_owns_quiz
from app.db.session import get_db_session
from app.models.user import Role, User
from app.modules.assistants.models import AssistantAction, AssistantResource
from app.modules.auth.dependencies import get_current_teacher, get_current_user
from app.modules.quizzes import service
from app.modules.quizzes.schemas import QuizCreate, QuizQuestionCreate, QuizQuestionRead, QuizRead

router = APIRouter(prefix="/quizzes", tags=["quizzes"])

# Same trusted-role list as question_bank — see that module for rationale.
_ANSWER_VISIBLE_ROLES = (Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN, Role.ASSISTANT)


def _mask_answers(quiz: QuizRead) -> QuizRead:
    for quiz_question in quiz.questions:
        if quiz_question.question is None:
            continue
        for choice in quiz_question.question.choices:
            choice.is_correct = False
    return quiz


@router.get("", response_model=list[QuizRead])
async def list_quizzes(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> list[QuizRead]:
    quizzes = await service.list_quizzes(session)
    scoped: list[QuizRead] = []
    for quiz in quizzes:
        read = QuizRead.model_validate(quiz)
        if current_user.role in (Role.TEACHER, Role.ASSISTANT):
            try:
                await assert_can(
                    session, current_user, read.course_id, AssistantResource.QUIZZES, AssistantAction.VIEW,
                    not_found_detail="Quiz not found",
                )
            except HTTPException:
                continue
        if current_user.role not in _ANSWER_VISIBLE_ROLES:
            read = _mask_answers(read)
        scoped.append(read)
    return scoped


@router.get("/{quiz_id}", response_model=QuizRead)
async def get_quiz(
    quiz_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> QuizRead:
    quiz = await service.get_quiz(session, quiz_id)
    if quiz is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    read = QuizRead.model_validate(quiz)
    if current_user.role in (Role.TEACHER, Role.ASSISTANT):
        await assert_can(
            session, current_user, read.course_id, AssistantResource.QUIZZES, AssistantAction.VIEW,
            not_found_detail="Quiz not found",
        )
    if current_user.role not in _ANSWER_VISIBLE_ROLES:
        read = _mask_answers(read)
    return read


@router.post("", response_model=QuizRead, status_code=status.HTTP_201_CREATED)
async def create_quiz(
    payload: QuizCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> QuizRead:
    await assert_can(session, current_user, payload.course_id, AssistantResource.QUIZZES, AssistantAction.CREATE)
    return await service.create_quiz(session, payload)


@router.post("/{quiz_id}/questions", response_model=QuizQuestionRead, status_code=status.HTTP_201_CREATED)
async def add_quiz_question(
    quiz_id: UUID,
    payload: QuizQuestionCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> QuizQuestionRead:
    await assert_owns_quiz(session, quiz_id, current_user)
    quiz_question = await service.add_quiz_question(session, quiz_id, payload)
    if quiz_question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    return quiz_question
