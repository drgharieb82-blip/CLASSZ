export type QuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "MULTIPLE_SELECT"
  | "FILL_BLANK"
  | "MATCHING"
  | "ORDERING"
  | "ESSAY";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type MediaType = "IMAGE" | "PDF" | "AUDIO" | "VIDEO";

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
  file_url: string;
  media_type: MediaType;
  caption: string | null;
  position: number;
  created_at: string;
};

export type Question = {
  id: string;
  category_id: string;
  title: string;
  question_type: QuestionType;
  difficulty: Difficulty;
  explanation: string | null;
  points: number;
  is_active: boolean;
  created_at: string;
  category?: QuestionCategory | null;
  choices: QuestionChoice[];
  media: QuestionMedia[];
  tags: QuestionTag[];
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

export function getQuestion(questionId: string): Promise<Question> {
  return request<Question>(`/api/questions/${questionId}`);
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

export function deleteQuestionMedia(mediaId: string): Promise<void> {
  return request<void>(`/api/questions/media/${mediaId}`, { method: "DELETE" });
}

export function formatQuestionType(questionType: QuestionType): string {
  return questionType
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
