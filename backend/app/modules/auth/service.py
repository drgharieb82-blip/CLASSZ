from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import Role, User
from app.modules.auth.schemas import RegisterRequest


def issue_access_token(user_id: str, role: Role) -> str:
    return create_access_token(subject=user_id, claims={"role": role.value})


async def authenticate_user(
    email: str, password: str, session: AsyncSession
) -> User | None:
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(password, user.hashed_password):
        return None
    return user


async def register_user(data: RegisterRequest, session: AsyncSession) -> User:
    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user
