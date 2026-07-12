from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.user import User
from app.modules.assistants import service
from app.modules.assistants.schemas import (
    AssistantInvitationRead,
    AssistantInviteCreate,
    AssistantInviteRead,
    AssistantLinkRead,
    AssistantPermissionGrant,
    AssistantPermissionsUpdate,
    AssistantTeacherPermissionsRead,
)
from app.modules.auth.dependencies import get_current_assistant, get_current_teacher

router = APIRouter(prefix="/assistants", tags=["assistants"])


@router.post("/invite", response_model=AssistantInviteRead, status_code=status.HTTP_201_CREATED)
async def invite_assistant(
    payload: AssistantInviteCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> AssistantInviteRead:
    return await service.invite_assistant(session, current_user.id, payload.email)


@router.get("/invites", response_model=list[AssistantInviteRead])
async def list_my_invites(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> list[AssistantInviteRead]:
    return await service.list_my_invites(session, current_user.id)


@router.post("/invites/{invite_id}/cancel", response_model=AssistantInviteRead)
async def cancel_invite(
    invite_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> AssistantInviteRead:
    invite = await service.cancel_invite(session, current_user.id, invite_id)
    if invite is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")
    return invite


@router.get("/me", response_model=list[AssistantLinkRead])
async def list_my_assistants(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> list[AssistantLinkRead]:
    return await service.list_my_assistants(session, current_user.id)


@router.post("/{link_id}/revoke", response_model=AssistantLinkRead)
async def revoke_assistant(
    link_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> AssistantLinkRead:
    link = await service.revoke_link(session, current_user.id, link_id)
    if link is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assistant link not found")
    assistant = await session.get(User, link.assistant_id)
    return AssistantLinkRead(
        link_id=link.id,
        assistant_id=link.assistant_id,
        full_name=assistant.full_name if assistant else "",
        public_code=assistant.public_code if assistant else "",
        status=link.status.value,
    )


@router.put("/{link_id}/permissions", response_model=list[AssistantPermissionGrant])
async def update_assistant_permissions(
    link_id: UUID,
    payload: AssistantPermissionsUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> list[AssistantPermissionGrant]:
    grants = await service.update_permissions(session, current_user.id, link_id, payload.grants)
    if grants is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assistant link not found")
    return grants


@router.get("/{link_id}/permissions", response_model=list[AssistantPermissionGrant])
async def get_assistant_permissions(
    link_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> list[AssistantPermissionGrant]:
    grants = await service.get_link_permissions(session, current_user.id, link_id)
    if grants is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assistant link not found")
    return grants


@router.get("/me/invitations", response_model=list[AssistantInvitationRead])
async def list_my_invitations(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_assistant),
) -> list[AssistantInvitationRead]:
    return await service.list_my_invitations(session, current_user.id)


@router.post("/me/invitations/{link_id}/accept", response_model=AssistantInvitationRead)
async def accept_invitation(
    link_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_assistant),
) -> AssistantInvitationRead:
    link = await service.decide_invitation(session, current_user.id, link_id, accept=True)
    if link is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    teacher = await session.get(User, link.teacher_id)
    return AssistantInvitationRead(
        link_id=link.id,
        teacher_id=link.teacher_id,
        teacher_full_name=teacher.full_name if teacher else "",
        teacher_public_code=teacher.public_code if teacher else "",
        invited_at=link.invited_at,
    )


@router.post("/me/invitations/{link_id}/decline", response_model=AssistantInvitationRead)
async def decline_invitation(
    link_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_assistant),
) -> AssistantInvitationRead:
    link = await service.decide_invitation(session, current_user.id, link_id, accept=False)
    if link is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    teacher = await session.get(User, link.teacher_id)
    return AssistantInvitationRead(
        link_id=link.id,
        teacher_id=link.teacher_id,
        teacher_full_name=teacher.full_name if teacher else "",
        teacher_public_code=teacher.public_code if teacher else "",
        invited_at=link.invited_at,
    )


@router.get("/me/permissions", response_model=list[AssistantTeacherPermissionsRead])
async def get_my_permissions(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_assistant),
) -> list[AssistantTeacherPermissionsRead]:
    return await service.get_my_permissions(session, current_user.id)
