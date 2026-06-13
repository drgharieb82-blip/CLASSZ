from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.user import Role, User
from app.modules.student_memory.service import DEFAULT_STUDENT_ID, ensure_seed_student_memory


async def seed_student_memory(session: AsyncSession) -> None:
    student = await session.get(User, DEFAULT_STUDENT_ID)
    if student is None:
        session.add(
            User(
                id=DEFAULT_STUDENT_ID,
                email="student.memory@classz.local",
                full_name="Mariam Hassan",
                hashed_password=hash_password("classz-dev-password"),
                role=Role.STUDENT,
                is_active=True,
            )
        )
        await session.commit()

    await ensure_seed_student_memory(session, DEFAULT_STUDENT_ID)
