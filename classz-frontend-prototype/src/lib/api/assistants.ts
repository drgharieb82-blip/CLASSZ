import { api } from "./client";

export type AssistantLinkStatus = "pending" | "active" | "revoked" | "denied";
export type AssistantInviteStatus = "pending" | "matched" | "cancelled";

export type AssistantResource =
  | "chapters_lessons"
  | "materials"
  | "sessions"
  | "questions"
  | "quizzes"
  | "homework"
  | "grading"
  | "students_data"
  | "pods"
  | "parent_contacts"
  | "anti_cheating"
  | "quiz_submissions";

export type AssistantAction = "view" | "create" | "edit" | "delete" | "grade";

export interface AssistantPermissionGrant {
  resource: AssistantResource;
  action: AssistantAction;
}

export interface AssistantInviteRead {
  id: string;
  invited_email: string;
  status: AssistantInviteStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface AssistantLinkRead {
  link_id: string;
  assistant_id: string;
  full_name: string;
  public_code: string;
  status: AssistantLinkStatus;
}

export interface AssistantInvitationRead {
  link_id: string;
  teacher_id: string;
  teacher_full_name: string;
  teacher_public_code: string;
  invited_at: string;
}

export interface AssistantTeacherPermissionsRead {
  teacher_id: string;
  teacher_full_name: string;
  permissions: AssistantPermissionGrant[];
}

// ---------------------------------------------------------------------------
// Teacher side
// ---------------------------------------------------------------------------

export function inviteAssistant(email: string): Promise<AssistantInviteRead> {
  return api.post<AssistantInviteRead>("/api/assistants/invite", { email });
}

export function listMyInvites(): Promise<AssistantInviteRead[]> {
  return api.get<AssistantInviteRead[]>("/api/assistants/invites");
}

export function cancelInvite(inviteId: string): Promise<AssistantInviteRead> {
  return api.post<AssistantInviteRead>(`/api/assistants/invites/${encodeURIComponent(inviteId)}/cancel`);
}

export function listMyAssistants(): Promise<AssistantLinkRead[]> {
  return api.get<AssistantLinkRead[]>("/api/assistants/me");
}

export function revokeAssistant(linkId: string): Promise<AssistantLinkRead> {
  return api.post<AssistantLinkRead>(`/api/assistants/${encodeURIComponent(linkId)}/revoke`);
}

export function getAssistantPermissions(linkId: string): Promise<AssistantPermissionGrant[]> {
  return api.get<AssistantPermissionGrant[]>(`/api/assistants/${encodeURIComponent(linkId)}/permissions`);
}

export function updateAssistantPermissions(
  linkId: string,
  grants: AssistantPermissionGrant[],
): Promise<AssistantPermissionGrant[]> {
  return api.put<AssistantPermissionGrant[]>(`/api/assistants/${encodeURIComponent(linkId)}/permissions`, { grants });
}

// ---------------------------------------------------------------------------
// Assistant side
// ---------------------------------------------------------------------------

export function listMyInvitations(): Promise<AssistantInvitationRead[]> {
  return api.get<AssistantInvitationRead[]>("/api/assistants/me/invitations");
}

export function acceptInvitation(linkId: string): Promise<AssistantInvitationRead> {
  return api.post<AssistantInvitationRead>(`/api/assistants/me/invitations/${encodeURIComponent(linkId)}/accept`);
}

export function declineInvitation(linkId: string): Promise<AssistantInvitationRead> {
  return api.post<AssistantInvitationRead>(`/api/assistants/me/invitations/${encodeURIComponent(linkId)}/decline`);
}

export function getMyPermissions(): Promise<AssistantTeacherPermissionsRead[]> {
  return api.get<AssistantTeacherPermissionsRead[]>("/api/assistants/me/permissions");
}
