import { api } from "./client";

export interface ConceptRead {
  id: string;
  public_code: string;
  lesson_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface ConceptCreatePayload {
  lesson_id: string;
  title: string;
}

export interface ConceptUpdatePayload {
  title?: string;
}

export function createConcept(data: ConceptCreatePayload): Promise<ConceptRead> {
  return api.post<ConceptRead>("/api/concepts", data);
}

export function listConcepts(lessonId: string): Promise<ConceptRead[]> {
  return api.get<ConceptRead[]>(`/api/concepts?lesson_id=${encodeURIComponent(lessonId)}`);
}

export function updateConcept(conceptId: string, data: ConceptUpdatePayload): Promise<ConceptRead> {
  return api.patch<ConceptRead>(`/api/concepts/${encodeURIComponent(conceptId)}`, data);
}

export function deleteConcept(conceptId: string): Promise<void> {
  return api.delete<void>(`/api/concepts/${encodeURIComponent(conceptId)}`);
}
