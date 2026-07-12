import { api } from "./client";

export interface StudentRosterEntry {
  student_id: string;
  public_code: string;
  full_name: string;
  email: string;
  course_id: string;
  enrolled_at: string;
  progress_percent: number;
  quiz_average: number | null;
  sessions_completed: number;
  sessions_total: number;
  last_activity_at: string | null;
}

export interface StudentProgressEntry {
  student_id: string;
  full_name: string;
  course_id: string;
  sessions_completed: number;
  sessions_total: number;
  progress_percent: number;
  quiz_average: number | null;
  watch_time_minutes: number;
}

export interface AtRiskEntry {
  student_id: string;
  full_name: string;
  course_id: string;
  risk_level: "high" | "medium" | "low" | "none";
  risk_reasons: string[];
  progress_percent: number;
  quiz_average: number | null;
  last_activity_at: string | null;
}

export interface WrongQuestionEntry {
  student_id: string;
  full_name: string;
  question_id: string;
  question_title: string;
  course_id: string;
  course_title: string;
  chapter: string | null;
  concept: string | null;
  atomic_concept: string | null;
  question_type: string;
  difficulty: string;
  retry_count: number;
  last_wrong_at: string | null;
}

export interface ConceptScore {
  concept: string;
  score: number;
  last_practiced_at: string | null;
}

export interface MemoryInsightEntry {
  student_id: string;
  full_name: string;
  strengths: string[];
  weak_concepts: ConceptScore[];
  recommendations: string[];
}

export interface CourseReportSummary {
  course_id: string;
  course_title: string;
  total_students: number;
  active_students: number;
  average_progress_percent: number;
  average_quiz_score: number | null;
  at_risk_count: number;
  certificates_issued: number;
  total_revenue: number;
  pending_payments: number;
}

export interface StudentPodMemberRead {
  student_id: string;
  full_name: string;
  email: string;
}

export interface StudentPodRead {
  id: string;
  course_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  members: StudentPodMemberRead[];
}

export function getRoster(courseId: string): Promise<StudentRosterEntry[]> {
  return api.get<StudentRosterEntry[]>(`/api/students/roster?course_id=${encodeURIComponent(courseId)}`);
}

export function getProgress(courseId: string): Promise<StudentProgressEntry[]> {
  return api.get<StudentProgressEntry[]>(`/api/students/progress?course_id=${encodeURIComponent(courseId)}`);
}

export function getAtRisk(courseId: string): Promise<AtRiskEntry[]> {
  return api.get<AtRiskEntry[]>(`/api/students/at-risk?course_id=${encodeURIComponent(courseId)}`);
}

export function getWrongQuestions(courseId: string, studentId?: string): Promise<WrongQuestionEntry[]> {
  const query = studentId
    ? `course_id=${encodeURIComponent(courseId)}&student_id=${encodeURIComponent(studentId)}`
    : `course_id=${encodeURIComponent(courseId)}`;
  return api.get<WrongQuestionEntry[]>(`/api/students/wrong-questions?${query}`);
}

export function getMemoryInsights(courseId: string, studentId?: string): Promise<MemoryInsightEntry[]> {
  const query = studentId
    ? `course_id=${encodeURIComponent(courseId)}&student_id=${encodeURIComponent(studentId)}`
    : `course_id=${encodeURIComponent(courseId)}`;
  return api.get<MemoryInsightEntry[]>(`/api/students/memory?${query}`);
}

export function getReportSummary(courseId: string): Promise<CourseReportSummary> {
  return api.get<CourseReportSummary>(`/api/students/reports?course_id=${encodeURIComponent(courseId)}`);
}

export function listPods(courseId: string): Promise<StudentPodRead[]> {
  return api.get<StudentPodRead[]>(`/api/students/pods?course_id=${encodeURIComponent(courseId)}`);
}

export function createPod(courseId: string, name: string, description?: string): Promise<StudentPodRead> {
  return api.post<StudentPodRead>("/api/students/pods", { course_id: courseId, name, description });
}

export function updatePod(podId: string, data: { name?: string; description?: string }): Promise<StudentPodRead> {
  return api.patch<StudentPodRead>(`/api/students/pods/${encodeURIComponent(podId)}`, data);
}

export function deletePod(podId: string): Promise<void> {
  return api.delete<void>(`/api/students/pods/${encodeURIComponent(podId)}`);
}

export function addPodMember(podId: string, studentId: string): Promise<StudentPodRead> {
  return api.post<StudentPodRead>(`/api/students/pods/${encodeURIComponent(podId)}/members`, { student_id: studentId });
}

export function removePodMember(podId: string, studentId: string): Promise<void> {
  return api.delete<void>(`/api/students/pods/${encodeURIComponent(podId)}/members/${encodeURIComponent(studentId)}`);
}

// ---------------------------------------------------------------------------
// Parent linking (student side)
// ---------------------------------------------------------------------------

export interface ParentLinkCodeRead {
  code: string;
}

export interface ParentLinkRequestRead {
  id: string;
  parent_id: string;
  parent_full_name: string;
  parent_public_code: string;
  status: "pending" | "active" | "revoked" | "denied";
  requested_at: string;
}

export interface ParentInviteRead {
  id: string;
  invited_email: string;
  status: "pending" | "matched" | "cancelled";
  created_at: string;
  resolved_at: string | null;
}

export function getMyParentLinkCode(): Promise<ParentLinkCodeRead> {
  return api.get<ParentLinkCodeRead>("/api/students/me/parent-link-code");
}

export function regenerateMyParentLinkCode(): Promise<ParentLinkCodeRead> {
  return api.post<ParentLinkCodeRead>("/api/students/me/parent-link-code/regenerate");
}

export function listMyParentLinkRequests(): Promise<ParentLinkRequestRead[]> {
  return api.get<ParentLinkRequestRead[]>("/api/students/me/parent-link-requests");
}

export function approveParentLinkRequest(linkId: string): Promise<ParentLinkRequestRead> {
  return api.post<ParentLinkRequestRead>(`/api/students/me/parent-link-requests/${encodeURIComponent(linkId)}/approve`);
}

export function denyParentLinkRequest(linkId: string): Promise<ParentLinkRequestRead> {
  return api.post<ParentLinkRequestRead>(`/api/students/me/parent-link-requests/${encodeURIComponent(linkId)}/deny`);
}

export function createParentInvite(email: string): Promise<ParentInviteRead> {
  return api.post<ParentInviteRead>("/api/students/me/parent-invites", { email });
}

export function listMyParentInvites(): Promise<ParentInviteRead[]> {
  return api.get<ParentInviteRead[]>("/api/students/me/parent-invites");
}

export function cancelParentInvite(inviteId: string): Promise<ParentInviteRead> {
  return api.post<ParentInviteRead>(`/api/students/me/parent-invites/${encodeURIComponent(inviteId)}/cancel`);
}
