from uuid import UUID

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.identity import EntityType, format_public_code
from app.modules.atomic_concepts.models import AtomicConcept
from app.modules.chapters.models import Chapter
from app.modules.concepts.models import Concept
from app.modules.lessons.models import Lesson
from app.modules.sessions.models import Session, SessionStatus
from app.modules.sessions.schemas import SessionCreate, SessionUpdate

_EAGER_LOAD = (
    selectinload(Session.chapters),
    selectinload(Session.lessons),
    selectinload(Session.concepts),
    selectinload(Session.atomic_concepts),
)


async def _next_session_public_code(session: AsyncSession) -> str:
    """Real, DB-backed sequence read - see teachers/service.py for why this reads
    the Postgres sequence directly rather than the in-memory CodeGeneratorService."""
    result = await session.execute(text("SELECT nextval('seq_session_code')"))
    sequence = int(result.scalar_one())
    return format_public_code(EntityType.SESSION, sequence)


async def create_session(session: AsyncSession, payload: SessionCreate) -> Session:
    result = await session.execute(
        select(func.max(Session.position)).where(Session.course_id == payload.course_id)
    )
    max_position = result.scalar_one_or_none()
    position = 0 if max_position is None else max_position + 1
    public_code = await _next_session_public_code(session)

    chapters: list[Chapter] = []
    if payload.chapter_ids:
        chapter_result = await session.execute(select(Chapter).where(Chapter.id.in_(payload.chapter_ids)))
        chapters = list(chapter_result.scalars().all())

    lessons: list[Lesson] = []
    if payload.lesson_ids:
        lesson_result = await session.execute(select(Lesson).where(Lesson.id.in_(payload.lesson_ids)))
        lessons = list(lesson_result.scalars().all())

    concepts: list[Concept] = []
    if payload.concept_ids:
        concept_result = await session.execute(select(Concept).where(Concept.id.in_(payload.concept_ids)))
        concepts = list(concept_result.scalars().all())

    atomic_concepts: list[AtomicConcept] = []
    if payload.atomic_concept_ids:
        atomic_result = await session.execute(select(AtomicConcept).where(AtomicConcept.id.in_(payload.atomic_concept_ids)))
        atomic_concepts = list(atomic_result.scalars().all())

    new_session = Session(
        public_code=public_code,
        course_id=payload.course_id,
        title=payload.title,
        description=payload.description,
        position=position,
        is_free_preview=payload.is_free_preview,
        release_at=payload.release_at,
        hide_at=payload.hide_at,
        requires_previous_completion=payload.requires_previous_completion,
        is_locked=payload.is_locked,
        chapters=chapters,
        lessons=lessons,
        concepts=concepts,
        atomic_concepts=atomic_concepts,
    )
    session.add(new_session)
    await session.commit()
    await session.refresh(new_session, attribute_names=["chapters", "lessons", "concepts", "atomic_concepts"])
    return new_session


async def list_sessions(
    session: AsyncSession,
    course_id: UUID,
    *,
    published_only: bool = False,
) -> list[Session]:
    query = (
        select(Session)
        .where(Session.course_id == course_id)
        .options(*_EAGER_LOAD)
        .order_by(Session.position)
    )
    if published_only:
        query = query.where(Session.status == SessionStatus.published)
    result = await session.execute(query)
    return list(result.scalars().all())


async def get_session(session: AsyncSession, session_id: UUID) -> Session | None:
    result = await session.execute(select(Session).where(Session.id == session_id).options(*_EAGER_LOAD))
    return result.scalar_one_or_none()


async def update_session(session: AsyncSession, session_id: UUID, payload: SessionUpdate) -> Session | None:
    db_session = await session.get(Session, session_id)
    if db_session is None:
        return None
    if payload.title is not None:
        db_session.title = payload.title
    if payload.description is not None:
        db_session.description = payload.description
    if payload.is_free_preview is not None:
        db_session.is_free_preview = payload.is_free_preview
    if payload.release_at is not None:
        db_session.release_at = payload.release_at
    if payload.hide_at is not None:
        db_session.hide_at = payload.hide_at
    if payload.requires_previous_completion is not None:
        db_session.requires_previous_completion = payload.requires_previous_completion
    if payload.is_locked is not None:
        db_session.is_locked = payload.is_locked
    if payload.status is not None:
        db_session.status = payload.status
    await session.commit()
    return await get_session(session, session_id)


async def delete_session(session: AsyncSession, session_id: UUID) -> bool:
    db_session = await session.get(Session, session_id)
    if db_session is None:
        return False
    await session.delete(db_session)
    await session.commit()
    return True
