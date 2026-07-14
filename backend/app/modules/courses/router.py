from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_roles
from app.db.session import get_db_session
from app.models.user import Role, User
from app.modules.auth.dependencies import get_current_user
from app.modules.courses import service
from app.modules.courses.schemas import CourseCreate, CourseDetails, CourseRead

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseRead])
async def list_courses(
    teacher_id: str | None = Query(default=None),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> list[CourseRead]:
    parsed_id: UUID | None = None
    if teacher_id:
        try:
            parsed_id = UUID(teacher_id)
        except ValueError:
            return []
    return await service.list_courses(
        session,
        teacher_id=parsed_id,
        published_only=current_user.role == Role.STUDENT,
    )


@router.get("/{course_id}", response_model=CourseDetails)
async def get_course(
    course_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> CourseDetails:
    course = await service.get_course(
        session,
        course_id,
        published_only=current_user.role == Role.STUDENT,
    )
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    return course


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
async def create_course(
    payload: CourseCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = require_roles(Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN),
) -> CourseRead:
    if current_user.role == Role.TEACHER and payload.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create a course on behalf of another teacher",
        )
    return await service.create_course(session, payload)
