from app.core.security import create_access_token
from app.models.user import Role


def issue_access_token(user_id: str, role: Role) -> str:
    return create_access_token(subject=user_id, claims={"role": role.value})
