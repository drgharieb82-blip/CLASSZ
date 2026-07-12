from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.materials.models import Material, MaterialStatus
from app.modules.session_blocks.models import SessionBlock
from app.modules.sessions.models import Session, SessionStatus
from app.modules.student_content.schemas import StudentSessionDetailRead


async def get_student_session_detail(
    session: AsyncSession,
    session_id: UUID,
) -> StudentSessionDetailRead | None:
    result = await session.execute(
        select(Session)
        .where(Session.id == session_id, Session.status == SessionStatus.published)
        .options(
            selectinload(Session.course),
            selectinload(Session.blocks).selectinload(SessionBlock.video),
            selectinload(Session.chapters),
            selectinload(Session.lessons),
            selectinload(Session.concepts),
            selectinload(Session.atomic_concepts),
        )
    )
    db_session = result.scalar_one_or_none()
    if db_session is None:
        return None

    material_result = await session.execute(
        select(Material)
        .where(
            Material.course_id == db_session.course_id,
            Material.status == MaterialStatus.published,
        )
        .options(
            selectinload(Material.chapters),
            selectinload(Material.lessons),
            selectinload(Material.concepts),
            selectinload(Material.atomic_concepts),
        )
        .order_by(Material.position.asc())
    )
    course_materials = list(material_result.scalars().all())
    materials = [material for material in course_materials if _is_material_linked_to_session(material, db_session)]

    chapters = sorted(db_session.chapters, key=lambda chapter: (chapter.position, chapter.title))
    lessons = sorted(db_session.lessons, key=lambda lesson: (lesson.position, lesson.title))
    concepts = sorted(db_session.concepts, key=lambda concept: (concept.position, concept.title))
    atomic_concepts = sorted(
        db_session.atomic_concepts,
        key=lambda atomic_concept: (atomic_concept.position, atomic_concept.title),
    )
    blocks = sorted(db_session.blocks, key=lambda block: (block.position, str(block.id)))
    videos = [block.video for block in blocks if block.video is not None]

    return StudentSessionDetailRead(
        course=db_session.course,
        chapters=chapters,
        lessons=lessons,
        session=db_session,
        blocks=blocks,
        materials=materials,
        videos=videos,
        concepts=concepts,
        atomic_concepts=atomic_concepts,
    )


def _is_material_linked_to_session(material: Material, db_session: Session) -> bool:
    if material.session_id == db_session.id:
        return True

    return (
        _intersects_by_id(material.chapters, db_session.chapters)
        or _intersects_by_id(material.lessons, db_session.lessons)
        or _intersects_by_id(material.concepts, db_session.concepts)
        or _intersects_by_id(material.atomic_concepts, db_session.atomic_concepts)
    )


def _intersects_by_id(left: list[object], right: list[object]) -> bool:
    right_ids = {getattr(item, "id") for item in right}
    return any(getattr(item, "id") in right_ids for item in left)
