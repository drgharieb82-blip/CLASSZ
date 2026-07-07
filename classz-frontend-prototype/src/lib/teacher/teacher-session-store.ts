import { create } from "zustand";
import {
  createSession as createSessionApi,
  listSessions as listSessionsApi,
  type SessionRead as ApiSessionRead,
} from "@/lib/api/sessions";

export type SessionStatus = "draft" | "published" | "archived";
export type AccessStatus = "locked" | "unlocked" | "scheduled";

export type SessionType = "lesson" | "revision" | "practice" | "quiz" | "exam" | "homework" | "mixed";

export interface TeacherSession {
  id: string;
  publicCode: string;
  courseId: string;
  /** Convenience/display value derived from chapterIds[0]. A Session is not owned by
   * one Chapter (it belongs directly to a Course) - it may reference several chapters,
   * e.g. a revision session spanning multiple chapters. Use chapterIds for the real list. */
  chapterId: string;
  title: string;
  description: string;
  order: number;
  price: number;
  currency: string;
  status: SessionStatus;
  accessStatus: AccessStatus;
  openAt: string;
  closeAt: string;
  durationMinutes: number;
  isFreePreview: boolean;
  createdAt: string;
  updatedAt: string;
  // Flexible fields (Phase A)
  sessionType: SessionType;
  chapterIds: string[];
  lessonIds: string[];
  conceptIds: string[];
  atomicConceptIds: string[];
  materialIds: string[];
  questionIds: string[];
  quizIds: string[];
  examIds: string[];
  homeworkIds: string[];
  hasQuiz: boolean;
  hasExam: boolean;
  hasHomework: boolean;
  hasPractice: boolean;
}

export type CreateSessionData = Pick<TeacherSession,
  "courseId" | "title" | "description" | "price" | "currency"
> & {
  chapterIds?: string[];
  status?: SessionStatus;
  accessStatus?: AccessStatus;
  isFreePreview?: boolean;
  openAt?: string;
  closeAt?: string;
  durationMinutes?: number;
  sessionType?: SessionType;
};

interface SessionState {
  sessions: TeacherSession[];
  isLoading: boolean;
  createSession: (data: CreateSessionData) => Promise<TeacherSession | null>;
  loadSessions: (courseId: string) => Promise<void>;
  updateSession: (sessionId: string, data: Partial<TeacherSession>) => void;
  deleteSession: (sessionId: string) => void;
  publishSession: (sessionId: string) => void;
  lockSession: (sessionId: string) => void;
  unlockSession: (sessionId: string) => void;
  archiveSession: (sessionId: string) => void;
  reorderSessions: (chapterId: string, orderedIds: string[]) => void;
}

function toSession(r: ApiSessionRead): TeacherSession {
  const chapterIds = r.chapters.map((c) => c.id);
  return {
    id: r.id,
    publicCode: r.public_code,
    courseId: r.course_id,
    chapterId: chapterIds[0] || "",
    title: r.title,
    description: r.description || "",
    order: r.position + 1,
    price: 0,
    currency: "USD",
    status: "draft",
    accessStatus: r.is_locked ? "locked" : "unlocked",
    openAt: r.release_at || "",
    closeAt: r.hide_at || "",
    durationMinutes: 0,
    isFreePreview: r.is_free_preview,
    createdAt: r.created_at,
    updatedAt: r.created_at,
    sessionType: "lesson",
    chapterIds,
    lessonIds: [],
    conceptIds: [],
    atomicConceptIds: [],
    materialIds: [],
    questionIds: [],
    quizIds: [],
    examIds: [],
    homeworkIds: [],
    hasQuiz: false,
    hasExam: false,
    hasHomework: false,
    hasPractice: false,
  };
}

export const useTeacherSessionStore = create<SessionState>()((set, get) => ({
  sessions: [],
  isLoading: false,

  createSession: async (data) => {
    const payload = {
      course_id: data.courseId,
      title: data.title,
      description: data.description || null,
      is_free_preview: data.isFreePreview || false,
      release_at: data.openAt || null,
      hide_at: data.closeAt || null,
      is_locked: data.accessStatus === "locked",
      chapter_ids: data.chapterIds || [],
    };
    try {
      const sessionRead = await createSessionApi(payload);
      const session = toSession(sessionRead);
      set((state) => ({ sessions: [...state.sessions, session] }));
      return session;
    } catch {
      return null;
    }
  },

  loadSessions: async (courseId) => {
    set({ isLoading: true });
    try {
      const apiSessions = await listSessionsApi(courseId);
      set((state) => ({
        sessions: [
          ...state.sessions.filter((s) => s.courseId !== courseId),
          ...apiSessions.map((r) => toSession(r)),
        ],
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  updateSession: (sessionId, data) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, ...data, updatedAt: new Date().toISOString() } : s,
      ),
    }));
  },

  deleteSession: (sessionId) => {
    set((state) => ({ sessions: state.sessions.filter((s) => s.id !== sessionId) }));
  },

  publishSession: (sessionId) => {
    get().updateSession(sessionId, { status: "published" });
  },

  lockSession: (sessionId) => {
    get().updateSession(sessionId, { accessStatus: "locked" });
  },

  unlockSession: (sessionId) => {
    get().updateSession(sessionId, { accessStatus: "unlocked" });
  },

  archiveSession: (sessionId) => {
    get().updateSession(sessionId, { status: "archived" });
  },

  reorderSessions: (chapterId, orderedIds) => {
    set((state) => ({
      sessions: state.sessions.map((s) => {
        if (s.chapterId !== chapterId) return s;
        const idx = orderedIds.indexOf(s.id);
        return idx >= 0 ? { ...s, order: idx + 1 } : s;
      }),
    }));
  },
}));

export function listSessions(courseId: string, chapterId?: string): TeacherSession[] {
  return useTeacherSessionStore.getState().sessions
    .filter((s) => s.courseId === courseId && (!chapterId || s.chapterIds.includes(chapterId)))
    .sort((a, b) => a.order - b.order);
}

export function getSessionById(sessionId: string): TeacherSession | undefined {
  return useTeacherSessionStore.getState().sessions.find((s) => s.id === sessionId);
}

export function getPublishedSessions(courseId: string): TeacherSession[] {
  return listSessions(courseId).filter((s) => s.status === "published");
}
