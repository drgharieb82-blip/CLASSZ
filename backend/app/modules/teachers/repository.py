from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.teachers.models import Teacher
from app.modules.teachers.schemas import TeacherCreate


async def list_teachers(session: AsyncSession) -> list[Teacher]:
    result = await session.execute(select(Teacher).order_by(Teacher.created_at.desc()))
    return list(result.scalars().all())


async def get_teacher(session: AsyncSession, teacher_id: UUID) -> Teacher | None:
    result = await session.execute(select(Teacher).where(Teacher.id == teacher_id))
    return result.scalar_one_or_none()


async def create_teacher(session: AsyncSession, payload: TeacherCreate) -> Teacher:
    teacher = Teacher(**payload.model_dump())
    session.add(teacher)
    await session.commit()
    await session.refresh(teacher)
    return teacher
