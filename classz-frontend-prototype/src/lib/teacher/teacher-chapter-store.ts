import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChapterStatus = "draft" | "published" | "archived";

export interface TeacherChapter {
  id: string;
  publicCode: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  status: ChapterStatus;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateChapterData = Pick<TeacherChapter, "courseId" | "title" | "description"> & {
  status?: ChapterStatus;
};

interface ChapterState {
  chapters: TeacherChapter[];
  createChapter: (data: CreateChapterData) => TeacherChapter;
  updateChapter: (chapterId: string, data: Partial<TeacherChapter>) => void;
  deleteChapter: (chapterId: string) => void;
  publishChapter: (chapterId: string) => void;
  archiveChapter: (chapterId: string) => void;
  reorderChapters: (courseId: string, orderedIds: string[]) => void;
}

let codeCounter = 0;

function generateId(): string {
  return `ch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function generateCode(): string {
  codeCounter++;
  return `CHP-26-${codeCounter.toString().padStart(4, "0")}`;
}

export const useTeacherChapterStore = create<ChapterState>()(
  persist(
    (set, get) => ({
      chapters: [],

      createChapter: (data) => {
        const courseChapters = get().chapters.filter((c) => c.courseId === data.courseId);
        const now = new Date().toISOString();
        const chapter: TeacherChapter = {
          id: generateId(),
          publicCode: generateCode(),
          courseId: data.courseId,
          title: data.title,
          description: data.description || "",
          order: courseChapters.length + 1,
          status: data.status || "draft",
          isLocked: false,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ chapters: [...state.chapters, chapter] }));
        return chapter;
      },

      updateChapter: (chapterId, data) => {
        set((state) => ({
          chapters: state.chapters.map((c) =>
            c.id === chapterId ? { ...c, ...data, updatedAt: new Date().toISOString() } : c,
          ),
        }));
      },

      deleteChapter: (chapterId) => {
        set((state) => ({ chapters: state.chapters.filter((c) => c.id !== chapterId) }));
      },

      publishChapter: (chapterId) => {
        get().updateChapter(chapterId, { status: "published" });
      },

      archiveChapter: (chapterId) => {
        get().updateChapter(chapterId, { status: "archived" });
      },

      reorderChapters: (courseId, orderedIds) => {
        set((state) => ({
          chapters: state.chapters.map((c) => {
            if (c.courseId !== courseId) return c;
            const idx = orderedIds.indexOf(c.id);
            return idx >= 0 ? { ...c, order: idx + 1 } : c;
          }),
        }));
      },
    }),
    { name: "classz-teacher-chapters" },
  ),
);

export function listChapters(courseId: string): TeacherChapter[] {
  return useTeacherChapterStore.getState().chapters
    .filter((c) => c.courseId === courseId)
    .sort((a, b) => a.order - b.order);
}

export function getChapterById(chapterId: string): TeacherChapter | undefined {
  return useTeacherChapterStore.getState().chapters.find((c) => c.id === chapterId);
}

export function getPublishedChapters(courseId: string): TeacherChapter[] {
  return listChapters(courseId).filter((c) => c.status === "published");
}
