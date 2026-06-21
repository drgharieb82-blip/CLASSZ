import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LessonStatus = "draft" | "published" | "archived";

export interface TeacherLesson {
  id: string;
  publicCode: string;
  courseId: string;
  chapterIds: string[];
  title: string;
  description: string;
  order: number;
  conceptIds: string[];
  atomicConceptIds: string[];
  status: LessonStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateLessonData = Pick<TeacherLesson, "courseId" | "title"> & {
  chapterIds?: string[];
  description?: string;
  conceptIds?: string[];
  atomicConceptIds?: string[];
  status?: LessonStatus;
};

interface LessonState {
  lessons: TeacherLesson[];
  createLesson: (data: CreateLessonData) => TeacherLesson;
  updateLesson: (lessonId: string, data: Partial<TeacherLesson>) => void;
  deleteLesson: (lessonId: string) => void;
  publishLesson: (lessonId: string) => void;
  archiveLesson: (lessonId: string) => void;
}

let codeCounter = 0;

function generateId(): string {
  return `les-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function generateCode(): string {
  codeCounter++;
  return `LES-26-${codeCounter.toString().padStart(4, "0")}`;
}

export const useTeacherLessonStore = create<LessonState>()(
  persist(
    (set, get) => ({
      lessons: [],

      createLesson: (data) => {
        const courseLessons = get().lessons.filter((l) => l.courseId === data.courseId);
        const now = new Date().toISOString();
        const lesson: TeacherLesson = {
          id: generateId(),
          publicCode: generateCode(),
          courseId: data.courseId,
          chapterIds: data.chapterIds || [],
          title: data.title,
          description: data.description || "",
          order: courseLessons.length + 1,
          conceptIds: data.conceptIds || [],
          atomicConceptIds: data.atomicConceptIds || [],
          status: data.status || "draft",
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ lessons: [...state.lessons, lesson] }));
        return lesson;
      },

      updateLesson: (lessonId, data) => {
        set((state) => ({
          lessons: state.lessons.map((l) =>
            l.id === lessonId ? { ...l, ...data, updatedAt: new Date().toISOString() } : l,
          ),
        }));
      },

      deleteLesson: (lessonId) => {
        set((state) => ({ lessons: state.lessons.filter((l) => l.id !== lessonId) }));
      },

      publishLesson: (lessonId) => {
        get().updateLesson(lessonId, { status: "published" });
      },

      archiveLesson: (lessonId) => {
        get().updateLesson(lessonId, { status: "archived" });
      },
    }),
    { name: "classz-teacher-lessons" },
  ),
);

export function listLessons(courseId: string): TeacherLesson[] {
  return useTeacherLessonStore.getState().lessons
    .filter((l) => l.courseId === courseId)
    .sort((a, b) => a.order - b.order);
}

export function getLessonById(lessonId: string): TeacherLesson | undefined {
  return useTeacherLessonStore.getState().lessons.find((l) => l.id === lessonId);
}
