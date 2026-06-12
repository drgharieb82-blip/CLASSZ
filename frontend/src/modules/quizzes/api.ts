import type { Question } from "../question-bank/api";

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  question_id: string;
  position: number;
  points: number;
  question?: Question | null;
};

export type Quiz = {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  chapter_id: string | null;
  lesson_id: string | null;
  duration_minutes: number;
  passing_score: number;
  is_published: boolean;
  created_at: string;
  questions: QuizQuestion[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function listQuizzes(): Promise<Quiz[]> {
  return request<Quiz[]>("/api/quizzes");
}

export function getQuiz(quizId: string): Promise<Quiz> {
  return request<Quiz>(`/api/quizzes/${quizId}`);
}
