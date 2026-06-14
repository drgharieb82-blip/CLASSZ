import asyncio
import uuid

from sqlalchemy import select

from app.core.security import hash_password
from app.db import migrations as _models  # noqa: F401
from app.db.session import AsyncSessionLocal
from app.models.user import Role, User
from app.modules.chapters.models import Chapter
from app.modules.concepts.models import Concept
from app.modules.courses.models import Course
from app.modules.lessons.models import Lesson
from app.modules.question_bank.models import Difficulty, Question, QuestionCategory, QuestionType
from app.modules.question_bank.schemas import QuestionChoiceCreate, QuestionCreate
from app.modules.question_bank.service import create_question

PHASE8_TEACHER_ID = uuid.UUID("88888888-8888-8888-8888-888888888888")


async def get_or_create_teacher_user() -> User:
    async with AsyncSessionLocal() as session:
        user = await session.get(User, PHASE8_TEACHER_ID)
        if user is not None:
            return user

        user = User(
            id=PHASE8_TEACHER_ID,
            email="phase8.chemistry.teacher@classz.local",
            full_name="Phase 8 Chemistry Teacher",
            hashed_password=hash_password("Classz123!"),
            role=Role.TEACHER,
            is_active=True,
        )
        session.add(user)
        await session.commit()
        return user


async def get_or_create_category(session, name: str) -> QuestionCategory:
    result = await session.execute(select(QuestionCategory).where(QuestionCategory.name == name))
    category = result.scalar_one_or_none()
    if category is not None:
        return category

    category = QuestionCategory(name=name, description="Grade 12 Chemistry production question bank")
    session.add(category)
    await session.flush()
    return category


async def get_or_create_course(session) -> Course:
    result = await session.execute(select(Course).where(Course.slug == "grade-12-chemistry-phase8"))
    course = result.scalar_one_or_none()
    if course is not None:
        return course

    course = Course(
        title="Grade 12 Chemistry",
        slug="grade-12-chemistry-phase8",
        description="Production content pipeline sample course for Phase 8.",
        subject="Chemistry",
        grade="Grade 12",
        teacher_id=PHASE8_TEACHER_ID,
        is_published=True,
    )
    session.add(course)
    await session.flush()
    return course


async def get_or_create_chapter(session, course: Course, title: str, position: int) -> Chapter:
    result = await session.execute(select(Chapter).where(Chapter.course_id == course.id, Chapter.position == position))
    chapter = result.scalar_one_or_none()
    if chapter is not None:
        return chapter

    chapter = Chapter(course_id=course.id, title=title, position=position)
    session.add(chapter)
    await session.flush()
    return chapter


async def get_or_create_lesson(session, chapter: Chapter, title: str, position: int) -> Lesson:
    result = await session.execute(select(Lesson).where(Lesson.chapter_id == chapter.id, Lesson.position == position))
    lesson = result.scalar_one_or_none()
    if lesson is not None:
        return lesson

    lesson = Lesson(chapter_id=chapter.id, title=title, description=f"{title} concept practice", position=position)
    session.add(lesson)
    await session.flush()
    return lesson


async def get_or_create_concept(session, course: Course, lesson: Lesson, name: str, slug: str, difficulty: int) -> Concept:
    result = await session.execute(select(Concept).where(Concept.slug == slug))
    concept = result.scalar_one_or_none()
    if concept is not None:
        if concept.course_id is None:
            concept.course_id = course.id
        if concept.lesson_id is None:
            concept.lesson_id = lesson.id
        concept.subject = "Chemistry"
        return concept

    concept = Concept(
        course_id=course.id,
        lesson_id=lesson.id,
        name=name,
        slug=slug,
        subject="Chemistry",
        description=f"Atomic concept for {name}.",
        difficulty_level=difficulty,
    )
    session.add(concept)
    await session.flush()
    return concept


def build_questions() -> list[dict]:
    stems = [
        ("Oxidation Number", "oxidation-number", "Redox", "Analyze", "Deduction"),
        ("Reducing Agent", "reducing-agent", "Redox", "Understand", "Classification"),
        ("Galvanic Cell", "galvanic-cell", "Electrochemistry", "Apply", "System reasoning"),
        ("Salt Bridge", "salt-bridge", "Electrochemistry", "Understand", "Causal reasoning"),
        ("Electrolysis Products", "electrolysis-products", "Electrolysis", "Apply", "Prediction"),
        ("Faraday Constant", "faraday-constant", "Electrolysis", "Analyze", "Quantitative reasoning"),
        ("Equilibrium Shift", "equilibrium-shift", "Equilibrium", "Apply", "Cause and effect"),
        ("Le Chatelier Principle", "le-chatelier-principle", "Equilibrium", "Evaluate", "Prediction"),
        ("pH Calculation", "ph-calculation", "Acids and Bases", "Apply", "Numeracy"),
        ("Buffer Solution", "buffer-solution", "Acids and Bases", "Analyze", "Explanation"),
    ]
    questions: list[dict] = []
    for index in range(50):
        concept_name, concept_slug, tag, bloom, skill = stems[index % len(stems)]
        question_type = [QuestionType.MCQ, QuestionType.TRUE_FALSE, QuestionType.MULTIPLE_SELECT, QuestionType.SHORT_ANSWER, QuestionType.ESSAY][index % 5]
        difficulty = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD][index % 3]
        title = f"Phase 8 Chemistry Q{index + 1}: {concept_name}"
        choices = []
        correct_answer = "A"
        if question_type == QuestionType.MCQ:
            choices = [
                QuestionChoiceCreate(choice_text="A", is_correct=True, position=0),
                QuestionChoiceCreate(choice_text="B", is_correct=False, position=1),
                QuestionChoiceCreate(choice_text="C", is_correct=False, position=2),
                QuestionChoiceCreate(choice_text="D", is_correct=False, position=3),
            ]
        elif question_type == QuestionType.TRUE_FALSE:
            correct_answer = "True"
            choices = [
                QuestionChoiceCreate(choice_text="True", is_correct=True, position=0),
                QuestionChoiceCreate(choice_text="False", is_correct=False, position=1),
            ]
        elif question_type == QuestionType.MULTIPLE_SELECT:
            correct_answer = "A,C"
            choices = [
                QuestionChoiceCreate(choice_text="A", is_correct=True, position=0),
                QuestionChoiceCreate(choice_text="B", is_correct=False, position=1),
                QuestionChoiceCreate(choice_text="C", is_correct=True, position=2),
                QuestionChoiceCreate(choice_text="D", is_correct=False, position=3),
            ]
        elif question_type == QuestionType.SHORT_ANSWER:
            correct_answer = f"Key idea for {concept_name}"
        else:
            correct_answer = "Structured explanation with claim, evidence, and reasoning."

        questions.append(
            {
                "title": title,
                "question_type": question_type,
                "difficulty": difficulty,
                "explanation": f"Use the {concept_name} rules and justify each step.",
                "correct_answer": correct_answer,
                "source": "Phase 8 seed",
                "bloom_level": bloom,
                "thinking_skill": skill,
                "estimated_time_seconds": 60 + (index % 4) * 30,
                "common_mistakes": [f"Confusing {concept_name} with a neighboring concept", "Skipping units or signs"],
                "keywords": [concept_name.lower(), tag.lower(), "chemistry"],
                "tags": ["Grade 12", tag, difficulty.value],
                "concept_slug": concept_slug,
                "choices": choices,
            }
        )
    return questions


async def seed() -> None:
    await get_or_create_teacher_user()

    async with AsyncSessionLocal() as session:
        category = await get_or_create_category(session, "Chemistry")
        course = await get_or_create_course(session)
        chapters = [
            await get_or_create_chapter(session, course, "Chapter 1: Redox and Electrochemistry", 1),
            await get_or_create_chapter(session, course, "Chapter 2: Electrolysis and Quantitative Chemistry", 2),
            await get_or_create_chapter(session, course, "Chapter 3: Equilibrium, Acids, and Bases", 3),
        ]
        lessons = [
            await get_or_create_lesson(session, chapters[0], "Oxidation numbers and redox agents", 1),
            await get_or_create_lesson(session, chapters[0], "Galvanic cells", 2),
            await get_or_create_lesson(session, chapters[1], "Electrolysis products", 1),
            await get_or_create_lesson(session, chapters[1], "Faraday calculations", 2),
            await get_or_create_lesson(session, chapters[2], "Equilibrium shifts", 1),
            await get_or_create_lesson(session, chapters[2], "pH and buffers", 2),
        ]
        concept_specs = [
            ("Oxidation Number", "oxidation-number", lessons[0], 3),
            ("Reducing Agent", "reducing-agent", lessons[0], 2),
            ("Galvanic Cell", "galvanic-cell", lessons[1], 3),
            ("Salt Bridge", "salt-bridge", lessons[1], 2),
            ("Electrolysis Products", "electrolysis-products", lessons[2], 4),
            ("Faraday Constant", "faraday-constant", lessons[3], 4),
            ("Equilibrium Shift", "equilibrium-shift", lessons[4], 3),
            ("Le Chatelier Principle", "le-chatelier-principle", lessons[4], 3),
            ("pH Calculation", "ph-calculation", lessons[5], 3),
            ("Buffer Solution", "buffer-solution", lessons[5], 4),
        ]
        concepts = {
            slug: await get_or_create_concept(session, course, lesson, name, slug, difficulty)
            for name, slug, lesson, difficulty in concept_specs
        }
        await session.commit()

        for item in build_questions():
            result = await session.execute(select(Question).where(Question.title == item["title"]))
            if result.scalar_one_or_none() is not None:
                continue

            concept = concepts[item["concept_slug"]]
            lesson = next(lesson for lesson in lessons if lesson.id == concept.lesson_id)
            chapter = next(chapter for chapter in chapters if chapter.id == lesson.chapter_id)
            payload = QuestionCreate(
                category_id=category.id,
                title=item["title"],
                question_type=item["question_type"],
                difficulty=item["difficulty"],
                explanation=item["explanation"],
                correct_answer=item["correct_answer"],
                source=item["source"],
                bloom_level=item["bloom_level"],
                thinking_skill=item["thinking_skill"],
                estimated_time_seconds=item["estimated_time_seconds"],
                common_mistakes=item["common_mistakes"],
                keywords=item["keywords"],
                course_id=course.id,
                chapter_id=chapter.id,
                lesson_id=lesson.id,
                concept_ids=[concept.id],
                created_by_id=PHASE8_TEACHER_ID,
                updated_by_id=PHASE8_TEACHER_ID,
                choices=item["choices"],
                tags=item["tags"],
            )
            await create_question(session, payload)


if __name__ == "__main__":
    asyncio.run(seed())
