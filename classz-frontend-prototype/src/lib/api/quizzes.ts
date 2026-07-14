import { api } from "./client";

export type QuestionChoiceRead = {
  id: string;
  question_id: string;
  choice_text: string;
  is_correct: boolean;
  position: number;
};

export type QuestionRead = {
  id: string;
  title: string;
  question_type:
    | "MCQ"
    | "TRUE_FALSE"
    | "MULTIPLE_SELECT"
    | "FILL_BLANK"
    | "MATCHING"
    | "ORDERING"
    | "ESSAY";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  explanation: string | null;
  points: number;
  is_active: boolean;
  choices: QuestionChoiceRead[];
};

export type QuizQuestionRead = {
  id: string;
  quiz_id: string;
  question_id: string;
  position: number;
  points: number;
  question: QuestionRead | null;
};

export type QuizRead = {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  chapter_id: string | null;
  session_id: string | null;
  duration_minutes: number;
  passing_score: number;
  is_published: boolean;
  created_at: string;
  questions: QuizQuestionRead[];
};

export interface QuizCreatePayload {
  title: string;
  description?: string | null;
  course_id: string;
  chapter_id?: string | null;
  session_id?: string | null;
  duration_minutes?: number;
  passing_score?: number;
  is_published?: boolean;
}

export interface QuizQuestionCreatePayload {
  question_id: string;
  position: number;
  points?: number;
}

export function listQuizzes(): Promise<QuizRead[]> {
  return api.get<QuizRead[]>("/api/quizzes");
}

export function getQuiz(quizId: string) {
  return api.get<QuizRead>(`/api/quizzes/${quizId}`);
}

export function createQuiz(data: QuizCreatePayload): Promise<QuizRead> {
  return api.post<QuizRead>("/api/quizzes", data);
}

export function addQuizQuestion(quizId: string, data: QuizQuestionCreatePayload): Promise<QuizQuestionRead> {
  return api.post<QuizQuestionRead>(`/api/quizzes/${encodeURIComponent(quizId)}/questions`, data);
}
