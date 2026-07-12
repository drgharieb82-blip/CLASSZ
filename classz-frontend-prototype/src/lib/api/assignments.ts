import { api } from "./client";

export interface AssignmentSubmissionFileRead {
  id: string;
  submission_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
}

export interface AssignmentSubmissionRead {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text: string | null;
  status: "SUBMITTED" | "GRADED" | "RETURNED";
  submitted_at: string;
  files: AssignmentSubmissionFileRead[];
}

export interface AssignmentRead {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  chapter_id: string | null;
  session_id: string | null;
  deadline_at: string | null;
  max_points: number;
  allow_multiple_submissions: boolean;
  created_at: string;
  submissions: AssignmentSubmissionRead[];
}

export interface AssignmentCreatePayload {
  title: string;
  description?: string | null;
  course_id: string;
  chapter_id?: string | null;
  session_id?: string | null;
  deadline_at?: string | null;
  max_points?: number;
  allow_multiple_submissions?: boolean;
}

export function listAssignments(): Promise<AssignmentRead[]> {
  return api.get<AssignmentRead[]>("/api/assignments");
}

export function getAssignment(assignmentId: string): Promise<AssignmentRead> {
  return api.get<AssignmentRead>(`/api/assignments/${encodeURIComponent(assignmentId)}`);
}

export function createAssignment(data: AssignmentCreatePayload): Promise<AssignmentRead> {
  return api.post<AssignmentRead>("/api/assignments", data);
}

export interface AssignmentSubmissionPayload {
  submission_text?: string | null;
}

export function submitAssignment(
  assignmentId: string,
  data: AssignmentSubmissionPayload,
): Promise<AssignmentSubmissionRead> {
  return api.post<AssignmentSubmissionRead>(
    `/api/assignments/${encodeURIComponent(assignmentId)}/submit`,
    data,
  );
}
