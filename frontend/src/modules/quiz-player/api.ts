import type { Quiz } from "../quizzes/api";

export type QuizAttemptStatus = "IN_PROGRESS" | "SUBMITTED";

export type QuizAnswer = {
  id: string;
  attempt_id: string;
  question_id: string;
  answer_data: Record<string, unknown>;
};

export type QuizAttempt = {
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
  quiz?: Quiz | null;
  answers: QuizAnswer[];
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

export function getQuizAttempt(attemptId: string): Promise<QuizAttempt> {
  return request<QuizAttempt>(`/api/quiz-attempts/${attemptId}`);
}

export function startQuizAttempt(payload: {
  quiz_id: string;
  student_id: string;
  time_limit_minutes?: number;
  ip_address?: string | null;
  user_agent?: string | null;
  device_fingerprint?: string | null;
}): Promise<QuizAttempt> {
  return request<QuizAttempt>("/api/quiz-attempts/start", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveQuizAnswer(
  attemptId: string,
  payload: { question_id: string; answer_data: Record<string, unknown> }
): Promise<QuizAnswer> {
  return request<QuizAnswer>(`/api/quiz-attempts/${attemptId}/answer`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function submitQuizAttempt(attemptId: string): Promise<QuizAttempt> {
  return request<QuizAttempt>(`/api/quiz-attempts/${attemptId}/submit`, { method: "POST" });
}
