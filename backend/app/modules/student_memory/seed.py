from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.student_memory.service import DEFAULT_STUDENT_ID, ensure_seed_student_memory


async def seed_student_memory(session: AsyncSession) -> None:
    await ensure_seed_student_memory(session, DEFAULT_STUDENT_ID)
