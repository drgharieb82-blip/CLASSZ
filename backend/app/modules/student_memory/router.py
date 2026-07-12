from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_student
from app.modules.student_memory.schemas import (
    StudentAssistantContextRead,
    StudentNoteCreate,
    StudentNoteRead,
    StudentNoteUpdate,
    StudentQuestionBookmarkRead,
    StudentQuestionBookmarkUpdate,
    StudentRevisionSummaryRead,
)
from app.modules.student_memory.service import (
    create_student_note,
    delete_student_note,
    get_student_assistant_context,
    list_student_notes,
    list_student_revision_summary,
    toggle_student_question_bookmark,
    update_student_note,
)
from app.modules.student_question_bank.service import get_student_question_course_id
from app.core.ownership import assert_student_enrolled_in_course

router = APIRouter(prefix="/student/me", tags=["student_memory"])


@router.get("/notes", response_model=list[StudentNoteRead])
async def get_notes(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> list[StudentNoteRead]:
    return await list_student_notes(session, current_user.id)


@router.post("/notes", response_model=StudentNoteRead, status_code=status.HTTP_201_CREATED)
async def post_note(
    payload: StudentNoteCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentNoteRead:
    return await create_student_note(session, current_user.id, payload)


@router.patch("/notes/{note_id}", response_model=StudentNoteRead)
async def patch_note(
    note_id: UUID,
    payload: StudentNoteUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentNoteRead:
    note = await update_student_note(session, current_user.id, note_id, payload)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_note(
    note_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> None:
    deleted = await delete_student_note(session, current_user.id, note_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")


@router.get("/revision", response_model=StudentRevisionSummaryRead)
async def get_revision_plan(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentRevisionSummaryRead:
    return await list_student_revision_summary(session, current_user.id)


@router.get("/assistant-context", response_model=StudentAssistantContextRead)
async def get_assistant_context(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentAssistantContextRead:
    return await get_student_assistant_context(session, current_user.id)


@router.patch("/wrong-questions/{question_id}/bookmark", response_model=StudentQuestionBookmarkRead)
async def set_question_bookmark(
    question_id: UUID,
    payload: StudentQuestionBookmarkUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentQuestionBookmarkRead:
    course_id = await get_student_question_course_id(session, question_id)
    if course_id is not None:
        await assert_student_enrolled_in_course(session, course_id, current_user, not_found_detail="Question not found")
    return await toggle_student_question_bookmark(session, current_user.id, question_id, payload)
