export type SubmissionFile = {
  id: string;
  submission_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
};

export type AssignmentSubmission = {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text: string | null;
  status: "SUBMITTED";
  submitted_at: string;
  files: SubmissionFile[];
};

export type Assignment = {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  chapter_id: string | null;
  lesson_id: string | null;
  deadline_at: string | null;
  max_points: number;
  allow_multiple_submissions: boolean;
  created_at: string;
  submissions: AssignmentSubmission[];
};

export type SubmissionFileDraft = {
  file_url: string;
  file_name: string;
  file_size: number;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function listAssignments(): Promise<Assignment[]> {
  return request<Assignment[]>("/api/assignments");
}

export function getAssignment(assignmentId: string): Promise<Assignment> {
  return request<Assignment>(`/api/assignments/${assignmentId}`);
}

export function submitAssignment(
  assignmentId: string,
  payload: { student_id: string; submission_text: string; files: SubmissionFileDraft[] }
): Promise<AssignmentSubmission> {
  return request<AssignmentSubmission>(`/api/assignments/${assignmentId}/submit`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
