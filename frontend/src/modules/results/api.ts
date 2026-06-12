import type { Question } from "../question-bank/api";
import type { QuizAttempt } from "../quiz-player/api";

export type QuestionResult = {
  id: string;
  quiz_result_id: string;
  question_id: string;
  earned_points: number;
  max_points: number;
  is_correct: boolean;
  pending_manual_review: boolean;
  question?: Question | null;
};

export type QuizResult = {
  id: string;
  attempt_id: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  graded_at: string;
  attempt?: QuizAttempt | null;
  question_results: QuestionResult[];
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

export function getQuizResult(attemptId: string): Promise<QuizResult> {
  return request<QuizResult>(`/api/results/${attemptId}`);
}

export function gradeQuizAttempt(attemptId: string): Promise<QuizResult> {
  return request<QuizResult>(`/api/results/grade/${attemptId}`, { method: "POST" });
}
