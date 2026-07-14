import { api } from "./client";
import type { QuizAttemptRead } from "./quiz-attempts";
import type { QuestionRead } from "./quizzes";

export type QuestionResultRead = {
  id: string;
  quiz_result_id: string;
  question_id: string;
  earned_points: number;
  max_points: number;
  is_correct: boolean;
  pending_manual_review: boolean;
  question: QuestionRead | null;
};

export type QuizResultRead = {
  id: string;
  attempt_id: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  graded_at: string;
  attempt: QuizAttemptRead | null;
  question_results: QuestionResultRead[];
};

export function getQuizResult(attemptId: string) {
  return api.get<QuizResultRead>(`/api/results/${attemptId}`);
}
