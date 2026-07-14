import { create } from "zustand";
import {
  createConcept as createConceptApi,
  listConcepts as listConceptsApi,
  updateConcept as updateConceptApi,
  deleteConcept as deleteConceptApi,
  type ConceptRead,
} from "@/lib/api/concepts";
import { ApiError } from "@/lib/api/client";

/** Academic Domain: Course -> Chapter -> Lesson -> Concept -> Atomic Concept. */
export interface TeacherConcept {
  id: string;
  publicCode: string;
  lessonId: string;
  title: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateConceptData = Pick<TeacherConcept, "lessonId" | "title">;

interface ConceptState {
  concepts: TeacherConcept[];
  isLoading: boolean;
  createConcept: (data: CreateConceptData) => Promise<TeacherConcept | null>;
  loadConcepts: (lessonId: string) => Promise<void>;
  updateConcept: (conceptId: string, data: Partial<TeacherConcept>) => Promise<boolean>;
  deleteConcept: (conceptId: string) => Promise<boolean>;
}

function isNotFound(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

function toConcept(r: ConceptRead): TeacherConcept {
  return {
    id: r.id,
    publicCode: r.public_code,
    lessonId: r.lesson_id,
    title: r.title,
    order: r.position + 1,
    createdAt: r.created_at,
    updatedAt: r.created_at,
  };
}

export const useTeacherConceptStore = create<ConceptState>()((set) => ({
  concepts: [],
  isLoading: false,

  createConcept: async (data) => {
    const payload = {
      lesson_id: data.lessonId,
      title: data.title,
    };
    try {
      const conceptRead = await createConceptApi(payload);
      const concept = toConcept(conceptRead);
      set((state) => ({ concepts: [...state.concepts, concept] }));
      return concept;
    } catch {
      return null;
    }
  },

  loadConcepts: async (lessonId) => {
    set({ isLoading: true });
    try {
      const apiConcepts = await listConceptsApi(lessonId);
      set((state) => ({
        concepts: [
          ...state.concepts.filter((c) => c.lessonId !== lessonId),
          ...apiConcepts.map(toConcept),
        ],
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  updateConcept: async (conceptId, data) => {
    if (data.title !== undefined) {
      try {
        await updateConceptApi(conceptId, { title: data.title });
      } catch (err) {
        if (!isNotFound(err)) return false;
      }
    }
    set((state) => ({
      concepts: state.concepts.map((c) =>
        c.id === conceptId ? { ...c, ...data, updatedAt: new Date().toISOString() } : c,
      ),
    }));
    return true;
  },

  deleteConcept: async (conceptId) => {
    try {
      await deleteConceptApi(conceptId);
    } catch (err) {
      if (!isNotFound(err)) return false;
    }
    set((state) => ({ concepts: state.concepts.filter((c) => c.id !== conceptId) }));
    return true;
  },
}));

export function listConcepts(lessonId: string): TeacherConcept[] {
  return useTeacherConceptStore.getState().concepts
    .filter((c) => c.lessonId === lessonId)
    .sort((a, b) => a.order - b.order);
}

export function getConceptById(conceptId: string): TeacherConcept | undefined {
  return useTeacherConceptStore.getState().concepts.find((c) => c.id === conceptId);
}
