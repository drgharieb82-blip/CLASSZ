from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_can
from app.db.session import get_db_session
from app.models.user import Role, User
from app.modules.assistants.models import AssistantAction, AssistantResource
from app.modules.auth.dependencies import get_current_teacher, get_current_user
from app.modules.question_bank import service
from app.modules.question_bank.schemas import (
    QuestionCategoryCreate,
    QuestionCategoryRead,
    QuestionChoiceCreate,
    QuestionChoiceRead,
    QuestionCreate,
    QuestionMediaCreate,
    QuestionMediaRead,
    QuestionRead,
    QuestionTagAttach,
)

router = APIRouter(prefix="/questions", tags=["question_bank"])

# Roles that are trusted to see the correct-answer flag on a question's
# choices — everyone else (students included) gets it masked, since a
# student who can practice-fetch a question by id must never see the
# answer key outside the graded quiz_attempts/results flow.
_ANSWER_VISIBLE_ROLES = (Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN, Role.ASSISTANT)


def _mask_answers(question: QuestionRead) -> QuestionRead:
    for choice in question.choices:
        choice.is_correct = False
    return question


async def _scope_question(session: AsyncSession, question: QuestionRead, current_user: User) -> QuestionRead:
    """Applies both protections for a single question: hides `is_correct`
    from non-staff callers, and (for TEACHER/ASSISTANT — ADMIN/SUPER_ADMIN
    stay platform-wide) requires owning/being granted VIEW on the question's
    course when one is set."""
    if current_user.role in (Role.TEACHER, Role.ASSISTANT) and question.course_id is not None:
        await assert_can(
            session,
            current_user,
            question.course_id,
            AssistantResource.QUESTIONS,
            AssistantAction.VIEW,
            not_found_detail="Question not found",
        )
    if current_user.role not in _ANSWER_VISIBLE_ROLES:
        question = _mask_answers(question)
    return question


@router.get("/categories", response_model=list[QuestionCategoryRead])
async def list_categories(
    session: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_user),
) -> list[QuestionCategoryRead]:
    return await service.list_categories(session)


@router.post("/categories", response_model=QuestionCategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: QuestionCategoryCreate,
    session: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_teacher),
) -> QuestionCategoryRead:
    return await service.get_or_create_category(session, payload)


@router.get("", response_model=list[QuestionRead])
async def list_questions(
    limit: int | None = Query(default=None, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> list[QuestionRead]:
    questions = await service.list_questions(session)
    scoped: list[QuestionRead] = []
    for question in questions:
        read = QuestionRead.model_validate(question)
        if current_user.role in (Role.TEACHER, Role.ASSISTANT) and read.course_id is not None:
            # A non-owning teacher (or an assistant without VIEW granted)
            # simply doesn't see the question in the list (rather than
            # 403ing an entire list call over one bad row).
            try:
                await assert_can(
                    session,
                    current_user,
                    read.course_id,
                    AssistantResource.QUESTIONS,
                    AssistantAction.VIEW,
                    not_found_detail="Question not found",
                )
            except HTTPException:
                continue
        if current_user.role not in _ANSWER_VISIBLE_ROLES:
            read = _mask_answers(read)
        scoped.append(read)
    if limit is not None:
        return scoped[offset : offset + limit]
    if offset:
        return scoped[offset:]
    return scoped


@router.get("/{question_id}", response_model=QuestionRead)
async def get_question(
    question_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> QuestionRead:
    question = await service.get_question(session, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    read = QuestionRead.model_validate(question)
    return await _scope_question(session, read, current_user)


@router.post("", response_model=QuestionRead, status_code=status.HTTP_201_CREATED)
async def create_question(
    payload: QuestionCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> QuestionRead:
    if payload.course_id is not None:
        await assert_can(session, current_user, payload.course_id, AssistantResource.QUESTIONS, AssistantAction.CREATE)
    return await service.create_question(session, payload)


@router.post("/{question_id}/choices", response_model=QuestionChoiceRead, status_code=status.HTTP_201_CREATED)
async def add_question_choice(
    question_id: UUID,
    payload: QuestionChoiceCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> QuestionChoiceRead:
    question = await service.get_question(session, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    if question.course_id is not None:
        await assert_can(
            session, current_user, question.course_id, AssistantResource.QUESTIONS, AssistantAction.EDIT,
            not_found_detail="Question not found",
        )

    choice = await service.add_question_choice(session, question_id, payload)
    if choice is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    return choice


@router.post("/{question_id}/tags", response_model=QuestionRead)
async def add_question_tag(
    question_id: UUID,
    payload: QuestionTagAttach,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> QuestionRead:
    question = await service.get_question(session, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question or tag not found")
    if question.course_id is not None:
        await assert_can(
            session, current_user, question.course_id, AssistantResource.QUESTIONS, AssistantAction.EDIT,
            not_found_detail="Question or tag not found",
        )

    updated = await service.add_question_tag(session, question_id, payload)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question or tag not found")

    return updated


@router.get("/{question_id}/media", response_model=list[QuestionMediaRead])
async def list_question_media(
    question_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_user),
) -> list[QuestionMediaRead]:
    media = await service.list_question_media(session, question_id)
    if media is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    return media


@router.post("/{question_id}/media", response_model=QuestionMediaRead, status_code=status.HTTP_201_CREATED)
async def add_question_media(
    question_id: UUID,
    payload: QuestionMediaCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> QuestionMediaRead:
    question = await service.get_question(session, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    if question.course_id is not None:
        await assert_can(
            session, current_user, question.course_id, AssistantResource.QUESTIONS, AssistantAction.EDIT,
            not_found_detail="Question not found",
        )

    media = await service.add_question_media(session, question_id, payload)
    if media is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    return media


@router.delete("/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question_media(
    media_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_teacher),
) -> None:
    deleted = await service.delete_question_media(session, media_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question media not found")
