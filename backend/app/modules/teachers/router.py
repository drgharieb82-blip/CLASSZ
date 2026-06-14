from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.teachers import service
from app.modules.teachers.schemas import TeacherCreate, TeacherRead, TeacherUpdate

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.get("", response_model=list[TeacherRead])
async def list_teachers(session: AsyncSession = Depends(get_db_session)) -> list[TeacherRead]:
    return await service.list_teachers(session)


@router.get("/{teacher_id}", response_model=TeacherRead)
async def get_teacher(teacher_id: UUID, session: AsyncSession = Depends(get_db_session)) -> TeacherRead:
    teacher = await service.get_teacher(session, teacher_id)
    if teacher is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")

    return teacher


@router.post("", response_model=TeacherRead, status_code=status.HTTP_201_CREATED)
async def create_teacher(payload: TeacherCreate, session: AsyncSession = Depends(get_db_session)) -> TeacherRead:
    return await service.create_teacher(session, payload)


@router.put("/{teacher_id}", response_model=TeacherRead)
async def update_teacher(teacher_id: UUID, payload: TeacherUpdate, session: AsyncSession = Depends(get_db_session)) -> TeacherRead:
    teacher = await service.update_teacher(session, teacher_id, payload)
    if teacher is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")

    return teacher
