from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_student_enrolled_in_course
from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_student
from app.modules.student_question_bank.schemas import (
    StudentPracticeAnswerSubmit,
    StudentPracticeResultRead,
    StudentQuestionCourseRead,
    StudentQuestionRead,
    StudentWrongQuestionRead,
)
from app.modules.student_question_bank.service import (
    evaluate_student_question,
    get_student_question_course_id,
    list_student_question_courses,
    list_student_questions,
    list_student_wrong_questions,
)
from app.modules.student_memory.schemas import StudentQuestionBookmarkRead, StudentQuestionBookmarkUpdate
from app.modules.student_memory.service import toggle_student_question_bookmark

router = APIRouter(prefix="/student", tags=["student_question_bank"])


@router.get("/question-bank/courses", response_model=list[StudentQuestionCourseRead])
async def list_question_bank_courses(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> list[StudentQuestionCourseRead]:
    return await list_student_question_courses(session, current_user.id)


@router.get("/question-bank/questions", response_model=list[StudentQuestionRead])
async def list_question_bank_questions(
    course_id: UUID = Query(...),
    chapter_id: UUID | None = Query(default=None),
    lesson_id: UUID | None = Query(default=None),
    concept_id: UUID | None = Query(default=None),
    atomic_concept_id: UUID | None = Query(default=None),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> list[StudentQuestionRead]:
    await assert_student_enrolled_in_course(session, course_id, current_user)
    return await list_student_questions(
        session,
        current_user.id,
        course_id=course_id,
        chapter_id=chapter_id,
        lesson_id=lesson_id,
        concept_id=concept_id,
        atomic_concept_id=atomic_concept_id,
    )


@router.post("/question-bank/evaluate", response_model=StudentPracticeResultRead)
async def evaluate_question_bank_answer(
    payload: StudentPracticeAnswerSubmit,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentPracticeResultRead:
    course_id = await get_student_question_course_id(session, payload.question_id)
    if course_id is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    await assert_student_enrolled_in_course(
        session,
        course_id,
        current_user,
        not_found_detail="Question not found",
    )
    result = await evaluate_student_question(session, current_user.id, payload)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return result


@router.get("/wrong-questions", response_model=list[StudentWrongQuestionRead])
async def list_wrong_questions(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> list[StudentWrongQuestionRead]:
    return await list_student_wrong_questions(session, current_user.id)


@router.patch("/wrong-questions/{question_id}/bookmark", response_model=StudentQuestionBookmarkRead)
async def bookmark_wrong_question(
    question_id: UUID,
    payload: StudentQuestionBookmarkUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentQuestionBookmarkRead:
    course_id = await get_student_question_course_id(session, question_id)
    if course_id is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    await assert_student_enrolled_in_course(session, course_id, current_user, not_found_detail="Question not found")
    return await toggle_student_question_bookmark(session, current_user.id, question_id, payload)
