from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.identity import EntityType, format_public_code
from app.core.security import create_access_token, hash_password
from app.models.user import Role, User
from app.modules.teachers.models import Teacher
from app.modules.teachers.schemas import RegisterTeacherRequest


class EmailAlreadyRegisteredError(Exception):
    pass


async def _next_teacher_public_code(session: AsyncSession) -> str:
    """Real, DB-backed sequence read - the seq_teacher_code sequence was created by
    migration 202606210001 but was never actually used by any code path (the only
    other code that formats public codes, CodeGeneratorService, keeps its counters
    in-memory only and would collide/reset across process restarts). This reads
    the real Postgres sequence, which is safe across workers and restarts."""
    result = await session.execute(text("SELECT nextval('seq_teacher_code')"))
    sequence = int(result.scalar_one())
    return format_public_code(EntityType.TEACHER, sequence)


async def register_teacher(data: RegisterTeacherRequest, session: AsyncSession) -> tuple[User, Teacher, str]:
    existing = await session.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none() is not None:
        raise EmailAlreadyRegisteredError(data.email)

    public_code = await _next_teacher_public_code(session)

    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=Role.TEACHER,
        public_code=public_code,
    )
    session.add(user)
    await session.flush()  # assigns user.id without ending the transaction

    teacher = Teacher(
        user_id=user.id,
        name_on_id=data.name_on_id,
        national_id=data.national_id,
        id_document_url=data.id_document_url,
        photo_url=data.photo_url,
        nickname=data.nickname,
        bio=data.bio,
        social_links=data.social_links,
        mobile_number=data.mobile_number,
        certification_text=data.certification_text,
        certification_document_url=data.certification_document_url,
        specialization=data.specialization,
        headline=data.headline,
        gender=data.gender,
        date_of_birth=data.date_of_birth,
    )
    session.add(teacher)

    await session.commit()
    await session.refresh(user)
    await session.refresh(teacher)

    token = create_access_token(subject=str(user.id), claims={"role": user.role.value})
    return user, teacher, token
