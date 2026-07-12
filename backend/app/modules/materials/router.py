from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import (
    assert_can,
    assert_student_enrolled_in_course,
    assert_student_enrolled_in_material,
)
from app.db.session import get_db_session
from app.models.user import Role, User
from app.modules.assistants.models import AssistantAction, AssistantResource
from app.modules.auth.dependencies import get_current_student, get_current_teacher, get_current_user
from app.modules.materials import service
from app.modules.materials.models import MaterialAccessType
from app.modules.materials.schemas import (
    MaterialAccessCreate,
    MaterialAccessRead,
    MaterialCreate,
    MaterialLinksUpdate,
    MaterialRead,
    MaterialReorder,
    MaterialUpdate,
)

router = APIRouter(prefix="/materials", tags=["materials"])

# Matches app/modules/uploads/router.py's UPLOAD_ROOT — local uploaded files
# are served from an authenticated route (see app/main.py), so once a
# student is already authenticated here via the material-access token, the
# file is streamed directly rather than redirected (a 307 redirect would
# otherwise drop the auth needed for the second hop).
_UPLOAD_ROOT = Path(__file__).resolve().parents[3] / "uploads"


async def _assert_owns_material(
    session: AsyncSession, material_id: UUID, current_user: User, *, action: AssistantAction = AssistantAction.EDIT
) -> None:
    material = await service.get_material(session, material_id)
    if material is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    await assert_can(
        session, current_user, material.course_id, AssistantResource.MATERIALS, action, not_found_detail="Material not found"
    )


@router.get("", response_model=list[MaterialRead])
async def list_materials(
    course_id: str = Query(...),
    session_id: UUID | None = Query(default=None),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> list[MaterialRead]:
    try:
        parsed_id = UUID(course_id)
    except ValueError:
        return []
    await assert_student_enrolled_in_course(session, parsed_id, current_user)
    return await service.list_materials(
        session,
        course_id=parsed_id,
        session_id=session_id,
        published_only=current_user.role == Role.STUDENT,
    )


@router.post("", response_model=MaterialRead, status_code=status.HTTP_201_CREATED)
async def create_material(
    payload: MaterialCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> MaterialRead:
    await assert_can(session, current_user, payload.course_id, AssistantResource.MATERIALS, AssistantAction.CREATE)
    return await service.create_material(session, payload)


@router.post("/reorder", response_model=list[MaterialRead])
async def reorder_materials(
    payload: MaterialReorder,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> list[MaterialRead]:
    await assert_can(session, current_user, payload.course_id, AssistantResource.MATERIALS, AssistantAction.EDIT)
    return await service.reorder_materials(session, payload)


@router.post("/{material_id}/access", response_model=MaterialAccessRead)
async def create_material_access(
    material_id: UUID,
    payload: MaterialAccessCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> MaterialAccessRead:
    await assert_student_enrolled_in_material(session, material_id, current_user)
    return await service.create_material_access(
        session,
        material_id,
        current_user.id,
        payload.access_type,
    )


@router.get("/access/{token}")
async def open_material_access(
    token: str,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
):
    log = await service.resolve_material_access(session, token, current_user.id)
    if log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Access link expired or invalid")
    target = await service.get_material_access_target(session, log.material_id, current_user.id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not available")

    if target.startswith("/uploads/"):
        # Serve the file directly — the student is already authenticated by
        # this endpoint's own token, so there's no second auth hop needed
        # (a redirect to the now auth-gated /uploads/material/... route
        # would otherwise 401, since browsers don't forward auth on redirect).
        relative = target.removeprefix("/uploads/")
        resolved_root = _UPLOAD_ROOT.resolve()
        candidate = (_UPLOAD_ROOT / relative).resolve()
        if candidate != resolved_root and resolved_root not in candidate.parents:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not available")
        if not candidate.is_file():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not available")
        return FileResponse(str(candidate))

    return RedirectResponse(url=target, status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@router.get("/{material_id}", response_model=MaterialRead)
async def get_material(
    material_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> MaterialRead:
    await assert_student_enrolled_in_material(session, material_id, current_user)
    material = await service.get_material(
        session,
        material_id,
        published_only=current_user.role == Role.STUDENT,
    )
    if material is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    return material


@router.patch("/{material_id}", response_model=MaterialRead)
async def update_material(
    material_id: UUID,
    payload: MaterialUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> MaterialRead:
    await _assert_owns_material(session, material_id, current_user)
    material = await service.update_material(session, material_id, payload)
    if material is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    return material


@router.put("/{material_id}/links", response_model=MaterialRead)
async def update_material_links(
    material_id: UUID,
    payload: MaterialLinksUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> MaterialRead:
    await _assert_owns_material(session, material_id, current_user)
    material = await service.update_material_links(session, material_id, payload)
    if material is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    return material


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_material(
    material_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> None:
    await _assert_owns_material(session, material_id, current_user, action=AssistantAction.DELETE)
    deleted = await service.delete_material(session, material_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
