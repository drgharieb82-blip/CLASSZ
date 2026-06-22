import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ExamType = "periodic" | "weekly" | "monthly" | "final" | "mock" | "custom";
export type ExamStatus = "draft" | "published" | "archived";

export interface TeacherExam {
  id: string;
  publicCode: string;
  teacherId: string;
  courseId: string;
  chapterIds: string[];
  lessonIds: string[];
  sessionIds: string[];
  conceptIds: string[];
  atomicConceptIds: string[];
  title: string;
  description: string;
  examType: ExamType;
  questionIds: string[];
  durationMinutes: number;
  attemptLimit: number;
  shuffleQuestions: boolean;
  shuffleChoices: boolean;
  passingScorePercent: number;
  examXpReward: number;
  perfectScoreBonus: number;
  passScoreBonus: number;
  allowRetakeXp: boolean;
  maxRetakeXp: number;
  status: ExamStatus;
  visibility: "public" | "enrolled_only" | "private";
  createdAt: string;
  updatedAt: string;
}

export type CreateExamData = Pick<TeacherExam, "title" | "courseId" | "examType"> &
  Partial<Omit<TeacherExam, "id" | "publicCode" | "createdAt" | "updatedAt">>;

let codeCounter = 0;
function genId() { return `exm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`; }
function genCode() { codeCounter++; return `EXM-26-${codeCounter.toString().padStart(4, "0")}`; }

interface ExamState {
  exams: TeacherExam[];
  createExam: (d: CreateExamData) => TeacherExam;
  updateExam: (id: string, d: Partial<TeacherExam>) => void;
  deleteExam: (id: string) => void;
  publishExam: (id: string) => void;
  archiveExam: (id: string) => void;
  attachToSession: (examId: string, sessionId: string) => void;
  detachFromSession: (examId: string, sessionId: string) => void;
}

export const useTeacherExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      exams: [],
      createExam: (d) => {
        const now = new Date().toISOString();
        const exam: TeacherExam = {
          id: genId(), publicCode: genCode(), teacherId: d.teacherId || "TCH-26-0001",
          courseId: d.courseId, chapterIds: d.chapterIds || [], lessonIds: d.lessonIds || [],
          sessionIds: d.sessionIds || [], conceptIds: d.conceptIds || [], atomicConceptIds: d.atomicConceptIds || [],
          title: d.title, description: d.description || "", examType: d.examType,
          questionIds: d.questionIds || [], durationMinutes: d.durationMinutes || 60,
          attemptLimit: d.attemptLimit || 1, shuffleQuestions: d.shuffleQuestions ?? true,
          shuffleChoices: d.shuffleChoices ?? true, passingScorePercent: d.passingScorePercent || 50,
          examXpReward: d.examXpReward || 100, perfectScoreBonus: d.perfectScoreBonus || 50,
          passScoreBonus: d.passScoreBonus || 25, allowRetakeXp: d.allowRetakeXp ?? false,
          maxRetakeXp: d.maxRetakeXp || 0, status: d.status || "draft",
          visibility: d.visibility || "enrolled_only", createdAt: now, updatedAt: now,
        };
        set((s) => ({ exams: [exam, ...s.exams] }));
        return exam;
      },
      updateExam: (id, d) => set((s) => ({ exams: s.exams.map((e) => e.id === id ? { ...e, ...d, updatedAt: new Date().toISOString() } : e) })),
      deleteExam: (id) => set((s) => ({ exams: s.exams.filter((e) => e.id !== id) })),
      publishExam: (id) => { const e = get().exams.find((x) => x.id === id); if (e && e.questionIds.length > 0) get().updateExam(id, { status: "published" }); },
      archiveExam: (id) => get().updateExam(id, { status: "archived" }),
      attachToSession: (examId, sessionId) => { const e = get().exams.find((x) => x.id === examId); if (e && !e.sessionIds.includes(sessionId)) get().updateExam(examId, { sessionIds: [...e.sessionIds, sessionId] }); },
      detachFromSession: (examId, sessionId) => { const e = get().exams.find((x) => x.id === examId); if (e) get().updateExam(examId, { sessionIds: e.sessionIds.filter((s) => s !== sessionId) }); },
    }),
    { name: "classz-teacher-exams" },
  ),
);

export function getExamById(id: string) { return useTeacherExamStore.getState().exams.find((e) => e.id === id); }
export function getPublishedExamsForSession(sessionId: string) { return useTeacherExamStore.getState().exams.filter((e) => e.status === "published" && e.sessionIds.includes(sessionId)); }
