import { api } from "./client";

// Backend question_bank supports a fixed subset of question types. The
// frontend question editor supports many more (see teacher-question-store.ts)
// — types outside this set have no backend representation and stay local-only.
export type BackendQuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "MULTIPLE_SELECT"
  | "FILL_BLANK"
  | "MATCHING"
  | "ORDERING"
  | "ESSAY";

export type BackendDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface QuestionCategoryRead {
  id: string;
  name: string;
  description: string | null;
}

export interface QuestionChoiceRead {
  id: string;
  question_id: string;
  choice_text: string;
  is_correct: boolean;
  position: number;
}

export interface QuestionChoiceCreatePayload {
  client_id?: string | null;
  choice_text: string;
  is_correct?: boolean;
  position: number;
}

export interface QuestionAcademicNodeRead {
  id: string;
  title: string;
}

export interface QuestionRead {
  id: string;
  category_id: string;
  title: string;
  question_type: BackendQuestionType;
  difficulty: BackendDifficulty;
  explanation: string | null;
  course_id: string | null;
  answer_data_json: Record<string, unknown> | null;
  points: number;
  is_active: boolean;
  created_at: string;
  category: QuestionCategoryRead | null;
  choices: QuestionChoiceRead[];
  media: unknown[];
  tags: { id: string; name: string }[];
  chapters: QuestionAcademicNodeRead[];
  lessons: QuestionAcademicNodeRead[];
  concepts: QuestionAcademicNodeRead[];
  atomic_concepts: QuestionAcademicNodeRead[];
}

export interface QuestionCreatePayload {
  category_id: string;
  title: string;
  question_type: BackendQuestionType;
  difficulty: BackendDifficulty;
  explanation?: string | null;
  course_id?: string | null;
  answer_data_json?: Record<string, unknown> | null;
  points?: number;
  is_active?: boolean;
  chapter_ids?: string[];
  lesson_ids?: string[];
  concept_ids?: string[];
  atomic_concept_ids?: string[];
  choices?: QuestionChoiceCreatePayload[];
}

export function listCategories(): Promise<QuestionCategoryRead[]> {
  return api.get<QuestionCategoryRead[]>("/api/questions/categories");
}

export function createCategory(name: string, description?: string): Promise<QuestionCategoryRead> {
  return api.post<QuestionCategoryRead>("/api/questions/categories", { name, description });
}

/** Categories have no home in the frontend model — teachers don't manage
 * them, they're purely a backend requirement. Reuse "General" for every
 * question rather than surfacing category management in the UI. */
let cachedDefaultCategoryId: string | null = null;

export async function getDefaultCategoryId(): Promise<string> {
  if (cachedDefaultCategoryId) return cachedDefaultCategoryId;
  const categories = await listCategories();
  const existing = categories.find((c) => c.name === "General");
  const category = existing ?? (await createCategory("General", "Default question category"));
  cachedDefaultCategoryId = category.id;
  return category.id;
}

export function listQuestions(): Promise<QuestionRead[]> {
  return api.get<QuestionRead[]>("/api/questions");
}

export function getQuestion(questionId: string): Promise<QuestionRead> {
  return api.get<QuestionRead>(`/api/questions/${encodeURIComponent(questionId)}`);
}

export function createQuestion(data: QuestionCreatePayload): Promise<QuestionRead> {
  return api.post<QuestionRead>("/api/questions", data);
}

export function addQuestionChoice(
  questionId: string,
  data: QuestionChoiceCreatePayload,
): Promise<QuestionChoiceRead> {
  return api.post<QuestionChoiceRead>(`/api/questions/${encodeURIComponent(questionId)}/choices`, data);
}
