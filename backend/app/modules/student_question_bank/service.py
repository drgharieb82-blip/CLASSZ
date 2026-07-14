from collections import defaultdict
from uuid import UUID

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.chapters.models import Chapter
from app.modules.concepts.models import Concept
from app.modules.courses.models import Course
from app.modules.enrollments.models import Enrollment
from app.modules.lessons.models import Lesson
from app.modules.question_bank.models import Question
from app.modules.quiz_attempts.models import QuizAttempt
from app.modules.quizzes.models import Quiz
from app.modules.results.models import QuestionResult, QuizResult
from app.modules.student_memory.models import StudentQuestionBookmark
from app.modules.student_question_bank.schemas import (
    StudentPracticeAnswerSubmit,
    StudentPracticeResultRead,
    StudentQuestionChapterRead,
    StudentQuestionConceptRead,
    StudentQuestionCourseRead,
    StudentQuestionLessonRead,
    StudentQuestionOptionRead,
    StudentQuestionRead,
    StudentWrongQuestionRead,
)


def _question_options():
    return (
        selectinload(Question.choices),
        selectinload(Question.chapters),
        selectinload(Question.lessons),
        selectinload(Question.concepts),
        selectinload(Question.atomic_concepts),
    )


async def list_student_question_courses(
    session: AsyncSession,
    student_id: UUID,
) -> list[StudentQuestionCourseRead]:
    enrollment_result = await session.execute(
        select(Enrollment).where(Enrollment.student_id == student_id).options(selectinload(Enrollment.course))
    )
    enrollments = list(enrollment_result.scalars().all())
    if not enrollments:
        return []

    course_ids = [enrollment.course_id for enrollment in enrollments]
    course_result = await session.execute(
        select(Course)
        .where(Course.id.in_(course_ids))
        .options(
            selectinload(Course.chapters)
            .selectinload(Chapter.lessons)
            .selectinload(Lesson.concepts),
        )
    )
    courses = {course.id: course for course in course_result.scalars().all()}

    question_result = await session.execute(
        select(Question)
        .where(Question.course_id.in_(course_ids), Question.is_active.is_(True))
        .options(*_question_options())
    )
    questions = list(question_result.scalars().all())

    solved_counts = await _load_solved_question_ids_by_course(session, student_id, course_ids)
    accuracy_counts = await _load_accuracy_counts_by_course(session, student_id, course_ids)
    quiz_counts = await _load_quiz_counts_by_course(session, course_ids)

    questions_by_course: dict[UUID, list[Question]] = defaultdict(list)
    for question in questions:
        if question.course_id is not None:
            questions_by_course[question.course_id].append(question)

    items: list[StudentQuestionCourseRead] = []
    for enrollment in enrollments:
        course = courses.get(enrollment.course_id) or enrollment.course
        if course is None:
            continue

        course_questions = questions_by_course.get(course.id, [])
        solved_question_ids = solved_counts.get(course.id, set())
        accuracy = accuracy_counts.get(course.id, {"correct": 0, "total": 0})
        items.append(
            StudentQuestionCourseRead(
                id=course.id,
                name=course.title,
                subject=course.subject,
                grade=course.grade,
                total_questions=len(course_questions),
                solved_questions=len(solved_question_ids),
                accuracy=_to_percentage(accuracy["correct"], accuracy["total"]),
                available_quizzes=quiz_counts.get(course.id, 0),
                chapters=_build_course_chapters(course, course_questions, solved_question_ids),
            )
        )
    return items


async def list_student_questions(
    session: AsyncSession,
    _student_id: UUID,
    *,
    course_id: UUID,
    chapter_id: UUID | None = None,
    lesson_id: UUID | None = None,
    concept_id: UUID | None = None,
    atomic_concept_id: UUID | None = None,
) -> list[StudentQuestionRead]:
    base_query: Select[tuple[Question]] = (
        select(Question)
        .where(
            Question.course_id == course_id,
            Question.is_active.is_(True),
        )
        .options(*_question_options())
        .order_by(Question.created_at.desc())
    )
    if chapter_id is not None:
        base_query = base_query.where(Question.chapters.any(id=chapter_id))
    if lesson_id is not None:
        base_query = base_query.where(Question.lessons.any(id=lesson_id))
    if concept_id is not None:
        base_query = base_query.where(Question.concepts.any(id=concept_id))
    if atomic_concept_id is not None:
        base_query = base_query.where(Question.atomic_concepts.any(id=atomic_concept_id))

    result = await session.execute(base_query)
    return [_to_student_question(question) for question in result.scalars().all()]


async def evaluate_student_question(
    session: AsyncSession,
    _student_id: UUID,
    payload: StudentPracticeAnswerSubmit,
) -> StudentPracticeResultRead | None:
    result = await session.execute(select(Question).where(Question.id == payload.question_id).options(*_question_options()))
    question = result.scalar_one_or_none()
    if question is None:
        return None

    earned_points, is_correct, pending_manual_review = _grade_practice_question(question, payload.answer_data)
    answer_data_json = question.answer_data_json or {}
    choice_ids = [str(choice.id) for choice in question.choices if choice.is_correct]
    choice_texts = [choice.choice_text for choice in question.choices if choice.is_correct]

    accepted_text_answers: list[str] = []
    if answer_data_json.get("kind") == "fill_blank":
        for blank in answer_data_json.get("blanks", []):
            accepted_text_answers.extend(
                [str(answer).strip() for answer in blank.get("acceptedAnswers", []) if str(answer).strip()]
            )
    elif answer_data_json.get("kind") == "short_answer":
        accepted_text_answers.extend(
            [str(answer).strip() for answer in answer_data_json.get("acceptedAnswers", []) if str(answer).strip()]
        )

    return StudentPracticeResultRead(
        question_id=question.id,
        is_correct=is_correct,
        pending_manual_review=pending_manual_review,
        earned_points=earned_points,
        max_points=question.points,
        explanation=question.explanation,
        correct_choice_ids=choice_ids,
        correct_choice_texts=choice_texts,
        accepted_text_answers=accepted_text_answers,
        correct_order_ids=[str(item) for item in answer_data_json.get("correctOrder", [])] if answer_data_json.get("kind") == "ordering" else [],
        correct_pairs=answer_data_json.get("correctPairs", []) if answer_data_json.get("kind") == "matching" else [],
    )


async def list_student_wrong_questions(
    session: AsyncSession,
    student_id: UUID,
) -> list[StudentWrongQuestionRead]:
    bookmarks_result = await session.execute(
        select(StudentQuestionBookmark.question_id)
        .where(
            StudentQuestionBookmark.student_id == student_id,
            StudentQuestionBookmark.is_bookmarked.is_(True),
        )
    )
    bookmarked_question_ids = {question_id for (question_id,) in bookmarks_result.all()}
    question_result_result = await session.execute(
        select(QuestionResult, QuizResult, Quiz, Question)
        .join(QuizResult, QuizResult.id == QuestionResult.quiz_result_id)
        .join(QuizAttempt, QuizAttempt.id == QuizResult.attempt_id)
        .join(Quiz, Quiz.id == QuizAttempt.quiz_id)
        .join(Question, Question.id == QuestionResult.question_id)
        .where(QuizAttempt.student_id == student_id)
        .options(
            selectinload(Question.choices),
            selectinload(Question.chapters),
            selectinload(Question.lessons),
            selectinload(Question.concepts),
            selectinload(Question.atomic_concepts),
        )
        .order_by(QuizResult.graded_at.desc())
    )
    rows = list(question_result_result.all())
    grouped: dict[UUID, list[tuple[QuestionResult, QuizResult, Quiz, Question]]] = defaultdict(list)
    for row in rows:
        question_result, quiz_result, quiz, question = row
        grouped[question.id].append((question_result, quiz_result, quiz, question))

    items: list[StudentWrongQuestionRead] = []
    for question_id, question_rows in grouped.items():
        latest_question_result, latest_quiz_result, latest_quiz, question = question_rows[0]
        wrong_entries = [entry for entry in question_rows if not entry[0].is_correct]
        if not wrong_entries:
            continue
        latest_attempt_is_correct = latest_question_result.is_correct
        retry_count = max(len(question_rows) - 1, 0)
        latest_wrong_quiz_result = wrong_entries[0][1]
        course_id = question.course_id or latest_quiz.course_id
        items.append(
            StudentWrongQuestionRead(
                question_id=question_id,
                course_id=course_id,
                course_name=(await _load_course_title(session, course_id)),
                subject_name=(await _load_course_subject(session, course_id)),
                chapter_titles=[chapter.title for chapter in question.chapters],
                lesson_titles=[lesson.title for lesson in question.lessons],
                concept_titles=[concept.title for concept in question.concepts],
                atomic_concept_titles=[atomic_concept.title for atomic_concept in question.atomic_concepts],
                difficulty=question.difficulty.value.title(),
                question=_to_student_question(question),
                wrong_count=len(wrong_entries),
                retry_count=retry_count,
                retry_corrected=latest_attempt_is_correct,
                last_wrong_at=latest_wrong_quiz_result.graded_at,
                bookmarked=question_id in bookmarked_question_ids,
            )
        )

    items.sort(key=lambda item: item.last_wrong_at, reverse=True)
    return items


def _build_course_chapters(course: Course, questions: list[Question], solved_question_ids: set[UUID]) -> list[StudentQuestionChapterRead]:
    question_ids_by_chapter: dict[UUID, set[UUID]] = defaultdict(set)
    question_ids_by_lesson: dict[UUID, set[UUID]] = defaultdict(set)
    question_ids_by_concept: dict[UUID, set[UUID]] = defaultdict(set)

    for question in questions:
        for chapter in question.chapters:
            question_ids_by_chapter[chapter.id].add(question.id)
        for lesson in question.lessons:
            question_ids_by_lesson[lesson.id].add(question.id)
        for concept in question.concepts:
            question_ids_by_concept[concept.id].add(question.id)

    chapter_items: list[StudentQuestionChapterRead] = []
    for chapter in course.chapters:
        chapter_question_ids = question_ids_by_chapter.get(chapter.id, set())
        solved_in_chapter = chapter_question_ids & solved_question_ids
        lessons = []
        for lesson in chapter.lessons:
            lesson_questions = question_ids_by_lesson.get(lesson.id, set())
            concepts = [
                StudentQuestionConceptRead(
                    id=concept.id,
                    name=concept.title,
                    question_count=len(question_ids_by_concept.get(concept.id, set())),
                )
                for concept in lesson.concepts
            ]
            lessons.append(StudentQuestionLessonRead(id=lesson.id, title=lesson.title, concepts=concepts))

        chapter_items.append(
            StudentQuestionChapterRead(
                id=chapter.id,
                title=chapter.title,
                lessons=lessons,
                total_questions=len(chapter_question_ids),
                solved_questions=len(solved_in_chapter),
                progress=_to_percentage(len(solved_in_chapter), len(chapter_question_ids)),
            )
        )
    return chapter_items


async def _load_solved_question_ids_by_course(
    session: AsyncSession,
    student_id: UUID,
    course_ids: list[UUID],
) -> dict[UUID, set[UUID]]:
    result = await session.execute(
        select(Question.course_id, QuestionResult.question_id)
        .join(QuestionResult, QuestionResult.question_id == Question.id)
        .join(QuizResult, QuizResult.id == QuestionResult.quiz_result_id)
        .join(QuizAttempt, QuizAttempt.id == QuizResult.attempt_id)
        .where(
            QuizAttempt.student_id == student_id,
            Question.course_id.in_(course_ids),
            QuestionResult.is_correct.is_(True),
        )
    )
    solved_by_course: dict[UUID, set[UUID]] = defaultdict(set)
    for course_id, question_id in result.all():
        if course_id is not None:
            solved_by_course[course_id].add(question_id)
    return solved_by_course


async def _load_accuracy_counts_by_course(
    session: AsyncSession,
    student_id: UUID,
    course_ids: list[UUID],
) -> dict[UUID, dict[str, int]]:
    result = await session.execute(
        select(Question.course_id, QuestionResult.is_correct, func.count(QuestionResult.id))
        .join(QuestionResult, QuestionResult.question_id == Question.id)
        .join(QuizResult, QuizResult.id == QuestionResult.quiz_result_id)
        .join(QuizAttempt, QuizAttempt.id == QuizResult.attempt_id)
        .where(
            QuizAttempt.student_id == student_id,
            Question.course_id.in_(course_ids),
        )
        .group_by(Question.course_id, QuestionResult.is_correct)
    )
    counts: dict[UUID, dict[str, int]] = defaultdict(lambda: {"correct": 0, "total": 0})
    for course_id, is_correct, count in result.all():
        if course_id is None:
            continue
        counts[course_id]["total"] += int(count)
        if is_correct:
            counts[course_id]["correct"] += int(count)
    return counts


async def _load_quiz_counts_by_course(session: AsyncSession, course_ids: list[UUID]) -> dict[UUID, int]:
    result = await session.execute(
        select(Quiz.course_id, func.count(Quiz.id))
        .where(Quiz.course_id.in_(course_ids), Quiz.is_published.is_(True))
        .group_by(Quiz.course_id)
    )
    return {course_id: int(count) for course_id, count in result.all()}


async def _load_course_title(session: AsyncSession, course_id: UUID | None) -> str:
    if course_id is None:
        return "Unassigned Course"
    result = await session.execute(select(Course.title).where(Course.id == course_id))
    return result.scalar_one_or_none() or "Untitled Course"


async def _load_course_subject(session: AsyncSession, course_id: UUID | None) -> str:
    if course_id is None:
        return "General"
    result = await session.execute(select(Course.subject).where(Course.id == course_id))
    return result.scalar_one_or_none() or "General"


def _to_percentage(correct: int, total: int) -> int:
    if total <= 0:
        return 0
    return int(round((correct / total) * 100))


def _to_student_question(question: Question) -> StudentQuestionRead:
    answer_data_json = question.answer_data_json or {}
    if isinstance(answer_data_json.get("choices"), list):
        options = [
            StudentQuestionOptionRead(
                id=str(choice.get("id", f"choice-{index}")),
                text=str(choice.get("text", "")).strip(),
            )
            for index, choice in enumerate(answer_data_json["choices"])
            if isinstance(choice, dict) and str(choice.get("text", "")).strip()
        ]
    else:
        options = [
            StudentQuestionOptionRead(id=str(choice.id), text=choice.choice_text)
            for choice in sorted(question.choices, key=lambda choice: choice.position)
        ]
    return StudentQuestionRead(
        id=question.id,
        course_id=question.course_id,
        title=question.title,
        question_type=question.question_type.value,
        difficulty=question.difficulty.value.title(),
        explanation=question.explanation,
        points=question.points,
        chapter_ids=[chapter.id for chapter in question.chapters],
        lesson_ids=[lesson.id for lesson in question.lessons],
        concept_ids=[concept.id for concept in question.concepts],
        atomic_concept_ids=[atomic_concept.id for atomic_concept in question.atomic_concepts],
        chapter_titles=[chapter.title for chapter in question.chapters],
        lesson_titles=[lesson.title for lesson in question.lessons],
        concept_titles=[concept.title for concept in question.concepts],
        atomic_concept_titles=[atomic_concept.title for atomic_concept in question.atomic_concepts],
        answer_data_json=answer_data_json,
        options=options,
    )


def _grade_practice_question(question: Question, answer_data: dict[str, object]) -> tuple[int, bool, bool]:
    answer_data_json = question.answer_data_json or {}
    kind = str(answer_data_json.get("kind", "")).lower()

    if kind == "mcq":
        correct_choice_id = str(answer_data_json.get("correctChoiceId", "")).strip()
        is_correct = str(answer_data.get("choice_id", "")).strip() == correct_choice_id
        return (question.points if is_correct else 0), is_correct, False

    if kind == "multi_select":
        correct_ids = {str(choice_id) for choice_id in answer_data_json.get("correctChoiceIds", [])}
        submitted_ids = {str(choice_id) for choice_id in answer_data.get("choice_ids", []) if isinstance(choice_id, str)}
        is_correct = submitted_ids == correct_ids
        return (question.points if is_correct else 0), is_correct, False

    if kind == "true_false":
        correct_value = bool(answer_data_json.get("correctBoolean", True))
        submitted_value = bool(answer_data.get("value"))
        is_correct = submitted_value == correct_value
        return (question.points if is_correct else 0), is_correct, False

    if kind == "fill_blank":
        submitted_texts = [
            _normalize_text(str(value))
            for value in answer_data.get("texts", [])
            if str(value).strip()
        ]
        if not submitted_texts:
            single_text = _normalize_text(str(answer_data.get("text", "")))
            if single_text:
                submitted_texts = [single_text]
        blanks = [blank for blank in answer_data_json.get("blanks", []) if isinstance(blank, dict)]
        if blanks and len(submitted_texts) == len(blanks):
            is_correct = all(
                submitted_texts[index] in {
                    _normalize_text(str(candidate))
                    for candidate in blank.get("acceptedAnswers", [])
                }
                for index, blank in enumerate(blanks)
            )
        else:
            accepted_answers = {
                _normalize_text(str(candidate))
                for blank in blanks
                for candidate in blank.get("acceptedAnswers", [])
            }
            is_correct = bool(submitted_texts) and all(text in accepted_answers for text in submitted_texts)
        return (question.points if is_correct else 0), is_correct, False

    if kind == "short_answer":
        submitted_text = _normalize_text(str(answer_data.get("text", "")))
        accepted_answers = {
            _normalize_text(str(candidate))
            for candidate in answer_data_json.get("acceptedAnswers", [])
        }
        is_correct = submitted_text in accepted_answers if accepted_answers else False
        return (question.points if is_correct else 0), is_correct, False

    if kind == "ordering":
        expected = [str(choice_id) for choice_id in answer_data_json.get("correctOrder", [])]
        submitted = [str(choice_id) for choice_id in answer_data.get("choice_ids", []) if isinstance(choice_id, str)]
        is_correct = submitted == expected
        return (question.points if is_correct else 0), is_correct, False

    if kind == "matching":
        expected_pairs = {
            f"{str(pair.get('leftId', ''))}:{str(pair.get('rightId', ''))}"
            for pair in answer_data_json.get("correctPairs", [])
            if isinstance(pair, dict)
        }
        submitted_pairs = {
            f"{str(pair.get('leftId', ''))}:{str(pair.get('rightId', ''))}"
            for pair in answer_data.get("pairs", [])
            if isinstance(pair, dict)
        }
        is_correct = submitted_pairs == expected_pairs and bool(expected_pairs)
        return (question.points if is_correct else 0), is_correct, False

    if question.question_type.value == "ESSAY":
        return 0, False, True

    correct_choice_ids = [choice.id for choice in question.choices if choice.is_correct]
    if question.question_type.value in {"MCQ", "TRUE_FALSE"}:
        submitted_choice_id = str(answer_data.get("choice_id", "")).strip()
        is_correct = len(correct_choice_ids) == 1 and submitted_choice_id == str(correct_choice_ids[0])
        return (question.points if is_correct else 0), is_correct, False

    if question.question_type.value == "MULTIPLE_SELECT":
        submitted_ids = {str(choice_id) for choice_id in answer_data.get("choice_ids", []) if isinstance(choice_id, str)}
        is_correct = submitted_ids == {str(choice_id) for choice_id in correct_choice_ids}
        return (question.points if is_correct else 0), is_correct, False

    return 0, False, question.question_type.value == "ESSAY"


def _normalize_text(value: str) -> str:
    return " ".join(value.strip().lower().split())


async def get_student_question_course_id(session: AsyncSession, question_id: UUID) -> UUID | None:
    result = await session.execute(select(Question.course_id).where(Question.id == question_id))
    return result.scalar_one_or_none()
