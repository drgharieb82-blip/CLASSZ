from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.courses import service
from app.modules.courses.schemas import CourseCreate, CourseDetails, CourseRead

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseRead])
async def list_courses(
    teacher_id: str | None = Query(default=None),
    session: AsyncSession = Depends(get_db_session),
) -> list[CourseRead]:
    parsed_id: UUID | None = None
    if teacher_id:
        try:
            parsed_id = UUID(teacher_id)
        except ValueError:
            return []
    return await service.list_courses(session, teacher_id=parsed_id)


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
