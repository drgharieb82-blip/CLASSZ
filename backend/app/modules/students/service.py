from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.students import repository
from app.modules.students.models import Student
from app.modules.students.schemas import StudentCreate, StudentUpdate


async def list_students(session: AsyncSession) -> list[Student]:
    return await repository.list_students(session)


async def get_student(session: AsyncSession, student_id: UUID) -> Student | None:
    return await repository.get_student(session, student_id)


async def create_student(session: AsyncSession, payload: StudentCreate) -> Student:
    return await repository.create_student(session, payload)


async def update_student(session: AsyncSession, student_id: UUID, payload: StudentUpdate) -> Student | None:
    student = await repository.get_student(session, student_id)
    if student is None:
        return None

    return await repository.update_student(session, student, payload)


async def delete_student(session: AsyncSession, student_id: UUID) -> bool:
    student = await repository.get_student(session, student_id)
    if student is None:
        return False

    await repository.delete_student(session, student)
    return True
