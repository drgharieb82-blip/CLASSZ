from decimal import Decimal
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import migrations  # noqa: F401
from app.modules.question_bank.models import Question, QuestionType
from app.modules.quiz_attempts.models import QuizAnswer, QuizAttempt
from app.modules.quizzes.models import Quiz, QuizQuestion
from app.modules.results.models import QuestionResult, QuizResult


def _question_full_options(base):
    """Every path in this module that nests a full QuestionRead must eager-load
    all relationships QuestionRead serializes — chapters/lessons/concepts/
    atomic_concepts included — or FastAPI's response serialization crashes
    with a MissingGreenlet error on any lazy access outside the request's
    async context."""
    return (
        base.selectinload(Question.choices),
        base.selectinload(Question.media),
        base.selectinload(Question.tags),
        base.selectinload(Question.category),
        base.selectinload(Question.chapters),
        base.selectinload(Question.lessons),
        base.selectinload(Question.concepts),
        base.selectinload(Question.atomic_concepts),
    )


def _result_options():
    return (
        *_question_full_options(selectinload(QuizResult.question_results).selectinload(QuestionResult.question)),
        selectinload(QuizResult.attempt).selectinload(QuizAttempt.answers),
        *_question_full_options(
            selectinload(QuizResult.attempt)
            .selectinload(QuizAttempt.quiz)
            .selectinload(Quiz.questions)
            .selectinload(QuizQuestion.question)
        ),
    )


def _attempt_options():
    return (
        selectinload(QuizAttempt.answers),
        *_question_full_options(
            selectinload(QuizAttempt.quiz).selectinload(Quiz.questions).selectinload(QuizQuestion.question)
        ),
    )


async def get_result_by_attempt(
    session: AsyncSession,
    attempt_id: UUID,
    student_id: UUID | None = None,
) -> QuizResult | None:
    query = select(QuizResult).where(QuizResult.attempt_id == attempt_id)
    if student_id is not None:
        query = query.join(QuizAttempt, QuizAttempt.id == QuizResult.attempt_id).where(
            QuizAttempt.student_id == student_id,
        )

    result = await session.execute(query.options(*_result_options()))
    return result.scalar_one_or_none()


async def grade_attempt(session: AsyncSession, attempt_id: UUID) -> QuizResult | None:
    attempt_result = await session.execute(
        select(QuizAttempt)
        .where(QuizAttempt.id == attempt_id)
        .options(*_attempt_options())
    )
    attempt = attempt_result.scalar_one_or_none()
    if attempt is None or attempt.quiz is None:
        return None

    existing_result = await get_result_by_attempt(session, attempt_id)
    if existing_result is not None:
        await session.execute(delete(QuestionResult).where(QuestionResult.quiz_result_id == existing_result.id))
        await session.delete(existing_result)
        await session.flush()

    answer_by_question_id = {answer.question_id: answer for answer in attempt.answers}
    quiz_questions = sorted(attempt.quiz.questions, key=lambda item: item.position)
    max_score = sum(item.points for item in quiz_questions)

    quiz_result = QuizResult(
        attempt_id=attempt_id,
        score=0,
        max_score=max_score,
        percentage=Decimal("0.00"),
        passed=False,
    )
    session.add(quiz_result)
    await session.flush()

    score = 0
    for quiz_question in quiz_questions:
        question = quiz_question.question
        if question is None:
            continue

        answer = answer_by_question_id.get(question.id)
        earned_points, is_correct, pending_manual_review = _grade_question(question, answer, quiz_question.points)
        score += earned_points
        session.add(
            QuestionResult(
                quiz_result_id=quiz_result.id,
                question_id=question.id,
                earned_points=earned_points,
                max_points=quiz_question.points,
                is_correct=is_correct,
                pending_manual_review=pending_manual_review,
            )
        )

    percentage = round((score / max_score) * 100, 2) if max_score else 0
    quiz_result.score = score
    quiz_result.percentage = Decimal(str(percentage))
    quiz_result.passed = percentage >= attempt.quiz.passing_score

    await session.commit()
    return await get_result_by_attempt(session, attempt_id)


def _grade_question(question: Question, answer: QuizAnswer | None, max_points: int) -> tuple[int, bool, bool]:
    if question.question_type == QuestionType.ESSAY:
        return 0, False, True

    if answer is None:
        return 0, False, False

    answer_data = answer.answer_data or {}
    correct_choice_ids = [str(choice.id) for choice in question.choices if choice.is_correct]

    is_correct = False
    if question.question_type in {QuestionType.MCQ, QuestionType.TRUE_FALSE}:
        is_correct = str(answer_data.get("choice_id", "")) in set(correct_choice_ids) and len(correct_choice_ids) == 1
    elif question.question_type == QuestionType.MULTIPLE_SELECT:
        submitted_ids = {str(choice_id) for choice_id in answer_data.get("choice_ids", []) if isinstance(choice_id, str)}
        is_correct = submitted_ids == set(correct_choice_ids)
    elif question.question_type == QuestionType.FILL_BLANK:
        submitted_text = _normalize_text(str(answer_data.get("text", "")))
        correct_texts = {_normalize_text(choice.choice_text) for choice in question.choices if choice.is_correct}
        is_correct = submitted_text in correct_texts
    elif question.question_type in {QuestionType.MATCHING, QuestionType.ORDERING}:
        submitted_order = [str(choice_id) for choice_id in answer_data.get("choice_ids", []) if isinstance(choice_id, str)]
        expected_choices = [choice for choice in question.choices if choice.is_correct] or list(question.choices)
        expected_order = [str(choice.id) for choice in sorted(expected_choices, key=lambda choice: choice.position)]
        is_correct = submitted_order == expected_order

    return (max_points if is_correct else 0), is_correct, False


def _normalize_text(value: str) -> str:
    return " ".join(value.strip().lower().split())
