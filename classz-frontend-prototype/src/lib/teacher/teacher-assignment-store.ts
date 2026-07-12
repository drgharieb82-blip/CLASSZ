import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createAssignment as createAssignmentApi } from "@/lib/api/assignments";

export type AssignmentType = "project" | "research" | "presentation" | "custom";
export type AssignmentStatus = "draft" | "published" | "archived";

export interface TeacherAssignment {
  id: string;
  publicCode: string;
  courseId: string;
  chapterIds: string[];
  lessonIds: string[];
  sessionIds: string[];
  title: string;
  description: string;
  assignmentType: AssignmentType;
  rubric: string;
  attachments: string[];
  dueDate: string;
  xpReward: number;
  status: AssignmentStatus;
  visibility: "public" | "enrolled_only" | "private";
  createdAt: string;
  updatedAt: string;

  // Backend sync — rubric/xpReward/visibility/assignmentType have no
  // backend column and stay local-only.
  backendId?: string;
  backendSynced?: boolean;
}

export type CreateAssignmentData = Pick<TeacherAssignment, "title" | "courseId" | "assignmentType"> &
  Partial<Omit<TeacherAssignment, "id" | "publicCode" | "createdAt" | "updatedAt">>;

let codeCounter = 0;
function genId() { return `asn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`; }
function genCode() { codeCounter++; return `ASN-26-${codeCounter.toString().padStart(4, "0")}`; }

interface AssignmentState {
  items: TeacherAssignment[];
  createAssignment: (d: CreateAssignmentData) => TeacherAssignment;
  updateAssignment: (id: string, d: Partial<TeacherAssignment>) => void;
  deleteAssignment: (id: string) => void;
  publishAssignment: (id: string) => void;
  archiveAssignment: (id: string) => void;
  attachToSession: (asnId: string, sessionId: string) => void;
  detachFromSession: (asnId: string, sessionId: string) => void;
}

async function syncAssignmentToBackend(assignment: TeacherAssignment): Promise<void> {
  try {
    const created = await createAssignmentApi({
      title: assignment.title,
      description: assignment.description || null,
      course_id: assignment.courseId,
      chapter_id: assignment.chapterIds[0] ?? null,
      session_id: assignment.sessionIds[0] ?? null,
      deadline_at: assignment.dueDate ? new Date(assignment.dueDate).toISOString() : null,
      max_points: 100,
      allow_multiple_submissions: false,
    });
    useTeacherAssignmentStore.getState().updateAssignment(assignment.id, {
      backendId: created.id,
      backendSynced: true,
    });
  } catch {
    // Leave the assignment as local-only; the teacher's draft isn't lost.
  }
}

export const useTeacherAssignmentStore = create<AssignmentState>()(
  persist(
    (set, get) => ({
      items: [],
      createAssignment: (d) => {
        const now = new Date().toISOString();
        const asn: TeacherAssignment = {
          id: genId(), publicCode: genCode(), courseId: d.courseId,
          chapterIds: d.chapterIds || [], lessonIds: d.lessonIds || [], sessionIds: d.sessionIds || [],
          title: d.title, description: d.description || "", assignmentType: d.assignmentType,
          rubric: d.rubric || "", attachments: d.attachments || [], dueDate: d.dueDate || "",
          xpReward: d.xpReward || 0, status: d.status || "draft",
          visibility: d.visibility || "enrolled_only", createdAt: now, updatedAt: now,
        };
        set((s) => ({ items: [asn, ...s.items] }));
        void syncAssignmentToBackend(asn);
        return asn;
      },
      updateAssignment: (id, d) => set((s) => ({ items: s.items.map((a) => a.id === id ? { ...a, ...d, updatedAt: new Date().toISOString() } : a) })),
      deleteAssignment: (id) => set((s) => ({ items: s.items.filter((a) => a.id !== id) })),
      publishAssignment: (id) => get().updateAssignment(id, { status: "published" }),
      archiveAssignment: (id) => get().updateAssignment(id, { status: "archived" }),
      attachToSession: (asnId, sessionId) => { const a = get().items.find((x) => x.id === asnId); if (a && !a.sessionIds.includes(sessionId)) get().updateAssignment(asnId, { sessionIds: [...a.sessionIds, sessionId] }); },
      detachFromSession: (asnId, sessionId) => { const a = get().items.find((x) => x.id === asnId); if (a) get().updateAssignment(asnId, { sessionIds: a.sessionIds.filter((s) => s !== sessionId) }); },
    }),
    { name: "classz-teacher-assignments" },
  ),
);

export function getAssignmentById(id: string) { return useTeacherAssignmentStore.getState().items.find((a) => a.id === id); }
export function getPublishedAssignmentsForSession(sessionId: string) { return useTeacherAssignmentStore.getState().items.filter((a) => a.status === "published" && a.sessionIds.includes(sessionId)); }
