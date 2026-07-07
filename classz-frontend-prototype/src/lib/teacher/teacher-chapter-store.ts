import { create } from "zustand";
import {
  createChapter as createChapterApi,
  listChapters as listChaptersApi,
  type ChapterRead,
} from "@/lib/api/chapters";

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

export type CreateChapterData = Pick<TeacherChapter, "courseId" | "title"> & {
  description?: string;
  status?: ChapterStatus;
};

interface ChapterState {
  chapters: TeacherChapter[];
  isLoading: boolean;
  createChapter: (data: CreateChapterData) => Promise<TeacherChapter | null>;
  loadChapters: (courseId: string) => Promise<void>;
  updateChapter: (chapterId: string, data: Partial<TeacherChapter>) => void;
  deleteChapter: (chapterId: string) => void;
  publishChapter: (chapterId: string) => void;
  archiveChapter: (chapterId: string) => void;
  reorderChapters: (courseId: string, orderedIds: string[]) => void;
}

function toChapter(r: ChapterRead): TeacherChapter {
  return {
    id: r.id,
    publicCode: r.public_code,
    courseId: r.course_id,
    title: r.title,
    description: "",
    order: r.position + 1,
    status: "draft",
    isLocked: false,
    createdAt: r.created_at,
    updatedAt: r.created_at,
  };
}

export const useTeacherChapterStore = create<ChapterState>()((set, get) => ({
  chapters: [],
  isLoading: false,

  createChapter: async (data) => {
    const payload = {
      course_id: data.courseId,
      title: data.title,
    };
    try {
      const chapterRead = await createChapterApi(payload);
      const chapter = toChapter(chapterRead);
      set((state) => ({ chapters: [...state.chapters, chapter] }));
      return chapter;
    } catch {
      return null;
    }
  },

  loadChapters: async (courseId) => {
    set({ isLoading: true });
    try {
      const apiChapters = await listChaptersApi(courseId);
      set((state) => ({
        chapters: [
          ...state.chapters.filter((c) => c.courseId !== courseId),
          ...apiChapters.map(toChapter),
        ],
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
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
}));

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
