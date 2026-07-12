"""Seed the minimum accounts needed to verify auth on a freshly-migrated launch
database: one admin, one teacher, one student, one parent, one assistant. Idempotent - safe to re-run.

Credentials are intentionally simple and documented in
DATABASE_LAUNCH_RESET_REPORT.md; rotate them before any real launch.
"""
import asyncio

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.user import Role, User

LAUNCH_USERS = [
    {"email": "admin@classz-launch.dev", "password": "LaunchAdmin123!", "full_name": "Launch Admin", "role": Role.ADMIN, "public_code": "ADM-26-0001"},
    {"email": "teacher@classz-launch.dev", "password": "LaunchTeacher123!", "full_name": "Launch Teacher", "role": Role.TEACHER, "public_code": "TCH-26-0001"},
    {"email": "student@classz-launch.dev", "password": "LaunchStudent123!", "full_name": "Launch Student", "role": Role.STUDENT, "public_code": "CLS-26-000001"},
    {"email": "parent@classz-launch.dev", "password": "LaunchParent123!", "full_name": "Launch Parent", "role": Role.PARENT, "public_code": "PRT-26-0001"},
    {"email": "assistant@classz-launch.dev", "password": "LaunchAssistant123!", "full_name": "Launch Assistant", "role": Role.ASSISTANT, "public_code": "AST-26-0001"},
    {"email": "finance@classz-launch.dev", "password": "LaunchFinance123!", "full_name": "Launch Finance", "role": Role.FINANCE, "public_code": "FIN-26-0001"},
]


async def main() -> None:
    async with AsyncSessionLocal() as session:
        for data in LAUNCH_USERS:
            existing = await session.execute(select(User).where(User.email == data["email"]))
            if existing.scalar_one_or_none() is not None:
                print("EXISTS", data["email"])
                continue
            user = User(
                email=data["email"],
                full_name=data["full_name"],
                hashed_password=hash_password(data["password"]),
                role=data["role"],
                public_code=data["public_code"],
            )
            session.add(user)
            await session.commit()
            print("CREATED", data["email"], data["role"].value)


asyncio.run(main())
