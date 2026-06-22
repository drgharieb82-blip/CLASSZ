import { create } from "zustand";
import { persist } from "zustand/middleware";

export type HomeworkType = "worksheet" | "essay" | "file_upload" | "mixed";
export type HomeworkStatus = "draft" | "published" | "archived";

export interface TeacherHomework {
  id: string;
  publicCode: string;
  courseId: string;
  chapterIds: string[];
  lessonIds: string[];
  sessionIds: string[];
  title: string;
  description: string;
  homeworkType: HomeworkType;
  attachments: string[];
  dueDate: string;
  maxScore: number;
  allowLateSubmission: boolean;
  xpReward: number;
  status: HomeworkStatus;
  visibility: "public" | "enrolled_only" | "private";
  createdAt: string;
  updatedAt: string;
}

export type CreateHomeworkData = Pick<TeacherHomework, "title" | "courseId" | "homeworkType"> &
  Partial<Omit<TeacherHomework, "id" | "publicCode" | "createdAt" | "updatedAt">>;

let codeCounter = 0;
function genId() { return `hwk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`; }
function genCode() { codeCounter++; return `HWK-26-${codeCounter.toString().padStart(4, "0")}`; }

interface HomeworkState {
  items: TeacherHomework[];
  createHomework: (d: CreateHomeworkData) => TeacherHomework;
  updateHomework: (id: string, d: Partial<TeacherHomework>) => void;
  deleteHomework: (id: string) => void;
  publishHomework: (id: string) => void;
  archiveHomework: (id: string) => void;
  attachToSession: (hwId: string, sessionId: string) => void;
  detachFromSession: (hwId: string, sessionId: string) => void;
}

export const useTeacherHomeworkStore = create<HomeworkState>()(
  persist(
    (set, get) => ({
      items: [],
      createHomework: (d) => {
        const now = new Date().toISOString();
        const hw: TeacherHomework = {
          id: genId(), publicCode: genCode(), courseId: d.courseId,
          chapterIds: d.chapterIds || [], lessonIds: d.lessonIds || [], sessionIds: d.sessionIds || [],
          title: d.title, description: d.description || "", homeworkType: d.homeworkType,
          attachments: d.attachments || [], dueDate: d.dueDate || "", maxScore: d.maxScore || 100,
          allowLateSubmission: d.allowLateSubmission ?? false, xpReward: d.xpReward || 0,
          status: d.status || "draft", visibility: d.visibility || "enrolled_only",
          createdAt: now, updatedAt: now,
        };
        set((s) => ({ items: [hw, ...s.items] }));
        return hw;
      },
      updateHomework: (id, d) => set((s) => ({ items: s.items.map((h) => h.id === id ? { ...h, ...d, updatedAt: new Date().toISOString() } : h) })),
      deleteHomework: (id) => set((s) => ({ items: s.items.filter((h) => h.id !== id) })),
      publishHomework: (id) => get().updateHomework(id, { status: "published" }),
      archiveHomework: (id) => get().updateHomework(id, { status: "archived" }),
      attachToSession: (hwId, sessionId) => { const h = get().items.find((x) => x.id === hwId); if (h && !h.sessionIds.includes(sessionId)) get().updateHomework(hwId, { sessionIds: [...h.sessionIds, sessionId] }); },
      detachFromSession: (hwId, sessionId) => { const h = get().items.find((x) => x.id === hwId); if (h) get().updateHomework(hwId, { sessionIds: h.sessionIds.filter((s) => s !== sessionId) }); },
    }),
    { name: "classz-teacher-homework" },
  ),
);

export function getHomeworkById(id: string) { return useTeacherHomeworkStore.getState().items.find((h) => h.id === id); }
export function getPublishedHomeworkForSession(sessionId: string) { return useTeacherHomeworkStore.getState().items.filter((h) => h.status === "published" && h.sessionIds.includes(sessionId)); }
