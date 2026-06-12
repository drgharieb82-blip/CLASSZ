from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.courses import service
from app.modules.courses.schemas import CourseCreate, CourseDetails, CourseRead

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseRead])
async def list_courses(session: AsyncSession = Depends(get_db_session)) -> list[CourseRead]:
    return await service.list_courses(session)


@router.get("/{course_id}", response_model=CourseDetails)
async def get_course(
    course_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> CourseDetails:
    course = await service.get_course(session, course_id)
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    return course


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
async def create_course(
    payload: CourseCreate,
    session: AsyncSession = Depends(get_db_session),
) -> CourseRead:
    return await service.create_course(session, payload)
