export type QuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "MULTIPLE_SELECT"
  | "SHORT_ANSWER"
  | "FILL_BLANK"
  | "MATCHING"
  | "ORDERING"
  | "ESSAY";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type MediaType = "IMAGE" | "DIAGRAM" | "EQUATION_IMAGE" | "ATTACHMENT" | "PDF" | "AUDIO" | "VIDEO";
export type QuestionMediaPurpose = "question" | "choice" | "explanation";

export type QuestionCategory = {
  id: string;
  name: string;
  description: string | null;
};

export type QuestionTag = {
  id: string;
  name: string;
};

export type QuestionChoice = {
  id: string;
  question_id: string;
  choice_text: string;
  is_correct: boolean;
  position: number;
};

export type QuestionMedia = {
  id: string;
  question_id: string;
  choice_id: string | null;
  file_url: string;
  media_type: MediaType;
  purpose: QuestionMediaPurpose;
  caption: string | null;
  position: number;
  created_at: string;
};

export type QuestionStats = {
  question_id: string;
  times_used: number;
  correct_percentage: number;
  wrong_percentage: number;
  difficulty_index: number;
  discrimination_index: number;
  average_time_seconds: number;
  updated_at: string;
};

export type QuestionConceptMap = {
  id: string;
  question_id: string;
  course_id: string | null;
  chapter_id: string | null;
  lesson_id: string | null;
  concept_id: string;
  weight: number;
  created_at: string;
};

export type Question = {
  id: string;
  category_id: string;
  title: string;
  question_type: QuestionType;
  difficulty: Difficulty;
  explanation: string | null;
  correct_answer: string | null;
  source: string | null;
  bloom_level: string | null;
  thinking_skill: string | null;
  estimated_time_seconds: number | null;
  common_mistakes: string[];
  keywords: string[];
  course_id: string | null;
  chapter_id: string | null;
  lesson_id: string | null;
  version_number: number;
  deleted_at: string | null;
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: QuestionCategory | null;
  choices: QuestionChoice[];
  media: QuestionMedia[];
  tags: QuestionTag[];
  concept_maps: QuestionConceptMap[];
  stats: QuestionStats | null;
};

export type QuestionCreatePayload = {
  category_id?: string | null;
  category_name?: string | null;
  title: string;
  question_type: QuestionType;
  difficulty: Difficulty;
  explanation?: string | null;
  correct_answer?: string | null;
  source?: string | null;
  bloom_level?: string | null;
  thinking_skill?: string | null;
  estimated_time_seconds?: number | null;
  common_mistakes?: string[];
  keywords?: string[];
  course_id?: string | null;
  chapter_id?: string | null;
  lesson_id?: string | null;
  concept_ids?: string[];
  choices?: Array<{ choice_text: string; is_correct: boolean; position: number }>;
  tags?: string[];
  points?: number;
  is_active?: boolean;
};

export type ImportJob = {
  id: string;
  filename: string;
  source_type: "csv" | "excel" | "json";
  status: "uploaded" | "previewed" | "committed" | "failed";
  raw_rows: Record<string, unknown>[];
  preview_rows: Record<string, unknown>[];
  created_question_ids: string[];
  created_at: string;
  updated_at: string;
  errors: Array<{ id: string; row_number: number; field_name: string | null; message: string }>;
  summary: {
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    committed_rows: number;
    skipped_rows: number;
  } | null;
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function listQuestions(): Promise<Question[]> {
  return request<Question[]>("/api/questions");
}

export function searchQuestions(params: {
  q?: string;
  difficulty?: Difficulty | "ALL";
  question_type?: QuestionType | "ALL";
  tags?: string[];
}): Promise<Question[]> {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.difficulty && params.difficulty !== "ALL") searchParams.set("difficulty", params.difficulty);
  if (params.question_type && params.question_type !== "ALL") searchParams.set("question_type", params.question_type);
  params.tags?.forEach((tag) => searchParams.append("tags", tag));
  const suffix = searchParams.toString();
  return request<Question[]>(`/api/questions/search${suffix ? `?${suffix}` : ""}`);
}

export function getQuestion(questionId: string): Promise<Question> {
  return request<Question>(`/api/questions/${questionId}`);
}

export function createQuestion(payload: QuestionCreatePayload): Promise<Question> {
  return request<Question>("/api/questions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getQuestionStats(questionId: string): Promise<QuestionStats> {
  return request<QuestionStats>(`/api/questions/${questionId}/stats`);
}

export function listQuestionMedia(questionId: string): Promise<QuestionMedia[]> {
  return request<QuestionMedia[]>(`/api/questions/${questionId}/media`);
}

export function addQuestionMedia(
  questionId: string,
  payload: { file_url: string; media_type: MediaType; caption?: string | null; position?: number }
): Promise<QuestionMedia> {
  return request<QuestionMedia>(`/api/questions/${questionId}/media`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadQuestionImport(file: File): Promise<{ job_id: string; total_rows: number }> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/api/question-import/upload`, { method: "POST", body: formData });
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
  return response.json() as Promise<{ job_id: string; total_rows: number }>;
}

export function previewQuestionImport(jobId: string): Promise<{ job: ImportJob }> {
  return request<{ job: ImportJob }>("/api/question-import/preview", {
    method: "POST",
    body: JSON.stringify({ job_id: jobId }),
  });
}

export function commitQuestionImport(jobId: string): Promise<{ job: ImportJob }> {
  return request<{ job: ImportJob }>("/api/question-import/commit", {
    method: "POST",
    body: JSON.stringify({ job_id: jobId }),
  });
}

export function listQuestionImportHistory(): Promise<ImportJob[]> {
  return request<ImportJob[]>("/api/question-import/history");
}

export function deleteQuestionMedia(mediaId: string): Promise<void> {
  return request<void>(`/api/questions/media/${mediaId}`, { method: "DELETE" });
}

export function formatQuestionType(questionType: QuestionType): string {
  return questionType
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
