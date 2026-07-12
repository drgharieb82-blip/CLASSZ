import base64
import hashlib
import hmac
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.identity import EntityType, format_public_code
from app.modules.atomic_concepts.models import AtomicConcept
from app.modules.chapters.models import Chapter
from app.modules.concepts.models import Concept
from app.modules.lessons.models import Lesson
from app.modules.materials.models import Material, MaterialAccessLog, MaterialAccessType, MaterialStatus
from app.modules.materials.schemas import (
    MaterialAccessRead,
    MaterialCreate,
    MaterialLinksUpdate,
    MaterialReorder,
    MaterialUpdate,
)

_EAGER_LOAD = (
    selectinload(Material.chapters),
    selectinload(Material.lessons),
    selectinload(Material.concepts),
    selectinload(Material.atomic_concepts),
)


async def _next_material_public_code(session: AsyncSession) -> str:
    """Real, DB-backed sequence read - see teachers/service.py for why this reads
    the Postgres sequence directly rather than the in-memory CodeGeneratorService."""
    result = await session.execute(text("SELECT nextval('seq_material_code')"))
    sequence = int(result.scalar_one())
    return format_public_code(EntityType.MATERIAL, sequence)


async def _resolve_links(
    session: AsyncSession,
    chapter_ids: list[UUID],
    lesson_ids: list[UUID],
    concept_ids: list[UUID],
    atomic_concept_ids: list[UUID],
) -> tuple[list[Chapter], list[Lesson], list[Concept], list[AtomicConcept]]:
    chapters = list((await session.execute(select(Chapter).where(Chapter.id.in_(chapter_ids)))).scalars().all()) if chapter_ids else []
    lessons = list((await session.execute(select(Lesson).where(Lesson.id.in_(lesson_ids)))).scalars().all()) if lesson_ids else []
    concepts = list((await session.execute(select(Concept).where(Concept.id.in_(concept_ids)))).scalars().all()) if concept_ids else []
    atomic_concepts = (
        list((await session.execute(select(AtomicConcept).where(AtomicConcept.id.in_(atomic_concept_ids)))).scalars().all())
        if atomic_concept_ids
        else []
    )
    return chapters, lessons, concepts, atomic_concepts


async def create_material(session: AsyncSession, payload: MaterialCreate) -> Material:
    chapters, lessons, concepts, atomic_concepts = await _resolve_links(
        session, payload.chapter_ids, payload.lesson_ids, payload.concept_ids, payload.atomic_concept_ids
    )
    public_code = await _next_material_public_code(session)
    next_position = await _next_position(session, payload.course_id)
    material = Material(
        public_code=public_code,
        course_id=payload.course_id,
        session_id=payload.session_id,
        type=payload.type,
        title=payload.title,
        description=payload.description,
        file_url=payload.file_url,
        video_url=payload.video_url,
        notes_content=payload.notes_content,
        file_name=payload.file_name,
        file_size_bytes=payload.file_size_bytes,
        mime_type=payload.mime_type,
        position=next_position,
        chapters=chapters,
        lessons=lessons,
        concepts=concepts,
        atomic_concepts=atomic_concepts,
    )
    session.add(material)
    await session.commit()
    return await get_material(session, material.id)  # reload with eager links


async def _next_position(session: AsyncSession, course_id: UUID) -> int:
    result = await session.execute(select(func.max(Material.position)).where(Material.course_id == course_id))
    current_max = result.scalar_one_or_none()
    return (current_max or 0) + 1


async def list_materials(
    session: AsyncSession,
    course_id: UUID,
    session_id: UUID | None = None,
    *,
    published_only: bool = False,
) -> list[Material]:
    query = select(Material).where(Material.course_id == course_id)
    if session_id is not None:
        query = query.where(Material.session_id == session_id)
    if published_only:
        query = query.where(Material.status == MaterialStatus.published)
    result = await session.execute(query.options(*_EAGER_LOAD).order_by(Material.position))
    return list(result.scalars().all())


async def reorder_materials(session: AsyncSession, payload: MaterialReorder) -> list[Material]:
    result = await session.execute(
        select(Material).where(Material.course_id == payload.course_id, Material.id.in_(payload.ordered_ids))
    )
    materials_by_id = {m.id: m for m in result.scalars().all()}
    for position, material_id in enumerate(payload.ordered_ids, start=1):
        material = materials_by_id.get(material_id)
        if material is not None:
            material.position = position
    await session.commit()
    return await list_materials(session, payload.course_id)


async def get_material(
    session: AsyncSession,
    material_id: UUID,
    *,
    published_only: bool = False,
) -> Material | None:
    query = select(Material).where(Material.id == material_id)
    if published_only:
        query = query.where(Material.status == MaterialStatus.published)
    result = await session.execute(query.options(*_EAGER_LOAD))
    return result.scalar_one_or_none()


async def update_material(session: AsyncSession, material_id: UUID, payload: MaterialUpdate) -> Material | None:
    material = await session.get(Material, material_id)
    if material is None:
        return None
    if payload.title is not None:
        material.title = payload.title
    if payload.description is not None:
        material.description = payload.description
    if payload.status is not None:
        material.status = payload.status
    if payload.file_url is not None:
        material.file_url = payload.file_url
    if payload.video_url is not None:
        material.video_url = payload.video_url
    if payload.notes_content is not None:
        material.notes_content = payload.notes_content
    if payload.session_id is not None:
        material.session_id = payload.session_id
    if payload.file_name is not None:
        material.file_name = payload.file_name
    await session.commit()
    return await get_material(session, material_id)


async def update_material_links(session: AsyncSession, material_id: UUID, payload: MaterialLinksUpdate) -> Material | None:
    material = await get_material(session, material_id)
    if material is None:
        return None
    chapters, lessons, concepts, atomic_concepts = await _resolve_links(
        session, payload.chapter_ids, payload.lesson_ids, payload.concept_ids, payload.atomic_concept_ids
    )
    material.chapters = chapters
    material.lessons = lessons
    material.concepts = concepts
    material.atomic_concepts = atomic_concepts
    await session.commit()
    return await get_material(session, material_id)


async def delete_material(session: AsyncSession, material_id: UUID) -> bool:
    material = await session.get(Material, material_id)
    if material is None:
        return False
    await session.delete(material)
    await session.commit()
    return True


def _material_access_payload(
    material_id: UUID,
    student_id: UUID,
    access_type: MaterialAccessType,
    expires_at: datetime,
    nonce: str,
) -> str:
    return f"{material_id}:{student_id}:{access_type.value}:{int(expires_at.timestamp())}:{nonce}"


def _material_access_signature(payload: str) -> str:
    return hmac.new(settings.jwt_secret_key.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()


def _material_access_token(
    material_id: UUID,
    student_id: UUID,
    access_type: MaterialAccessType,
    expires_at: datetime,
    nonce: str,
) -> str:
    payload = _material_access_payload(material_id, student_id, access_type, expires_at, nonce)
    signature = _material_access_signature(payload)
    raw = f"{payload}:{signature}".encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("utf-8")


def _decode_material_access_token(token: str) -> tuple[UUID, UUID, MaterialAccessType, datetime, str, str]:
    raw = base64.urlsafe_b64decode(token.encode("utf-8")).decode("utf-8")
    material_id_raw, student_id_raw, access_type_raw, expires_at_raw, nonce, signature = raw.split(":", 5)
    material_id = UUID(material_id_raw)
    student_id = UUID(student_id_raw)
    access_type = MaterialAccessType(access_type_raw)
    expires_at = datetime.fromtimestamp(int(expires_at_raw), tz=UTC)
    payload = _material_access_payload(material_id, student_id, access_type, expires_at, nonce)
    if not hmac.compare_digest(signature, _material_access_signature(payload)):
        raise ValueError("Invalid material access token")
    return material_id, student_id, access_type, expires_at, nonce, signature


async def create_material_access(
    session: AsyncSession,
    material_id: UUID,
    student_id: UUID,
    access_type: MaterialAccessType = MaterialAccessType.view,
    *,
    ttl_minutes: int = 30,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> MaterialAccessRead:
    material = await session.get(Material, material_id)
    if material is None:
        raise ValueError("Material not found")
    expires_at = datetime.now(UTC) + timedelta(minutes=ttl_minutes)
    nonce = uuid4().hex
    token = _material_access_token(material_id, student_id, access_type, expires_at, nonce)
    log = MaterialAccessLog(
        material_id=material_id,
        student_id=student_id,
        access_type=access_type,
        token_hash=hashlib.sha256(token.encode("utf-8")).hexdigest(),
        expires_at=expires_at,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    session.add(log)
    await session.commit()
    return MaterialAccessRead(
        material_id=material_id,
        access_type=access_type,
        access_url=f"/api/materials/access/{token}",
        expires_at=expires_at,
    )


async def resolve_material_access(
    session: AsyncSession,
    token: str,
    current_student_id: UUID,
) -> MaterialAccessLog | None:
    try:
        material_id, student_id, access_type, expires_at, nonce, signature = _decode_material_access_token(token)
    except Exception:
        return None

    if student_id != current_student_id or expires_at < datetime.now(UTC):
        return None

    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    result = await session.execute(
        select(MaterialAccessLog).where(
            MaterialAccessLog.material_id == material_id,
            MaterialAccessLog.student_id == student_id,
            MaterialAccessLog.access_type == access_type,
            MaterialAccessLog.token_hash == token_hash,
        )
    )
    log = result.scalar_one_or_none()
    if log is None:
        return None
    if log.accessed_at is None:
        log.accessed_at = datetime.now(UTC)
        await session.commit()
    return log


async def get_material_access_target(session: AsyncSession, material_id: UUID, student_id: UUID) -> str | None:
    material = await session.get(Material, material_id)
    if material is None:
        return None
    if material.video_url:
        return material.video_url
    if material.file_url:
        return material.file_url
    return None
