from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.teachers import repository
from app.modules.teachers.models import Teacher
from app.modules.teachers.schemas import TeacherCreate


async def list_teachers(session: AsyncSession) -> list[Teacher]:
    return await repository.list_teachers(session)


async def get_teacher(session: AsyncSession, teacher_id: UUID) -> Teacher | None:
    return await repository.get_teacher(session, teacher_id)


async def create_teacher(session: AsyncSession, payload: TeacherCreate) -> Teacher:
    return await repository.create_teacher(session, payload)
