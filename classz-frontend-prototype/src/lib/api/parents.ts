import { api } from "./client";
import type { StudentDashboardSummaryRead } from "./student";
import type { CourseProgressRead, StudentProgressSummaryRead } from "./progress";
import type { AssignmentRead } from "./assignments";

export type ParentAlertStatus = "none" | "sent" | "urgent";

export interface ParentContactRead {
  id: string;
  student_id: string;
  student_name: string;
  name: string;
  relation: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  last_contact_at: string | null;
  alert_status: ParentAlertStatus;
  created_at: string;
  updated_at: string;
}

export interface ParentContactCreatePayload {
  student_id: string;
  name: string;
  relation: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
}

export interface ParentContactUpdatePayload {
  name?: string;
  relation?: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  last_contact_at?: string | null;
  alert_status?: ParentAlertStatus;
}

export function listParentContacts(courseId: string): Promise<ParentContactRead[]> {
  return api.get<ParentContactRead[]>(`/api/parents?course_id=${encodeURIComponent(courseId)}`);
}

export function createParentContact(data: ParentContactCreatePayload): Promise<ParentContactRead> {
  return api.post<ParentContactRead>("/api/parents", data);
}

export function updateParentContact(contactId: string, data: ParentContactUpdatePayload): Promise<ParentContactRead> {
  return api.patch<ParentContactRead>(`/api/parents/${encodeURIComponent(contactId)}`, data);
}

export function deleteParentContact(contactId: string): Promise<void> {
  return api.delete<void>(`/api/parents/${encodeURIComponent(contactId)}`);
}

// ---------------------------------------------------------------------------
// Parent<->student linking (parent side)
// ---------------------------------------------------------------------------

export type ParentLinkStatus = "pending" | "active" | "revoked" | "denied";

export interface LinkedChildRead {
  link_id: string;
  student_id: string;
  full_name: string;
  public_code: string;
  avatar: string | null;
  status: ParentLinkStatus;
}

export interface LinkInvitationRead {
  link_id: string;
  student_id: string;
  student_full_name: string;
  student_public_code: string;
  requested_at: string;
}

export function submitParentLinkRequest(code: string): Promise<LinkedChildRead> {
  return api.post<LinkedChildRead>("/api/parents/me/link-requests", { code });
}

export function listLinkedChildren(): Promise<LinkedChildRead[]> {
  return api.get<LinkedChildRead[]>("/api/parents/me/children");
}

export function listLinkInvitations(): Promise<LinkInvitationRead[]> {
  return api.get<LinkInvitationRead[]>("/api/parents/me/link-invitations");
}

export function acceptLinkInvitation(linkId: string): Promise<LinkInvitationRead> {
  return api.post<LinkInvitationRead>(`/api/parents/me/link-invitations/${encodeURIComponent(linkId)}/accept`);
}

export function declineLinkInvitation(linkId: string): Promise<LinkInvitationRead> {
  return api.post<LinkInvitationRead>(`/api/parents/me/link-invitations/${encodeURIComponent(linkId)}/decline`);
}

// ---------------------------------------------------------------------------
// Parent views of a linked child
// ---------------------------------------------------------------------------

export function getChildDashboard(studentId: string): Promise<StudentDashboardSummaryRead> {
  return api.get<StudentDashboardSummaryRead>(`/api/parents/me/children/${encodeURIComponent(studentId)}/dashboard`);
}

export function getChildProgress(studentId: string): Promise<StudentProgressSummaryRead> {
  return api.get<StudentProgressSummaryRead>(`/api/parents/me/children/${encodeURIComponent(studentId)}/progress`);
}

/** Named "attendance" in the UI, but backed by session-completion/progress
 * data keyed by course id — there is no roll-call attendance system. */
export function getChildAttendance(studentId: string): Promise<Record<string, CourseProgressRead>> {
  return api.get<Record<string, CourseProgressRead>>(`/api/parents/me/children/${encodeURIComponent(studentId)}/attendance`);
}

export function getChildHomework(studentId: string): Promise<AssignmentRead[]> {
  return api.get<AssignmentRead[]>(`/api/parents/me/children/${encodeURIComponent(studentId)}/homework`);
}

// ---------------------------------------------------------------------------
// Parent requests (lightweight one-message-one-reply tickets)
// ---------------------------------------------------------------------------

export type ParentRequestTargetType = "teacher" | "platform" | "child";
export type ParentRequestStatus = "open" | "replied" | "closed";

export interface ParentRequestCreatePayload {
  student_id: string;
  target_type: ParentRequestTargetType;
  teacher_id?: string | null;
  course_id?: string | null;
  subject: string;
  body: string;
}

export interface ParentRequestRead {
  id: string;
  parent_id: string;
  student_id: string;
  target_type: ParentRequestTargetType;
  teacher_id: string | null;
  course_id: string | null;
  subject: string;
  body: string;
  status: ParentRequestStatus;
  reply_body: string | null;
  replied_by: string | null;
  replied_at: string | null;
  created_at: string;
}

export function createParentRequest(payload: ParentRequestCreatePayload): Promise<ParentRequestRead> {
  return api.post<ParentRequestRead>("/api/parents/me/requests", payload);
}

export function listMyParentRequests(): Promise<ParentRequestRead[]> {
  return api.get<ParentRequestRead[]>("/api/parents/me/requests");
}

export function closeParentRequest(requestId: string): Promise<ParentRequestRead> {
  return api.post<ParentRequestRead>(`/api/parents/me/requests/${encodeURIComponent(requestId)}/close`);
}

export function replyToParentRequest(requestId: string, replyBody: string): Promise<ParentRequestRead> {
  return api.post<ParentRequestRead>(`/api/parents/requests/${encodeURIComponent(requestId)}/reply`, {
    reply_body: replyBody,
  });
}
