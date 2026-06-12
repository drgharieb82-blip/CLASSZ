import type { AssignmentSubmission } from "../assignments/api";
import type { QuestionResult } from "../results/api";

export type GradeStatus = "PENDING" | "GRADED" | "RETURNED";

export type ManualGrade = {
  id: string;
  grader_id: string | null;
  student_id: string;
  assignment_submission_id: string | null;
  question_result_id: string | null;
  score: number;
  max_score: number;
  feedback: string | null;
  status: GradeStatus;
  graded_at: string | null;
  assignment_submission?: AssignmentSubmission | null;
  question_result?: QuestionResult | null;
  student_answer?: Record<string, unknown> | null;
};

export type ManualGradeAction = {
  grader_id: string;
  score: number;
  feedback?: string | null;
};

export type ManualGradeReturn = {
  grader_id: string;
  feedback?: string | null;
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

export function listPendingGrades(): Promise<ManualGrade[]> {
  return request<ManualGrade[]>("/api/grading/pending");
}

export function getManualGrade(gradeId: string): Promise<ManualGrade> {
  return request<ManualGrade>(`/api/grading/${gradeId}`);
}

export function gradeManualGrade(gradeId: string, payload: ManualGradeAction): Promise<ManualGrade> {
  return request<ManualGrade>(`/api/grading/${gradeId}/grade`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function returnManualGrade(gradeId: string, payload: ManualGradeReturn): Promise<ManualGrade> {
  return request<ManualGrade>(`/api/grading/${gradeId}/return`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
