from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password
from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.schemas import CurrentUserRead, LoginRequest, Token
from app.modules.auth.service import issue_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/jwt-config")
async def jwt_config() -> dict[str, str]:
    return {"token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_db_session)) -> Token:
    result = await session.execute(select(User).where(User.email == payload.email, User.is_active.is_(True)))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    return Token(access_token=issue_access_token(str(user.id), user.role))


@router.get("/me", response_model=CurrentUserRead)
async def me(current_user: User = Depends(get_current_user)) -> CurrentUserRead:
    return CurrentUserRead(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
    )


@router.post("/logout")
async def logout() -> dict[str, str]:
    return {"status": "ok"}
