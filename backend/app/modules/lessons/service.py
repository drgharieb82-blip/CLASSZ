from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.lessons.models import Lesson
from app.modules.lessons.schemas import LessonCreate


async def create_lesson(session: AsyncSession, payload: LessonCreate) -> Lesson:
    lesson = Lesson(**payload.model_dump())
    session.add(lesson)
    await session.commit()
    await session.refresh(lesson)
    return lesson
