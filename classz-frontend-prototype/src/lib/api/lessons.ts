import { api } from "./client";

export interface LessonRead {
  id: string;
  public_code: string;
  chapter_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface LessonCreatePayload {
  chapter_id: string;
  title: string;
}

export interface LessonUpdatePayload {
  title?: string;
}

export function createLesson(data: LessonCreatePayload): Promise<LessonRead> {
  return api.post<LessonRead>("/api/lessons", data);
}

export function listLessons(chapterId: string): Promise<LessonRead[]> {
  return api.get<LessonRead[]>(`/api/lessons?chapter_id=${encodeURIComponent(chapterId)}`);
}

export function updateLesson(lessonId: string, data: LessonUpdatePayload): Promise<LessonRead> {
  return api.patch<LessonRead>(`/api/lessons/${encodeURIComponent(lessonId)}`, data);
}

export function deleteLesson(lessonId: string): Promise<void> {
  return api.delete<void>(`/api/lessons/${encodeURIComponent(lessonId)}`);
}
