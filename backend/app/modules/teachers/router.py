from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.teachers import service
from app.modules.teachers.schemas import RegisterTeacherRequest, TeacherRegisterResponse
from app.schemas.user import UserRead

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.post(
    "/register",
    response_model=TeacherRegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register_teacher(
    body: RegisterTeacherRequest,
    session: AsyncSession = Depends(get_db_session),
) -> TeacherRegisterResponse:
    try:
        user, teacher, token = await service.register_teacher(body, session)
    except service.EmailAlreadyRegisteredError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    return TeacherRegisterResponse(
        access_token=token,
        user=UserRead.model_validate(user),
        teacher=teacher,
    )
