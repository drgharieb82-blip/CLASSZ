import asyncio

from app.db.session import AsyncSessionLocal
from app.modules.student_memory.seed import seed_student_memory


async def main() -> None:
    async with AsyncSessionLocal() as session:
        await seed_student_memory(session)


if __name__ == "__main__":
    asyncio.run(main())
