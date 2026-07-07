import { api } from "./client";

export interface ChapterRead {
  id: string;
  public_code: string;
  course_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface ChapterCreatePayload {
  course_id: string;
  title: string;
}

export function createChapter(data: ChapterCreatePayload): Promise<ChapterRead> {
  return api.post<ChapterRead>("/api/chapters", data);
}

export function listChapters(courseId: string): Promise<ChapterRead[]> {
  return api.get<ChapterRead[]>(`/api/chapters?course_id=${encodeURIComponent(courseId)}`);
}
