import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SessionStatus = "draft" | "published" | "archived";
export type AccessStatus = "locked" | "unlocked" | "scheduled";

export interface TeacherSession {
  id: string;
  publicCode: string;
  courseId: string;
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
}

export type CreateSessionData = Pick<TeacherSession,
  "courseId" | "chapterId" | "title" | "description" | "price" | "currency"
> & {
  status?: SessionStatus;
  accessStatus?: AccessStatus;
  isFreePreview?: boolean;
  openAt?: string;
  closeAt?: string;
  durationMinutes?: number;
};

interface SessionState {
  sessions: TeacherSession[];
  createSession: (data: CreateSessionData) => TeacherSession;
  updateSession: (sessionId: string, data: Partial<TeacherSession>) => void;
  deleteSession: (sessionId: string) => void;
  publishSession: (sessionId: string) => void;
  lockSession: (sessionId: string) => void;
  unlockSession: (sessionId: string) => void;
  archiveSession: (sessionId: string) => void;
  reorderSessions: (chapterId: string, orderedIds: string[]) => void;
}

let codeCounter = 0;

function generateId(): string {
  return `ses-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function generateCode(): string {
  codeCounter++;
  return `SES-26-${codeCounter.toString().padStart(4, "0")}`;
}

export const useTeacherSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],

      createSession: (data) => {
        const chapterSessions = get().sessions.filter((s) => s.chapterId === data.chapterId);
        const now = new Date().toISOString();
        const session: TeacherSession = {
          id: generateId(),
          publicCode: generateCode(),
          courseId: data.courseId,
          chapterId: data.chapterId,
          title: data.title,
          description: data.description || "",
          order: chapterSessions.length + 1,
          price: data.price ?? 0,
          currency: data.currency || "USD",
          status: data.status || "draft",
          accessStatus: data.accessStatus || "locked",
          openAt: data.openAt || "",
          closeAt: data.closeAt || "",
          durationMinutes: data.durationMinutes || 0,
          isFreePreview: data.isFreePreview || false,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ sessions: [...state.sessions, session] }));
        return session;
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
    }),
    { name: "classz-teacher-sessions" },
  ),
);

export function listSessions(courseId: string, chapterId?: string): TeacherSession[] {
  return useTeacherSessionStore.getState().sessions
    .filter((s) => s.courseId === courseId && (!chapterId || s.chapterId === chapterId))
    .sort((a, b) => a.order - b.order);
}

export function getSessionById(sessionId: string): TeacherSession | undefined {
  return useTeacherSessionStore.getState().sessions.find((s) => s.id === sessionId);
}

export function getPublishedSessions(courseId: string): TeacherSession[] {
  return listSessions(courseId).filter((s) => s.status === "published");
}
