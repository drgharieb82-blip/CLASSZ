from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.chapters.models import Chapter
from app.modules.courses.models import Course
from app.modules.courses.schemas import CourseCreate
from app.modules.lessons.models import Lesson


async def list_courses(session: AsyncSession) -> list[Course]:
    result = await session.execute(select(Course).order_by(Course.created_at.desc()))
    return list(result.scalars().all())


async def get_course(session: AsyncSession, course_id: UUID) -> Course | None:
    result = await session.execute(
        select(Course)
        .where(Course.id == course_id)
        .options(
            selectinload(Course.chapters)
            .selectinload(Chapter.lessons)
            .selectinload(Lesson.blocks)
        )
    )
    return result.scalar_one_or_none()


async def create_course(session: AsyncSession, payload: CourseCreate) -> Course:
    course_data = payload.model_dump()
    if course_data.get("thumbnail_url") is not None:
        course_data["thumbnail_url"] = str(course_data["thumbnail_url"])

    course = Course(**course_data)
    session.add(course)
    await session.commit()
    await session.refresh(course)
    return course
