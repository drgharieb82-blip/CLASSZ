import { api } from "./client";
import type { ChapterRead } from "./chapters";
import type { LessonRead } from "./lessons";
import type { ConceptRead } from "./concepts";
import type { AtomicConceptRead } from "./atomic-concepts";

export type MaterialType = "video" | "pdf" | "image" | "notes" | "attachment" | "document" | "audio";
export type MaterialStatus = "draft" | "published";

export interface MaterialRead {
  id: string;
  public_code: string;
  course_id: string;
  session_id: string | null;
  type: MaterialType;
  title: string;
  description: string | null;
  file_url: string | null;
  video_url: string | null;
  notes_content: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  status: MaterialStatus;
  position: number;
  created_at: string;
  updated_at: string;
  chapters: ChapterRead[];
  lessons: LessonRead[];
  concepts: ConceptRead[];
  atomic_concepts: AtomicConceptRead[];
}

export interface MaterialAccessRead {
  material_id: string;
  access_type: "view" | "download";
  access_url: string;
  expires_at: string;
}

export interface MaterialCreatePayload {
  course_id: string;
  session_id?: string | null;
  type: MaterialType;
  title: string;
  description?: string | null;
  file_url?: string | null;
  video_url?: string | null;
  notes_content?: string | null;
  file_name?: string | null;
  file_size_bytes?: number | null;
  mime_type?: string | null;
  chapter_ids?: string[];
  lesson_ids?: string[];
  concept_ids?: string[];
  atomic_concept_ids?: string[];
}

export interface MaterialUpdatePayload {
  title?: string;
  description?: string | null;
  status?: MaterialStatus;
  file_url?: string | null;
  video_url?: string | null;
  notes_content?: string | null;
  session_id?: string | null;
  file_name?: string | null;
}

export interface MaterialLinksPayload {
  chapter_ids: string[];
  lesson_ids: string[];
  concept_ids: string[];
  atomic_concept_ids: string[];
}

export function createMaterial(data: MaterialCreatePayload): Promise<MaterialRead> {
  return api.post<MaterialRead>("/api/materials", data);
}

export function listMaterials(courseId: string, sessionId?: string): Promise<MaterialRead[]> {
  const query = sessionId
    ? `course_id=${encodeURIComponent(courseId)}&session_id=${encodeURIComponent(sessionId)}`
    : `course_id=${encodeURIComponent(courseId)}`;
  return api.get<MaterialRead[]>(`/api/materials?${query}`);
}

export function updateMaterial(materialId: string, data: MaterialUpdatePayload): Promise<MaterialRead> {
  return api.patch<MaterialRead>(`/api/materials/${encodeURIComponent(materialId)}`, data);
}

export function updateMaterialLinks(materialId: string, data: MaterialLinksPayload): Promise<MaterialRead> {
  return api.put<MaterialRead>(`/api/materials/${encodeURIComponent(materialId)}/links`, data);
}

export function deleteMaterial(materialId: string): Promise<void> {
  return api.delete<void>(`/api/materials/${encodeURIComponent(materialId)}`);
}

export function reorderMaterials(courseId: string, orderedIds: string[]): Promise<MaterialRead[]> {
  return api.post<MaterialRead[]>("/api/materials/reorder", { course_id: courseId, ordered_ids: orderedIds });
}

export function requestMaterialAccess(
  materialId: string,
  accessType: "view" | "download" = "view",
): Promise<MaterialAccessRead> {
  return api.post<MaterialAccessRead>(`/api/materials/${encodeURIComponent(materialId)}/access`, {
    access_type: accessType,
  });
}
