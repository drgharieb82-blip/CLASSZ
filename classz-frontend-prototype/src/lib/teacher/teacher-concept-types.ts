/**
 * CLASSZ Concept & Atomic Concept Types
 *
 * Structural entities for organizing knowledge within courses.
 * Types only for Phase A — full CRUD store in Phase D.
 */

export type ConceptStatus = "draft" | "published";

export interface TeacherConcept {
  id: string;
  publicCode: string;
  courseId: string;
  chapterIds: string[];
  lessonIds: string[];
  title: string;
  description: string;
  parentConceptId?: string;
  status: ConceptStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherAtomicConcept {
  id: string;
  publicCode: string;
  courseId: string;
  conceptId: string;
  chapterIds: string[];
  lessonIds: string[];
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  status: ConceptStatus;
  createdAt: string;
  updatedAt: string;
}
