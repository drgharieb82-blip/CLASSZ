from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import migrations  # noqa: F401
from app.modules.atomic_concepts.models import AtomicConcept
from app.modules.chapters.models import Chapter
from app.modules.concepts.models import Concept
from app.modules.lessons.models import Lesson
from app.modules.question_bank.models import Question, QuestionCategory, QuestionChoice, QuestionMedia, QuestionTag
from app.modules.question_bank.schemas import (
    QuestionCategoryCreate,
    QuestionChoiceCreate,
    QuestionCreate,
    QuestionMediaCreate,
    QuestionTagAttach,
)


async def list_categories(session: AsyncSession) -> list[QuestionCategory]:
    result = await session.execute(select(QuestionCategory).order_by(QuestionCategory.name))
    return list(result.scalars().all())


async def get_or_create_category(session: AsyncSession, payload: QuestionCategoryCreate) -> QuestionCategory:
    result = await session.execute(select(QuestionCategory).where(QuestionCategory.name == payload.name))
    category = result.scalar_one_or_none()
    if category is not None:
        return category

    category = QuestionCategory(name=payload.name, description=payload.description)
    session.add(category)
    await session.commit()
    await session.refresh(category)
    return category


def _question_options():
    return (
        selectinload(Question.category),
        selectinload(Question.choices),
        selectinload(Question.media),
        selectinload(Question.tags),
        selectinload(Question.chapters),
        selectinload(Question.lessons),
        selectinload(Question.concepts),
        selectinload(Question.atomic_concepts),
    )


async def list_questions(session: AsyncSession) -> list[Question]:
    result = await session.execute(
        select(Question)
        .options(*_question_options())
        .order_by(Question.created_at.desc())
    )
    return list(result.scalars().all())


async def get_question(session: AsyncSession, question_id: UUID) -> Question | None:
    result = await session.execute(
        select(Question)
        .where(Question.id == question_id)
        .options(*_question_options())
    )
    return result.scalar_one_or_none()


async def create_question(session: AsyncSession, payload: QuestionCreate) -> Question:
    question_data = payload.model_dump(
        exclude={
            "chapter_ids",
            "lesson_ids",
            "concept_ids",
            "atomic_concept_ids",
            "choices",
        }
    )
    question = Question(**question_data)
    question.chapters.extend(await _load_entities(session, Chapter, payload.chapter_ids))
    question.lessons.extend(await _load_entities(session, Lesson, payload.lesson_ids))
    question.concepts.extend(await _load_entities(session, Concept, payload.concept_ids))
    question.atomic_concepts.extend(
        await _load_entities(session, AtomicConcept, payload.atomic_concept_ids)
    )
    session.add(question)
    await session.flush()

    for choice_payload in payload.choices:
        session.add(
            QuestionChoice(
                question_id=question.id,
                choice_text=choice_payload.choice_text,
                is_correct=choice_payload.is_correct,
                position=choice_payload.position,
            )
        )

    await session.commit()
    return await get_question(session, question.id) or question


async def add_question_choice(
    session: AsyncSession,
    question_id: UUID,
    payload: QuestionChoiceCreate,
) -> QuestionChoice | None:
    question = await get_question(session, question_id)
    if question is None:
        return None

    choice = QuestionChoice(question_id=question_id, **payload.model_dump())
    session.add(choice)
    await session.commit()
    await session.refresh(choice)
    return choice


async def add_question_tag(
    session: AsyncSession,
    question_id: UUID,
    payload: QuestionTagAttach,
) -> Question | None:
    question = await get_question(session, question_id)
    if question is None:
        return None

    tag: QuestionTag | None = None
    if payload.tag_id is not None:
        tag_result = await session.execute(select(QuestionTag).where(QuestionTag.id == payload.tag_id))
        tag = tag_result.scalar_one_or_none()
    elif payload.name:
        tag_result = await session.execute(select(QuestionTag).where(QuestionTag.name == payload.name))
        tag = tag_result.scalar_one_or_none()
        if tag is None:
            tag = QuestionTag(name=payload.name)
            session.add(tag)
            await session.flush()

    if tag is None:
        return None

    if all(existing_tag.id != tag.id for existing_tag in question.tags):
        question.tags.append(tag)

    await session.commit()
    return await get_question(session, question_id)


async def list_question_media(session: AsyncSession, question_id: UUID) -> list[QuestionMedia] | None:
    question = await get_question(session, question_id)
    if question is None:
        return None

    result = await session.execute(
        select(QuestionMedia)
        .where(QuestionMedia.question_id == question_id)
        .order_by(QuestionMedia.position.asc(), QuestionMedia.created_at.asc())
    )
    return list(result.scalars().all())


async def add_question_media(
    session: AsyncSession,
    question_id: UUID,
    payload: QuestionMediaCreate,
) -> QuestionMedia | None:
    question = await get_question(session, question_id)
    if question is None:
        return None

    media = QuestionMedia(question_id=question_id, **payload.model_dump())
    session.add(media)
    await session.commit()
    await session.refresh(media)
    return media


async def delete_question_media(session: AsyncSession, media_id: UUID) -> bool:
    result = await session.execute(select(QuestionMedia).where(QuestionMedia.id == media_id))
    media = result.scalar_one_or_none()
    if media is None:
        return False

    await session.delete(media)
    await session.commit()
    return True


async def _load_entities(session: AsyncSession, model, ids: list[UUID]) -> list:
    if not ids:
        return []
    result = await session.execute(select(model).where(model.id.in_(ids)))
    entities = list(result.scalars().all())
    entities_by_id = {entity.id: entity for entity in entities}
    return [entities_by_id[entity_id] for entity_id in ids if entity_id in entities_by_id]
