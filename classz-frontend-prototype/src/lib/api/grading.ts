import { api } from "./client";
import type { AssignmentSubmissionRead } from "./assignments";

export interface QuestionResultRead {
  id: string;
  quiz_result_id: string;
  question_id: string;
  earned_points: number;
  max_points: number;
  is_correct: boolean;
  pending_manual_review: boolean;
}

export interface ManualGradeRead {
  id: string;
  grader_id: string | null;
  student_id: string;
  assignment_submission_id: string | null;
  question_result_id: string | null;
  score: number;
  max_score: number;
  feedback: string | null;
  status: "PENDING" | "GRADED" | "RETURNED";
  graded_at: string | null;
  assignment_submission: AssignmentSubmissionRead | null;
  question_result: QuestionResultRead | null;
}

export interface ManualGradeActionPayload {
  score: number;
  feedback?: string | null;
}

export interface ManualGradeReturnPayload {
  feedback?: string | null;
}

export function listPendingGrades(): Promise<ManualGradeRead[]> {
  return api.get<ManualGradeRead[]>("/api/grading/pending");
}

export function listAllGrades(): Promise<ManualGradeRead[]> {
  return api.get<ManualGradeRead[]>("/api/grading");
}

export function getManualGrade(gradeId: string): Promise<ManualGradeRead> {
  return api.get<ManualGradeRead>(`/api/grading/${encodeURIComponent(gradeId)}`);
}

export function gradeManualGrade(gradeId: string, data: ManualGradeActionPayload): Promise<ManualGradeRead> {
  // grader_id is set server-side from the authenticated user; the field
  // still exists on the backend schema so it's included here as a
  // placeholder the server overwrites.
  return api.post<ManualGradeRead>(`/api/grading/${encodeURIComponent(gradeId)}/grade`, {
    grader_id: "00000000-0000-0000-0000-000000000000",
    ...data,
  });
}

export function returnManualGrade(gradeId: string, data: ManualGradeReturnPayload): Promise<ManualGradeRead> {
  return api.post<ManualGradeRead>(`/api/grading/${encodeURIComponent(gradeId)}/return`, {
    grader_id: "00000000-0000-0000-0000-000000000000",
    ...data,
  });
}
