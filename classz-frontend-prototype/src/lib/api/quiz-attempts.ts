import { api } from "./client";
import type { QuizRead } from "./quizzes";

export type QuizAttemptStatus = "IN_PROGRESS" | "SUBMITTED";

export type QuizAnswerRead = {
  id: string;
  attempt_id: string;
  question_id: string;
  answer_data: Record<string, unknown>;
};

export type QuizAttemptRead = {
  id: string;
  quiz_id: string;
  student_id: string;
  started_at: string;
  submitted_at: string | null;
  expires_at: string | null;
  time_limit_minutes: number | null;
  attempt_number: number;
  ip_address: string | null;
  user_agent: string | null;
  device_fingerprint: string | null;
  focus_loss_count: number;
  is_auto_submitted: boolean;
  status: QuizAttemptStatus;
  quiz: QuizRead | null;
  answers: QuizAnswerRead[];
};

export function startQuizAttempt(payload: {
  quiz_id: string;
  time_limit_minutes?: number | null;
  ip_address?: string | null;
  user_agent?: string | null;
  device_fingerprint?: string | null;
}) {
  return api.post<QuizAttemptRead>("/api/quiz-attempts/start", payload);
}

export function saveQuizAnswer(
  attemptId: string,
  payload: { question_id: string; answer_data: Record<string, unknown> },
) {
  return api.post<QuizAnswerRead>(`/api/quiz-attempts/${attemptId}/answer`, payload);
}

export function submitQuizAttempt(attemptId: string) {
  return api.post<QuizAttemptRead>(`/api/quiz-attempts/${attemptId}/submit`);
}

export function getQuizAttempt(attemptId: string) {
  return api.get<QuizAttemptRead>(`/api/quiz-attempts/${attemptId}`);
}

export function listQuizSubmissions(quizId: string) {
  return api.get<QuizAttemptRead[]>(`/api/quiz-attempts/quiz/${quizId}/submissions`);
}

export function getLatestQuizAttempt(quizId: string) {
  return api.get<QuizAttemptRead>(`/api/quiz-attempts/quiz/${quizId}/latest`);
}
