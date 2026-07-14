import { api } from "./client";

export interface AtomicConceptRead {
  id: string;
  public_code: string;
  concept_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface AtomicConceptCreatePayload {
  concept_id: string;
  title: string;
}

export interface AtomicConceptUpdatePayload {
  title?: string;
}

export function createAtomicConcept(data: AtomicConceptCreatePayload): Promise<AtomicConceptRead> {
  return api.post<AtomicConceptRead>("/api/atomic-concepts", data);
}

export function listAtomicConcepts(conceptId: string): Promise<AtomicConceptRead[]> {
  return api.get<AtomicConceptRead[]>(`/api/atomic-concepts?concept_id=${encodeURIComponent(conceptId)}`);
}

export function updateAtomicConcept(atomicConceptId: string, data: AtomicConceptUpdatePayload): Promise<AtomicConceptRead> {
  return api.patch<AtomicConceptRead>(`/api/atomic-concepts/${encodeURIComponent(atomicConceptId)}`, data);
}

export function deleteAtomicConcept(atomicConceptId: string): Promise<void> {
  return api.delete<void>(`/api/atomic-concepts/${encodeURIComponent(atomicConceptId)}`);
}
