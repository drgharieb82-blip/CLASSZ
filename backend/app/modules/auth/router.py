from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rate_limit import rate_limit
from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.schemas import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    RefreshResponse,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
)
from app.modules.auth.service import (
    authenticate_user,
    issue_access_token,
    issue_refresh_token,
    register_user,
    request_password_reset,
    reset_password,
    revoke_refresh_token,
    rotate_refresh_token,
)
from app.modules.students.schemas import StudentProfileRead
from app.schemas.user import UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/jwt-config")
async def jwt_config() -> dict[str, str]:
    return {"token_type": "bearer"}


@router.post("/login", response_model=AuthResponse, dependencies=[Depends(rate_limit(10, 60))])
async def login(
    body: LoginRequest,
    session: AsyncSession = Depends(get_db_session),
) -> AuthResponse:
    user = await authenticate_user(body.email, body.password, session)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account deactivated",
        )
    token = issue_access_token(str(user.id), user.role)
    refresh_token = await issue_refresh_token(session, user.id)
    return AuthResponse(access_token=token, refresh_token=refresh_token, user=UserRead.model_validate(user))


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit(5, 60))],
)
async def register(
    body: RegisterRequest,
    session: AsyncSession = Depends(get_db_session),
) -> AuthResponse:
    existing = await session.execute(
        select(User).where(User.email == body.email)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    user, student = await register_user(body, session)
    token = issue_access_token(str(user.id), user.role)
    refresh_token = await issue_refresh_token(session, user.id)
    return AuthResponse(
        access_token=token,
        refresh_token=refresh_token,
        user=UserRead.model_validate(user),
        student=StudentProfileRead.model_validate(student) if student is not None else None,
    )


@router.get("/me", response_model=UserRead)
async def me(current_user: User = Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(current_user)


@router.post("/forgot-password", response_model=MessageResponse, dependencies=[Depends(rate_limit(5, 60))])
async def forgot_password(
    body: ForgotPasswordRequest,
    session: AsyncSession = Depends(get_db_session),
) -> MessageResponse:
    await request_password_reset(session, body.email)
    return MessageResponse(detail="If an account exists for this email, reset instructions have been sent.")


@router.post("/reset-password", response_model=MessageResponse, dependencies=[Depends(rate_limit(10, 60))])
async def reset_password_endpoint(
    body: ResetPasswordRequest,
    session: AsyncSession = Depends(get_db_session),
) -> MessageResponse:
    success = await reset_password(session, body.token, body.new_password)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")
    return MessageResponse(detail="Password has been reset successfully.")


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(
    body: RefreshTokenRequest,
    session: AsyncSession = Depends(get_db_session),
) -> RefreshResponse:
    result = await rotate_refresh_token(session, body.refresh_token)
    if result is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")
    _user, access_token, new_refresh_token = result
    return RefreshResponse(access_token=access_token, refresh_token=new_refresh_token)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    body: LogoutRequest,
    session: AsyncSession = Depends(get_db_session),
) -> MessageResponse:
    await revoke_refresh_token(session, body.refresh_token)
    return MessageResponse(detail="Logged out.")
