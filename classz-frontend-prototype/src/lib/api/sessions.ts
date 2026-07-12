import { api } from "./client";
import type { ChapterRead } from "./chapters";

export type SessionStatus = "draft" | "published" | "archived";

export interface SessionRead {
  id: string;
  public_code: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
  is_free_preview: boolean;
  release_at: string | null;
  hide_at: string | null;
  requires_previous_completion: boolean;
  is_locked: boolean;
  status: SessionStatus;
  created_at: string;
  chapters: ChapterRead[];
}

export interface SessionCreatePayload {
  course_id: string;
  title: string;
  description?: string | null;
  is_free_preview?: boolean;
  release_at?: string | null;
  hide_at?: string | null;
  requires_previous_completion?: boolean;
  is_locked?: boolean;
  chapter_ids?: string[];
}

export interface SessionUpdatePayload {
  title?: string;
  description?: string | null;
  is_free_preview?: boolean;
  release_at?: string | null;
  hide_at?: string | null;
  requires_previous_completion?: boolean;
  is_locked?: boolean;
  status?: SessionStatus;
}

export function createSession(data: SessionCreatePayload): Promise<SessionRead> {
  return api.post<SessionRead>("/api/sessions", data);
}

export function listSessions(courseId: string): Promise<SessionRead[]> {
  return api.get<SessionRead[]>(`/api/sessions?course_id=${encodeURIComponent(courseId)}`);
}

export function updateSession(sessionId: string, data: SessionUpdatePayload): Promise<SessionRead> {
  return api.patch<SessionRead>(`/api/sessions/${encodeURIComponent(sessionId)}`, data);
}

export function deleteSession(sessionId: string): Promise<void> {
  return api.delete<void>(`/api/sessions/${encodeURIComponent(sessionId)}`);
}
