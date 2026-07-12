import { create } from "zustand";
import {
  createLesson as createLessonApi,
  listLessons as listLessonsApi,
  updateLesson as updateLessonApi,
  deleteLesson as deleteLessonApi,
  type LessonRead,
} from "@/lib/api/lessons";
import { ApiError } from "@/lib/api/client";

/**
 * Academic Domain: Course -> Chapter -> Lesson -> Concept -> Atomic Concept.
 * A Lesson belongs to exactly one Chapter (real backend FK) - this replaces
 * the previous mock shape which modeled chapterIds as many-to-many and had
 * no backend counterpart at all.
 */
export interface TeacherLesson {
  id: string;
  publicCode: string;
  chapterId: string;
  title: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateLessonData = Pick<TeacherLesson, "chapterId" | "title">;

interface LessonState {
  lessons: TeacherLesson[];
  isLoading: boolean;
  createLesson: (data: CreateLessonData) => Promise<TeacherLesson | null>;
  loadLessons: (chapterId: string) => Promise<void>;
  updateLesson: (lessonId: string, data: Partial<TeacherLesson>) => Promise<boolean>;
  deleteLesson: (lessonId: string) => Promise<boolean>;
}

function isNotFound(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

function toLesson(r: LessonRead): TeacherLesson {
  return {
    id: r.id,
    publicCode: r.public_code,
    chapterId: r.chapter_id,
    title: r.title,
    order: r.position + 1,
    createdAt: r.created_at,
    updatedAt: r.created_at,
  };
}

export const useTeacherLessonStore = create<LessonState>()((set) => ({
  lessons: [],
  isLoading: false,

  createLesson: async (data) => {
    const payload = {
      chapter_id: data.chapterId,
      title: data.title,
    };
    try {
      const lessonRead = await createLessonApi(payload);
      const lesson = toLesson(lessonRead);
      set((state) => ({ lessons: [...state.lessons, lesson] }));
      return lesson;
    } catch {
      return null;
    }
  },

  loadLessons: async (chapterId) => {
    set({ isLoading: true });
    try {
      const apiLessons = await listLessonsApi(chapterId);
      set((state) => ({
        lessons: [
          ...state.lessons.filter((l) => l.chapterId !== chapterId),
          ...apiLessons.map(toLesson),
        ],
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  updateLesson: async (lessonId, data) => {
    if (data.title !== undefined) {
      try {
        await updateLessonApi(lessonId, { title: data.title });
      } catch (err) {
        if (!isNotFound(err)) return false;
      }
    }
    set((state) => ({
      lessons: state.lessons.map((l) =>
        l.id === lessonId ? { ...l, ...data, updatedAt: new Date().toISOString() } : l,
      ),
    }));
    return true;
  },

  deleteLesson: async (lessonId) => {
    try {
      await deleteLessonApi(lessonId);
    } catch (err) {
      if (!isNotFound(err)) return false;
    }
    set((state) => ({ lessons: state.lessons.filter((l) => l.id !== lessonId) }));
    return true;
  },
}));

export function listLessons(chapterId: string): TeacherLesson[] {
  return useTeacherLessonStore.getState().lessons
    .filter((l) => l.chapterId === chapterId)
    .sort((a, b) => a.order - b.order);
}

export function getLessonById(lessonId: string): TeacherLesson | undefined {
  return useTeacherLessonStore.getState().lessons.find((l) => l.id === lessonId);
}
