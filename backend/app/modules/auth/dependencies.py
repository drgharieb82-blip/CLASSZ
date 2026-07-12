import uuid as _uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db_session
from app.models.user import Role, User

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    session: AsyncSession = Depends(get_db_session),
) -> User:
    if creds is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        payload = jwt.decode(
            creds.credentials,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    try:
        uid = _uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    result = await session.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account deactivated",
        )

    return user


async def get_optional_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    session: AsyncSession = Depends(get_db_session),
) -> User | None:
    """Like `get_current_user`, but returns None instead of raising when no
    credentials are presented at all - for endpoints used both by logged-in
    users and by anonymous flows (e.g. document uploads during teacher
    self-registration, before an account/token exists). A *present but
    invalid* token still raises, same as `get_current_user`."""
    if creds is None:
        return None
    return await get_current_user(creds, session)


async def get_current_student(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != Role.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required",
        )
    return current_user


async def get_current_teacher(
    current_user: User = Depends(get_current_user),
) -> User:
    """TEACHER, ADMIN, SUPER_ADMIN, and ASSISTANT are all allowed through —
    ASSISTANT has zero authority by default and is scoped down per-action by
    `app.core.ownership.assert_can`/`assert_teaches_student` inside each
    endpoint, not by this dependency."""
    if current_user.role not in (Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN, Role.ASSISTANT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher access required",
        )
    return current_user


async def get_current_parent(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role not in (Role.PARENT, Role.ADMIN, Role.SUPER_ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent access required",
        )
    return current_user


async def get_current_student_or_parent(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role not in (Role.STUDENT, Role.PARENT, Role.ADMIN, Role.SUPER_ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student or parent access required",
        )
    return current_user


async def get_current_assistant(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role not in (Role.ASSISTANT, Role.ADMIN, Role.SUPER_ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Assistant access required",
        )
    return current_user


async def get_current_finance(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role not in (Role.FINANCE, Role.ADMIN, Role.SUPER_ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Finance access required",
        )
    return current_user
