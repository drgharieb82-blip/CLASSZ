from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import migrations  # noqa: F401
from app.modules.assignments.models import AssignmentSubmission
from app.modules.grading.models import GradeStatus, ManualGrade
from app.modules.question_bank.models import Question, QuestionType
from app.modules.quiz_attempts.models import QuizAttempt
from app.modules.quizzes.models import Quiz
from app.modules.results.models import QuestionResult, QuizResult
from app.modules.grading.schemas import ManualGradeAction, ManualGradeReturn


def _manual_grade_options():
    return (
        selectinload(ManualGrade.assignment_submission).selectinload(AssignmentSubmission.files),
        selectinload(ManualGrade.assignment_submission).selectinload(AssignmentSubmission.assignment),
        selectinload(ManualGrade.question_result).selectinload(QuestionResult.question).selectinload(Question.choices),
        selectinload(ManualGrade.question_result).selectinload(QuestionResult.question).selectinload(Question.media),
        selectinload(ManualGrade.question_result).selectinload(QuestionResult.question).selectinload(Question.tags),
        selectinload(ManualGrade.question_result).selectinload(QuestionResult.question).selectinload(Question.category),
        selectinload(ManualGrade.question_result).selectinload(QuestionResult.question).selectinload(Question.chapters),
        selectinload(ManualGrade.question_result).selectinload(QuestionResult.question).selectinload(Question.lessons),
        selectinload(ManualGrade.question_result).selectinload(QuestionResult.question).selectinload(Question.concepts),
        selectinload(ManualGrade.question_result)
        .selectinload(QuestionResult.question)
        .selectinload(Question.atomic_concepts),
        selectinload(ManualGrade.question_result)
        .selectinload(QuestionResult.quiz_result)
        .selectinload(QuizResult.attempt)
        .selectinload(QuizAttempt.answers),
        selectinload(ManualGrade.question_result)
        .selectinload(QuestionResult.quiz_result)
        .selectinload(QuizResult.attempt)
        .selectinload(QuizAttempt.quiz),
    )


async def list_pending_grades(session: AsyncSession) -> list[ManualGrade]:
    await _ensure_pending_manual_grades(session)
    result = await session.execute(
        select(ManualGrade)
        .where(ManualGrade.status == GradeStatus.PENDING)
        .options(*_manual_grade_options())
        .order_by(ManualGrade.id.desc())
    )
    grades = list(result.scalars().all())
    _attach_student_answers(grades)
    return grades


async def list_all_grades(session: AsyncSession) -> list[ManualGrade]:
    await _ensure_pending_manual_grades(session)
    result = await session.execute(
        select(ManualGrade)
        .options(*_manual_grade_options())
        .order_by(ManualGrade.id.desc())
    )
    grades = list(result.scalars().all())
    _attach_student_answers(grades)
    return grades


async def get_manual_grade(session: AsyncSession, grade_id: UUID) -> ManualGrade | None:
    await _ensure_pending_manual_grades(session)
    result = await session.execute(
        select(ManualGrade)
        .where(ManualGrade.id == grade_id)
        .options(*_manual_grade_options())
    )
    grade = result.scalar_one_or_none()
    if grade is not None:
        _attach_student_answers([grade])
    return grade


async def grade_manual_grade(
    session: AsyncSession,
    grade_id: UUID,
    payload: ManualGradeAction,
) -> ManualGrade | None:
    grade = await get_manual_grade(session, grade_id)
    if grade is None:
        return None

    grade.grader_id = payload.grader_id
    grade.score = min(payload.score, grade.max_score)
    grade.feedback = payload.feedback
    grade.status = GradeStatus.GRADED
    grade.graded_at = datetime.now(UTC)

    if grade.question_result is not None:
        grade.question_result.earned_points = grade.score
        grade.question_result.is_correct = grade.score >= grade.question_result.max_points
        grade.question_result.pending_manual_review = False
        await _recalculate_quiz_result(session, grade.question_result.quiz_result)

    await session.commit()
    return await get_manual_grade(session, grade_id)


async def return_manual_grade(
    session: AsyncSession,
    grade_id: UUID,
    payload: ManualGradeReturn,
) -> ManualGrade | None:
    grade = await get_manual_grade(session, grade_id)
    if grade is None:
        return None

    grade.grader_id = payload.grader_id
    grade.feedback = payload.feedback
    grade.status = GradeStatus.RETURNED
    grade.graded_at = datetime.now(UTC)

    await session.commit()
    return await get_manual_grade(session, grade_id)


async def _ensure_pending_manual_grades(session: AsyncSession) -> None:
    await _ensure_pending_essay_grades(session)
    await _ensure_pending_assignment_grades(session)
    await session.commit()


async def _ensure_pending_essay_grades(session: AsyncSession) -> None:
    result = await session.execute(
        select(QuestionResult)
        .where(QuestionResult.pending_manual_review.is_(True))
        .options(
            selectinload(QuestionResult.question),
            selectinload(QuestionResult.quiz_result).selectinload(QuizResult.attempt),
        )
    )
    question_results = list(result.scalars().all())

    for question_result in question_results:
        if question_result.question is None or question_result.question.question_type != QuestionType.ESSAY:
            continue

        existing = await session.execute(
            select(ManualGrade.id).where(ManualGrade.question_result_id == question_result.id)
        )
        if existing.scalar_one_or_none() is not None:
            continue

        student_id = question_result.quiz_result.attempt.student_id
        session.add(
            ManualGrade(
                student_id=student_id,
                question_result_id=question_result.id,
                max_score=question_result.max_points,
                status=GradeStatus.PENDING,
            )
        )


async def _ensure_pending_assignment_grades(session: AsyncSession) -> None:
    result = await session.execute(
        select(AssignmentSubmission).options(selectinload(AssignmentSubmission.assignment))
    )
    submissions = list(result.scalars().all())

    for submission in submissions:
        existing = await session.execute(
            select(ManualGrade.id).where(ManualGrade.assignment_submission_id == submission.id)
        )
        if existing.scalar_one_or_none() is not None:
            continue

        session.add(
            ManualGrade(
                student_id=submission.student_id,
                assignment_submission_id=submission.id,
                max_score=submission.assignment.max_points if submission.assignment is not None else 0,
                status=GradeStatus.PENDING,
            )
        )


async def _recalculate_quiz_result(session: AsyncSession, quiz_result: QuizResult | None) -> None:
    if quiz_result is None:
        return

    result = await session.execute(
        select(QuizResult)
        .where(QuizResult.id == quiz_result.id)
        .options(
            selectinload(QuizResult.question_results),
            selectinload(QuizResult.attempt).selectinload(QuizAttempt.quiz),
        )
    )
    refreshed = result.scalar_one_or_none()
    if refreshed is None:
        return

    refreshed.score = sum(item.earned_points for item in refreshed.question_results)
    refreshed.max_score = sum(item.max_points for item in refreshed.question_results)
    percentage = round((refreshed.score / refreshed.max_score) * 100, 2) if refreshed.max_score else 0
    refreshed.percentage = Decimal(str(percentage))
    quiz: Quiz | None = refreshed.attempt.quiz if refreshed.attempt is not None else None
    refreshed.passed = percentage >= quiz.passing_score if quiz is not None else False


def resolve_grade_course_id(grade: ManualGrade) -> UUID | None:
    """Resolves the course a `ManualGrade` belongs to, via whichever source
    it was created from (assignment submission or quiz question result).
    Requires `_manual_grade_options()` eager-loads to already be applied —
    does not issue additional queries."""
    if grade.assignment_submission is not None and grade.assignment_submission.assignment is not None:
        return grade.assignment_submission.assignment.course_id
    if grade.question_result is not None and grade.question_result.quiz_result is not None:
        attempt = grade.question_result.quiz_result.attempt
        if attempt is not None and attempt.quiz is not None:
            return attempt.quiz.course_id
    return None


def _attach_student_answers(grades: list[ManualGrade]) -> None:
    for grade in grades:
        question_result = grade.question_result
        if question_result is None or question_result.quiz_result is None:
            grade.student_answer = None
            continue

        attempt = question_result.quiz_result.attempt
        answer = next(
            (item for item in attempt.answers if item.question_id == question_result.question_id),
            None,
        ) if attempt is not None else None
        grade.student_answer = answer.answer_data if answer is not None else None
