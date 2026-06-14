from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.students import service
from app.modules.students.schemas import StudentCreate, StudentRead, StudentUpdate

router = APIRouter(prefix="/students", tags=["students"])


@router.get("", response_model=list[StudentRead])
async def list_students(session: AsyncSession = Depends(get_db_session)) -> list[StudentRead]:
    return await service.list_students(session)


@router.get("/{student_id}", response_model=StudentRead)
async def get_student(student_id: UUID, session: AsyncSession = Depends(get_db_session)) -> StudentRead:
    student = await service.get_student(session, student_id)
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    return student


@router.post("", response_model=StudentRead, status_code=status.HTTP_201_CREATED)
async def create_student(payload: StudentCreate, session: AsyncSession = Depends(get_db_session)) -> StudentRead:
    return await service.create_student(session, payload)


@router.patch("/{student_id}", response_model=StudentRead)
async def update_student(student_id: UUID, payload: StudentUpdate, session: AsyncSession = Depends(get_db_session)) -> StudentRead:
    student = await service.update_student(session, student_id, payload)
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    return student
