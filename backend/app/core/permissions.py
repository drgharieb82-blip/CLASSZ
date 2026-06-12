from fastapi import Depends, HTTPException, status

from app.models.user import Role, User


def require_roles(*allowed_roles: Role):
    async def dependency(current_user: User | None = None) -> User:
        if current_user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
            )

        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return current_user

    return Depends(dependency)
