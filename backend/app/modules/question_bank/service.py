from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import migrations  # noqa: F401
from app.modules.concepts.models import Concept
from app.modules.question_bank.models import (
    Question,
    QuestionCategory,
    QuestionChoice,
    QuestionConceptMap,
    QuestionMedia,
    QuestionRevision,
    QuestionStats,
    QuestionTag,
    question_tag_links,
)
from app.modules.question_bank.schemas import (
    QuestionChoiceCreate,
    QuestionCreate,
    QuestionMediaCreate,
    QuestionSearchParams,
    QuestionTagAttach,
    QuestionUpdate,
)


def _question_options():
    return (
        selectinload(Question.category),
        selectinload(Question.choices),
        selectinload(Question.media),
        selectinload(Question.tags),
        selectinload(Question.concept_maps),
        selectinload(Question.stats),
        selectinload(Question.revisions),
    )


async def list_questions(session: AsyncSession) -> list[Question]:
    result = await session.execute(
        select(Question)
        .where(Question.deleted_at.is_(None))
        .options(*_question_options())
        .order_by(Question.created_at.desc())
    )
    return list(result.scalars().all())


async def get_question(session: AsyncSession, question_id: UUID) -> Question | None:
    result = await session.execute(
        select(Question)
        .where(Question.id == question_id, Question.deleted_at.is_(None))
        .options(*_question_options())
    )
    return result.scalar_one_or_none()


def _question_payload(payload: QuestionCreate | QuestionUpdate) -> dict:
    data = payload.model_dump(exclude_unset=True)
    for key in ("choices", "tags", "concept_ids", "category_name"):
        data.pop(key, None)
    return data


def _revision_snapshot(question: Question) -> dict:
    return {
        "title": question.title,
        "question_type": question.question_type.value,
        "difficulty": question.difficulty.value,
        "explanation": question.explanation,
        "correct_answer": question.correct_answer,
        "source": question.source,
        "bloom_level": question.bloom_level,
        "thinking_skill": question.thinking_skill,
        "estimated_time_seconds": question.estimated_time_seconds,
        "common_mistakes": question.common_mistakes,
        "keywords": question.keywords,
        "points": question.points,
        "is_active": question.is_active,
    }


async def _sync_tags(session: AsyncSession, question: Question, tag_names: list[str]) -> None:
    normalized_names = sorted({name.strip() for name in tag_names if name.strip()})
    if not normalized_names:
        return

    result = await session.execute(select(QuestionTag).where(QuestionTag.name.in_(normalized_names)))
    existing_tags = {tag.name: tag for tag in result.scalars().all()}
    link_result = await session.execute(
        select(question_tag_links.c.tag_id).where(question_tag_links.c.question_id == question.id)
    )
    linked_tag_ids = set(link_result.scalars().all())
    for name in normalized_names:
        tag = existing_tags.get(name)
        if tag is None:
            tag = QuestionTag(name=name)
            session.add(tag)
            await session.flush()
        if tag.id not in linked_tag_ids:
            await session.execute(question_tag_links.insert().values(question_id=question.id, tag_id=tag.id))
            linked_tag_ids.add(tag.id)


async def _sync_concepts(session: AsyncSession, question: Question, concept_ids: list[UUID]) -> None:
    normalized_ids = list(dict.fromkeys(concept_ids))
    if not normalized_ids:
        return

    result = await session.execute(select(Concept).where(Concept.id.in_(normalized_ids)))
    existing_concept_ids = {concept.id for concept in result.scalars().all()}
    map_result = await session.execute(
        select(QuestionConceptMap.concept_id).where(QuestionConceptMap.question_id == question.id)
    )
    current_concept_ids = set(map_result.scalars().all())
    for concept_id in normalized_ids:
        if concept_id in existing_concept_ids and concept_id not in current_concept_ids:
            session.add(
                QuestionConceptMap(
                    question_id=question.id,
                    course_id=question.course_id,
                    chapter_id=question.chapter_id,
                    lesson_id=question.lesson_id,
                    concept_id=concept_id,
                )
            )


async def _get_or_create_category(session: AsyncSession, name: str) -> QuestionCategory:
    normalized_name = name.strip() or "Chemistry"
    result = await session.execute(select(QuestionCategory).where(QuestionCategory.name == normalized_name))
    category = result.scalar_one_or_none()
    if category is None:
        category = QuestionCategory(name=normalized_name, description=f"{normalized_name} questions")
        session.add(category)
        await session.flush()
    return category


async def create_question(session: AsyncSession, payload: QuestionCreate) -> Question:
    data = _question_payload(payload)
    if data.get("category_id") is None:
        category = await _get_or_create_category(session, payload.category_name or "Chemistry")
        data["category_id"] = category.id
    question = Question(**data)
    session.add(question)
    await session.flush()

    for choice_payload in payload.choices:
        session.add(QuestionChoice(question_id=question.id, **choice_payload.model_dump()))
    await _sync_tags(session, question, payload.tags)
    await _sync_concepts(session, question, payload.concept_ids)
    session.add(QuestionStats(question_id=question.id))
    session.add(
        QuestionRevision(
            question_id=question.id,
            version_number=1,
            snapshot=_revision_snapshot(question),
            created_by_id=payload.created_by_id,
        )
    )
    await session.commit()
    return await get_question(session, question.id) or question


async def update_question(session: AsyncSession, question_id: UUID, payload: QuestionUpdate) -> Question | None:
    question = await get_question(session, question_id)
    if question is None:
        return None

    for key, value in _question_payload(payload).items():
        setattr(question, key, value)
    question.version_number += 1
    if payload.concept_ids is not None:
        result = await session.execute(select(QuestionConceptMap).where(QuestionConceptMap.question_id == question.id))
        for concept_map in result.scalars().all():
            await session.delete(concept_map)
        await session.flush()
        await _sync_concepts(session, question, payload.concept_ids)
    session.add(
        QuestionRevision(
            question_id=question.id,
            version_number=question.version_number,
            snapshot=_revision_snapshot(question),
            created_by_id=payload.updated_by_id,
        )
    )
    await session.commit()
    return await get_question(session, question_id)


async def search_questions(session: AsyncSession, params: QuestionSearchParams) -> list[Question]:
    statement = select(Question).where(Question.deleted_at.is_(None)).options(*_question_options())

    if params.q:
        term = f"%{params.q.strip()}%"
        statement = statement.where(
            or_(
                Question.title.ilike(term),
                Question.explanation.ilike(term),
                Question.correct_answer.ilike(term),
                Question.source.ilike(term),
            )
        )
    if params.subject:
        statement = statement.where(Question.category.has(name=params.subject))
    if params.chapter_id:
        statement = statement.where(Question.chapter_id == params.chapter_id)
    if params.lesson_id:
        statement = statement.where(Question.lesson_id == params.lesson_id)
    if params.difficulty:
        statement = statement.where(Question.difficulty == params.difficulty)
    if params.question_type:
        statement = statement.where(Question.question_type == params.question_type)
    if params.concept_id:
        statement = statement.join(QuestionConceptMap).where(QuestionConceptMap.concept_id == params.concept_id)
    if params.tags:
        statement = statement.join(Question.tags).where(QuestionTag.name.in_(params.tags)).group_by(Question.id)

    result = await session.execute(
        statement.order_by(Question.created_at.desc()).offset(params.offset).limit(params.limit)
    )
    return list(result.scalars().unique().all())


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


async def get_question_stats(session: AsyncSession, question_id: UUID) -> QuestionStats | None:
    question = await get_question(session, question_id)
    if question is None:
        return None

    if question.stats is not None:
        return question.stats

    stats = QuestionStats(question_id=question_id)
    session.add(stats)
    await session.commit()
    await session.refresh(stats)
    return stats


async def list_question_revisions(session: AsyncSession, question_id: UUID) -> list[QuestionRevision] | None:
    question = await get_question(session, question_id)
    if question is None:
        return None

    result = await session.execute(
        select(QuestionRevision)
        .where(QuestionRevision.question_id == question_id)
        .order_by(QuestionRevision.version_number.desc())
    )
    return list(result.scalars().all())


async def soft_delete_question(session: AsyncSession, question_id: UUID) -> bool:
    question = await get_question(session, question_id)
    if question is None:
        return False

    question.is_active = False
    question.deleted_at = datetime.now(UTC)
    await session.commit()
    return True
