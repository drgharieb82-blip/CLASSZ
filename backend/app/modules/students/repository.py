from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.students.models import Student
from app.modules.students.schemas import StudentCreate, StudentUpdate


async def list_students(session: AsyncSession) -> list[Student]:
    result = await session.execute(select(Student).order_by(Student.created_at.desc()))
    return list(result.scalars().all())


async def get_student(session: AsyncSession, student_id: UUID) -> Student | None:
    result = await session.execute(select(Student).where(Student.id == student_id))
    return result.scalar_one_or_none()


async def get_student_by_user_id(session: AsyncSession, user_id: UUID) -> Student | None:
    result = await session.execute(select(Student).where(Student.user_id == user_id))
    return result.scalar_one_or_none()


async def create_student(session: AsyncSession, payload: StudentCreate) -> Student:
    student = Student(**payload.model_dump())
    session.add(student)
    await session.commit()
    await session.refresh(student)
    return student


async def update_student(session: AsyncSession, student: Student, payload: StudentUpdate) -> Student:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(student, key, value)

    await session.commit()
    await session.refresh(student)
    return student


async def delete_student(session: AsyncSession, student: Student) -> None:
    await session.delete(student)
    await session.commit()
