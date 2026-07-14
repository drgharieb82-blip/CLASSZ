from uuid import UUID

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.identity import EntityType, format_public_code
from app.modules.chapters.models import Chapter
from app.modules.concepts.models import Concept
from app.modules.courses.models import Course
from app.modules.courses.schemas import CourseCreate
from app.modules.lessons.models import Lesson
from app.modules.sessions.models import Session


async def list_courses(
    session: AsyncSession,
    teacher_id: UUID | None = None,
    *,
    published_only: bool = False,
) -> list[Course]:
    q = select(Course).order_by(Course.created_at.desc())
    if teacher_id is not None:
        q = q.where(Course.teacher_id == teacher_id)
    if published_only:
        q = q.where(Course.is_published.is_(True))
    result = await session.execute(q)
    return list(result.scalars().all())


async def get_course(
    session: AsyncSession,
    course_id: UUID,
    *,
    published_only: bool = False,
) -> Course | None:
    query = (
        select(Course)
        .where(Course.id == course_id)
        .options(
            selectinload(Course.chapters)
            .selectinload(Chapter.lessons)
            .selectinload(Lesson.concepts)
            .selectinload(Concept.atomic_concepts),
            selectinload(Course.sessions).selectinload(Session.blocks),
            selectinload(Course.sessions).selectinload(Session.chapters),
            selectinload(Course.sessions).selectinload(Session.lessons),
            selectinload(Course.sessions).selectinload(Session.concepts),
            selectinload(Course.sessions).selectinload(Session.atomic_concepts),
        )
    )
    if published_only:
        query = query.where(Course.is_published.is_(True))
    result = await session.execute(query)
    return result.scalar_one_or_none()


async def _next_course_public_code(session: AsyncSession) -> str:
    """Real, DB-backed sequence read - see teachers/service.py for why this reads
    the Postgres sequence directly rather than the in-memory CodeGeneratorService."""
    result = await session.execute(text("SELECT nextval('seq_course_code')"))
    sequence = int(result.scalar_one())
    return format_public_code(EntityType.COURSE, sequence)


async def create_course(session: AsyncSession, payload: CourseCreate) -> Course:
    course_data = payload.model_dump()
    if course_data.get("thumbnail_url") is not None:
        course_data["thumbnail_url"] = str(course_data["thumbnail_url"])

    course_data["public_code"] = await _next_course_public_code(session)
    course = Course(**course_data)
    session.add(course)
    await session.commit()
    await session.refresh(course)
    return course
