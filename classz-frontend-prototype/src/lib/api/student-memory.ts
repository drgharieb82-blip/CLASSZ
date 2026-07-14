import { api } from "./client";

export type NoteImportance = "low" | "medium" | "high";
export type NoteSmartType = "chemistry-equation" | "physics-law" | "math-formula" | "definition" | "question" | "general";
export type RevisionCategory = "overdue" | "today" | "tomorrow" | "weak" | "forgotten" | "soon";
export type RevisionPriority = "high" | "medium" | "low";

export interface StudentNoteRead {
  id: string;
  body: string;
  subject_name: string;
  course_name: string;
  session_title: string;
  session_item_title: string;
  session_item_id: string;
  item_type: string;
  tags: string[];
  importance: NoteImportance;
  smart_type: NoteSmartType;
  course_id: string | null;
  session_id: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentNoteCreate {
  body: string;
  subject_name?: string;
  course_name?: string;
  session_title?: string;
  session_item_title?: string;
  session_item_id?: string;
  item_type?: string;
  tags?: string[];
  importance?: NoteImportance;
  smart_type?: NoteSmartType;
  course_id?: string | null;
  session_id?: string | null;
}

export interface StudentNoteUpdate {
  body?: string;
  subject_name?: string;
  course_name?: string;
  session_title?: string;
  session_item_title?: string;
  session_item_id?: string;
  item_type?: string;
  tags?: string[];
  importance?: NoteImportance;
  smart_type?: NoteSmartType;
  pinned?: boolean;
}

export interface StudentQuestionBookmarkRead {
  question_id: string;
  bookmarked: boolean;
  updated_at: string;
}

export interface StudentQuestionBookmarkUpdate {
  bookmarked: boolean;
}

export interface StudentRevisionItemRead {
  id: string;
  question_id: string | null;
  title: string;
  subject_name: string;
  course_name: string;
  chapter_title: string | null;
  concept_title: string | null;
  due_category: RevisionCategory;
  priority: RevisionPriority;
  confidence: number;
  estimated_minutes: number;
  next_review_at: string;
  source: string;
  reason: string;
}

export interface StudentRevisionSummaryRead {
  due_today: number;
  overdue: number;
  weak: number;
  forgotten: number;
  total_minutes: number;
  items: StudentRevisionItemRead[];
}

export interface StudentAssistantConceptRead {
  concept: string;
  score: number;
  last_practiced_at: string | null;
}

export interface StudentAssistantPromptRead {
  title: string;
  prompt: string;
  reason: string;
}

export interface StudentAssistantContextRead {
  overview: string[];
  recommendations: string[];
  weak_concepts: StudentAssistantConceptRead[];
  revision_summary: StudentRevisionSummaryRead;
  recent_notes: StudentNoteRead[];
  recent_bookmarks: StudentRevisionItemRead[];
  quick_prompts: StudentAssistantPromptRead[];
}

export function listMyNotes(): Promise<StudentNoteRead[]> {
  return api.get<StudentNoteRead[]>("/api/student/me/notes");
}

export function createMyNote(payload: StudentNoteCreate): Promise<StudentNoteRead> {
  return api.post<StudentNoteRead>("/api/student/me/notes", payload);
}

export function updateMyNote(noteId: string, payload: StudentNoteUpdate): Promise<StudentNoteRead> {
  return api.patch<StudentNoteRead>(`/api/student/me/notes/${encodeURIComponent(noteId)}`, payload);
}

export function deleteMyNote(noteId: string): Promise<void> {
  return api.delete<void>(`/api/student/me/notes/${encodeURIComponent(noteId)}`);
}

export function getMyRevisionSummary(): Promise<StudentRevisionSummaryRead> {
  return api.get<StudentRevisionSummaryRead>("/api/student/me/revision");
}

export function getMyAssistantContext(): Promise<StudentAssistantContextRead> {
  return api.get<StudentAssistantContextRead>("/api/student/me/assistant-context");
}

export function setMyWrongQuestionBookmark(questionId: string, bookmarked: boolean): Promise<StudentQuestionBookmarkRead> {
  return api.patch<StudentQuestionBookmarkRead>(`/api/student/wrong-questions/${encodeURIComponent(questionId)}/bookmark`, {
    bookmarked,
  });
}
