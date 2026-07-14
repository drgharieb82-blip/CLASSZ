import { create } from "zustand";
import {
  createAtomicConcept as createAtomicConceptApi,
  listAtomicConcepts as listAtomicConceptsApi,
  updateAtomicConcept as updateAtomicConceptApi,
  deleteAtomicConcept as deleteAtomicConceptApi,
  type AtomicConceptRead,
} from "@/lib/api/atomic-concepts";
import { ApiError } from "@/lib/api/client";

/** Academic Domain: Course -> Chapter -> Lesson -> Concept -> Atomic Concept.
 * The finest-grained, terminal node. */
export interface TeacherAtomicConcept {
  id: string;
  publicCode: string;
  conceptId: string;
  title: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateAtomicConceptData = Pick<TeacherAtomicConcept, "conceptId" | "title">;

interface AtomicConceptState {
  atomicConcepts: TeacherAtomicConcept[];
  isLoading: boolean;
  createAtomicConcept: (data: CreateAtomicConceptData) => Promise<TeacherAtomicConcept | null>;
  loadAtomicConcepts: (conceptId: string) => Promise<void>;
  updateAtomicConcept: (atomicConceptId: string, data: Partial<TeacherAtomicConcept>) => Promise<boolean>;
  deleteAtomicConcept: (atomicConceptId: string) => Promise<boolean>;
}

function isNotFound(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

function toAtomicConcept(r: AtomicConceptRead): TeacherAtomicConcept {
  return {
    id: r.id,
    publicCode: r.public_code,
    conceptId: r.concept_id,
    title: r.title,
    order: r.position + 1,
    createdAt: r.created_at,
    updatedAt: r.created_at,
  };
}

export const useTeacherAtomicConceptStore = create<AtomicConceptState>()((set) => ({
  atomicConcepts: [],
  isLoading: false,

  createAtomicConcept: async (data) => {
    const payload = {
      concept_id: data.conceptId,
      title: data.title,
    };
    try {
      const atomicRead = await createAtomicConceptApi(payload);
      const atomicConcept = toAtomicConcept(atomicRead);
      set((state) => ({ atomicConcepts: [...state.atomicConcepts, atomicConcept] }));
      return atomicConcept;
    } catch {
      return null;
    }
  },

  loadAtomicConcepts: async (conceptId) => {
    set({ isLoading: true });
    try {
      const apiAtomicConcepts = await listAtomicConceptsApi(conceptId);
      set((state) => ({
        atomicConcepts: [
          ...state.atomicConcepts.filter((a) => a.conceptId !== conceptId),
          ...apiAtomicConcepts.map(toAtomicConcept),
        ],
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  updateAtomicConcept: async (atomicConceptId, data) => {
    if (data.title !== undefined) {
      try {
        await updateAtomicConceptApi(atomicConceptId, { title: data.title });
      } catch (err) {
        if (!isNotFound(err)) return false;
      }
    }
    set((state) => ({
      atomicConcepts: state.atomicConcepts.map((a) =>
        a.id === atomicConceptId ? { ...a, ...data, updatedAt: new Date().toISOString() } : a,
      ),
    }));
    return true;
  },

  deleteAtomicConcept: async (atomicConceptId) => {
    try {
      await deleteAtomicConceptApi(atomicConceptId);
    } catch (err) {
      if (!isNotFound(err)) return false;
    }
    set((state) => ({ atomicConcepts: state.atomicConcepts.filter((a) => a.id !== atomicConceptId) }));
    return true;
  },
}));

export function listAtomicConcepts(conceptId: string): TeacherAtomicConcept[] {
  return useTeacherAtomicConceptStore.getState().atomicConcepts
    .filter((a) => a.conceptId === conceptId)
    .sort((a, b) => a.order - b.order);
}

export function getAtomicConceptById(atomicConceptId: string): TeacherAtomicConcept | undefined {
  return useTeacherAtomicConceptStore.getState().atomicConcepts.find((a) => a.id === atomicConceptId);
}
