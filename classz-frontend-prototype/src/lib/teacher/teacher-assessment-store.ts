import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TeacherQuiz } from "./teacher-quiz-store";
import type { TeacherExam } from "./teacher-exam-store";
import type { TeacherHomework } from "./teacher-homework-store";
import type { TeacherAssignment } from "./teacher-assignment-store";

/* ═══════════════════════════════════════════════════════════
   ASSESSMENT TYPES
   ═══════════════════════════════════════════════════════════ */

export type AssessmentType =
  | "practice_quiz" | "session_quiz" | "revision_quiz"
  | "homework"
  | "exam" | "mock_exam" | "final_exam"
  | "placement_test" | "diagnostic_test"
  | "assignment" | "project" | "research" | "presentation"
  | "adaptive_assessment"
  | "custom";

export type AssessmentStatus = "draft" | "published" | "archived";
export type AssessmentVisibility = "private" | "course" | "enrolled_only" | "public";
export type ShowPolicy = "immediately" | "after_submit" | "after_due_date" | "never";

/* ═══════════════════════════════════════════════════════════
   ASSESSMENT SETTINGS
   ═══════════════════════════════════════════════════════════ */

export interface AssessmentSettings {
  durationMinutes?: number;
  hasStrictTimer?: boolean;
  attemptLimit?: number;
  passingScorePercent?: number;
  totalScore?: number;
  pointsPerQuestion?: number;
  negativeMarksEnabled?: boolean;
  negativeMarksValue?: number;
  partialCreditAllowed?: boolean;
  shuffleQuestions?: boolean;
  shuffleChoices?: boolean;
  showAnswersPolicy?: ShowPolicy;
  showExplanationPolicy?: ShowPolicy;
  reviewModeAllowed?: boolean;
  startAt?: string;
  endAt?: string;
  dueDate?: string;
  allowLateSubmission?: boolean;
  latePenaltyPercent?: number;
  manualReviewRequired?: boolean;
  autoGradeAllowed?: boolean;
  fileUploadAllowed?: boolean;
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
  rubric?: string;
  gradingNotes?: string;
}

/* ═══════════════════════════════════════════════════════════
   ASSESSMENT REWARDS
   ═══════════════════════════════════════════════════════════ */

export interface AssessmentRewards {
  xpReward?: number;
  passScoreBonus?: number;
  perfectScoreBonus?: number;
  allowRetakeXp?: boolean;
  maxRetakeXp?: number;
  walletCoinsReward?: number;
  badgeIds?: string[];
}

/* ═══════════════════════════════════════════════════════════
   ASSESSMENT MODEL
   ═══════════════════════════════════════════════════════════ */

export interface TeacherAssessment {
  id: string;
  publicCode: string;
  teacherId?: string;
  ownerTeacherId?: string;

  title: string;
  subtitle?: string;
  description?: string;
  instructions?: string;
  thumbnail?: string;
  tags?: string[];

  assessmentType: AssessmentType;
  questionIds: string[];

  courseIds?: string[];
  chapterIds?: string[];
  lessonIds?: string[];
  conceptIds?: string[];
  atomicConceptIds?: string[];
  sessionIds?: string[];

  settings: AssessmentSettings;
  rewards: AssessmentRewards;

  status: AssessmentStatus;
  visibility?: AssessmentVisibility;

  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
  version?: number;
}

/* ═══════════════════════════════════════════════════════════
   CREATE DATA
   ═══════════════════════════════════════════════════════════ */

export type CreateAssessmentData = Pick<TeacherAssessment, "title" | "assessmentType"> &
  Partial<Omit<TeacherAssessment, "id" | "publicCode" | "createdAt" | "updatedAt">>;

/* ═══════════════════════════════════════════════════════════
   PRESETS
   ═══════════════════════════════════════════════════════════ */

export function createAssessmentPreset(type: AssessmentType): { settings: AssessmentSettings; rewards: AssessmentRewards } {
  switch (type) {
    case "practice_quiz": return {
      settings: { attemptLimit: 3, shuffleQuestions: true, shuffleChoices: true, showAnswersPolicy: "after_submit", showExplanationPolicy: "after_submit", autoGradeAllowed: true },
      rewards: { xpReward: 20 },
    };
    case "session_quiz": return {
      settings: { durationMinutes: 10, attemptLimit: 2, shuffleQuestions: true, shuffleChoices: true, showAnswersPolicy: "after_submit", showExplanationPolicy: "after_submit", autoGradeAllowed: true },
      rewards: { xpReward: 30 },
    };
    case "revision_quiz": return {
      settings: { attemptLimit: 5, shuffleQuestions: true, showAnswersPolicy: "immediately", showExplanationPolicy: "immediately", reviewModeAllowed: true, autoGradeAllowed: true },
      rewards: { xpReward: 15 },
    };
    case "homework": return {
      settings: { allowLateSubmission: true, latePenaltyPercent: 10, showAnswersPolicy: "after_due_date", showExplanationPolicy: "after_due_date", manualReviewRequired: false, autoGradeAllowed: true },
      rewards: { xpReward: 25 },
    };
    case "exam": return {
      settings: { durationMinutes: 60, hasStrictTimer: true, attemptLimit: 1, passingScorePercent: 50, totalScore: 100, shuffleQuestions: true, shuffleChoices: true, showAnswersPolicy: "after_due_date", showExplanationPolicy: "after_due_date", autoGradeAllowed: true },
      rewards: { xpReward: 100, passScoreBonus: 25, perfectScoreBonus: 50 },
    };
    case "mock_exam": return {
      settings: { durationMinutes: 90, hasStrictTimer: true, attemptLimit: 2, passingScorePercent: 50, totalScore: 100, shuffleQuestions: true, shuffleChoices: true, showAnswersPolicy: "after_submit", showExplanationPolicy: "after_submit", reviewModeAllowed: true, autoGradeAllowed: true },
      rewards: { xpReward: 50, passScoreBonus: 10 },
    };
    case "final_exam": return {
      settings: { durationMinutes: 120, hasStrictTimer: true, attemptLimit: 1, passingScorePercent: 60, totalScore: 200, shuffleQuestions: true, shuffleChoices: true, showAnswersPolicy: "never", showExplanationPolicy: "never", autoGradeAllowed: true },
      rewards: { xpReward: 500, passScoreBonus: 100, perfectScoreBonus: 200 },
    };
    case "placement_test": return {
      settings: { durationMinutes: 30, hasStrictTimer: true, attemptLimit: 1, showAnswersPolicy: "never", autoGradeAllowed: true },
      rewards: {},
    };
    case "diagnostic_test": return {
      settings: { showAnswersPolicy: "after_submit", showExplanationPolicy: "after_submit", reviewModeAllowed: true, autoGradeAllowed: true },
      rewards: {},
    };
    case "assignment": return {
      settings: { fileUploadAllowed: true, manualReviewRequired: true, allowLateSubmission: true, latePenaltyPercent: 5, showAnswersPolicy: "after_due_date" },
      rewards: { xpReward: 40 },
    };
    case "project": return {
      settings: { fileUploadAllowed: true, manualReviewRequired: true, allowLateSubmission: true },
      rewards: { xpReward: 100 },
    };
    case "research": return {
      settings: { fileUploadAllowed: true, manualReviewRequired: true },
      rewards: { xpReward: 75 },
    };
    case "presentation": return {
      settings: { fileUploadAllowed: true, manualReviewRequired: true },
      rewards: { xpReward: 50 },
    };
    case "adaptive_assessment": return {
      settings: { showAnswersPolicy: "after_submit", showExplanationPolicy: "after_submit", autoGradeAllowed: true },
      rewards: { xpReward: 30 },
    };
    default: return { settings: {}, rewards: {} };
  }
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

let codeCounter = 0;
function genId() { return `asm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`; }
function genCode() { codeCounter++; return `ASM-26-${codeCounter.toString().padStart(6, "0")}`; }

/* ═══════════════════════════════════════════════════════════
   STORE
   ═══════════════════════════════════════════════════════════ */

interface AssessmentState {
  assessments: TeacherAssessment[];
  createAssessment: (data: CreateAssessmentData) => TeacherAssessment;
  updateAssessment: (id: string, data: Partial<TeacherAssessment>) => void;
  deleteAssessment: (id: string) => void;
  publishAssessment: (id: string) => void;
  unpublishAssessment: (id: string) => void;
  archiveAssessment: (id: string) => void;
  duplicateAssessment: (id: string) => TeacherAssessment | null;
  attachQuestion: (assessmentId: string, questionId: string) => void;
  detachQuestion: (assessmentId: string, questionId: string) => void;
  reorderQuestions: (assessmentId: string, questionIds: string[]) => void;
  attachToSession: (assessmentId: string, sessionId: string) => void;
  detachFromSession: (assessmentId: string, sessionId: string) => void;
}

export const useTeacherAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      assessments: [],

      createAssessment: (data) => {
        const now = new Date().toISOString();
        const preset = createAssessmentPreset(data.assessmentType);
        const assessment: TeacherAssessment = {
          id: genId(),
          publicCode: genCode(),
          title: data.title,
          subtitle: data.subtitle || "",
          description: data.description || "",
          instructions: data.instructions || "",
          thumbnail: data.thumbnail || "",
          tags: data.tags || [],
          assessmentType: data.assessmentType,
          questionIds: data.questionIds || [],
          courseIds: data.courseIds || [],
          chapterIds: data.chapterIds || [],
          lessonIds: data.lessonIds || [],
          conceptIds: data.conceptIds || [],
          atomicConceptIds: data.atomicConceptIds || [],
          sessionIds: data.sessionIds || [],
          settings: { ...preset.settings, ...data.settings },
          rewards: { ...preset.rewards, ...data.rewards },
          status: data.status || "draft",
          visibility: data.visibility || "enrolled_only",
          createdBy: data.createdBy || "Teacher",
          updatedBy: data.updatedBy || data.createdBy || "Teacher",
          version: 1,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ assessments: [assessment, ...s.assessments] }));
        return assessment;
      },

      updateAssessment: (id, data) => set((s) => ({
        assessments: s.assessments.map((a) => a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a),
      })),

      deleteAssessment: (id) => set((s) => ({ assessments: s.assessments.filter((a) => a.id !== id) })),
      publishAssessment: (id) => get().updateAssessment(id, { status: "published" }),
      unpublishAssessment: (id) => get().updateAssessment(id, { status: "draft" }),
      archiveAssessment: (id) => get().updateAssessment(id, { status: "archived" }),

      duplicateAssessment: (id) => {
        const orig = get().assessments.find((a) => a.id === id);
        if (!orig) return null;
        return get().createAssessment({ ...orig, title: `${orig.title} (Copy)`, status: "draft" });
      },

      attachQuestion: (assessmentId, questionId) => {
        const a = get().assessments.find((x) => x.id === assessmentId);
        if (a && !a.questionIds.includes(questionId)) get().updateAssessment(assessmentId, { questionIds: [...a.questionIds, questionId] });
      },

      detachQuestion: (assessmentId, questionId) => {
        const a = get().assessments.find((x) => x.id === assessmentId);
        if (a) get().updateAssessment(assessmentId, { questionIds: a.questionIds.filter((q) => q !== questionId) });
      },

      reorderQuestions: (assessmentId, questionIds) => {
        get().updateAssessment(assessmentId, { questionIds });
      },

      attachToSession: (assessmentId, sessionId) => {
        const a = get().assessments.find((x) => x.id === assessmentId);
        if (a && !(a.sessionIds || []).includes(sessionId)) get().updateAssessment(assessmentId, { sessionIds: [...(a.sessionIds || []), sessionId] });
      },

      detachFromSession: (assessmentId, sessionId) => {
        const a = get().assessments.find((x) => x.id === assessmentId);
        if (a) get().updateAssessment(assessmentId, { sessionIds: (a.sessionIds || []).filter((s) => s !== sessionId) });
      },
    }),
    { name: "classz-teacher-assessments" },
  ),
);

/* ═══════════════════════════════════════════════════════════
   STANDALONE ACCESSORS
   ═══════════════════════════════════════════════════════════ */

export function listAssessments(courseId?: string): TeacherAssessment[] {
  const all = useTeacherAssessmentStore.getState().assessments;
  if (!courseId) return all;
  return all.filter((a) => (a.courseIds || []).includes(courseId));
}

export function getAssessmentById(id: string): TeacherAssessment | undefined {
  return useTeacherAssessmentStore.getState().assessments.find((a) => a.id === id);
}

export function copyAssessmentToCourse(assessmentId: string, courseId: string): TeacherAssessment | null {
  const orig = getAssessmentById(assessmentId);
  if (!orig) return null;
  return useTeacherAssessmentStore.getState().createAssessment({ ...orig, courseIds: [courseId], status: "draft", title: `${orig.title} (Copy)` });
}

export function moveAssessmentToCourse(assessmentId: string, courseId: string): void {
  useTeacherAssessmentStore.getState().updateAssessment(assessmentId, { courseIds: [courseId] });
}

/* ═══════════════════════════════════════════════════════════
   BACKWARD-COMPAT ADAPTERS
   ═══════════════════════════════════════════════════════════ */

export function quizToAssessment(quiz: TeacherQuiz): CreateAssessmentData {
  const typeMap: Record<string, AssessmentType> = {
    practice: "practice_quiz", session_quiz: "session_quiz", revision: "revision_quiz",
    homework_quiz: "homework", checkpoint: "practice_quiz", exam_prep: "mock_exam", standalone: "custom",
  };
  return {
    title: quiz.title, assessmentType: typeMap[quiz.quizType] || "custom",
    description: quiz.description, questionIds: quiz.questionIds,
    courseIds: quiz.courseId ? [quiz.courseId] : [], chapterIds: quiz.chapterIds, sessionIds: quiz.sessionIds,
    conceptIds: quiz.conceptIds, atomicConceptIds: quiz.atomicConceptIds,
    settings: {
      durationMinutes: quiz.durationMinutes || undefined, attemptLimit: quiz.attemptLimit,
      passingScorePercent: quiz.passingScorePercent, shuffleQuestions: quiz.shuffleQuestions,
      shuffleChoices: quiz.shuffleChoices, showAnswersPolicy: quiz.showAnswersAfterSubmit ? "after_submit" : "never",
      showExplanationPolicy: quiz.showExplanationAfterSubmit ? "after_submit" : "never", autoGradeAllowed: true,
    },
    rewards: { xpReward: quiz.xpReward },
    status: quiz.status as AssessmentStatus, visibility: quiz.visibility as AssessmentVisibility,
  };
}

export function examToAssessment(exam: TeacherExam): CreateAssessmentData {
  const typeMap: Record<string, AssessmentType> = {
    periodic: "exam", weekly: "exam", monthly: "exam", final: "final_exam", mock: "mock_exam", custom: "custom",
  };
  return {
    title: exam.title, assessmentType: typeMap[exam.examType] || "exam",
    description: exam.description, questionIds: exam.questionIds,
    courseIds: exam.courseId ? [exam.courseId] : [], chapterIds: exam.chapterIds, sessionIds: exam.sessionIds,
    conceptIds: exam.conceptIds, atomicConceptIds: exam.atomicConceptIds,
    settings: {
      durationMinutes: exam.durationMinutes, hasStrictTimer: true, attemptLimit: exam.attemptLimit,
      passingScorePercent: exam.passingScorePercent, shuffleQuestions: exam.shuffleQuestions,
      shuffleChoices: exam.shuffleChoices, showAnswersPolicy: "after_due_date", autoGradeAllowed: true,
    },
    rewards: {
      xpReward: exam.examXpReward, passScoreBonus: exam.passScoreBonus,
      perfectScoreBonus: exam.perfectScoreBonus, allowRetakeXp: exam.allowRetakeXp, maxRetakeXp: exam.maxRetakeXp,
    },
    status: exam.status as AssessmentStatus, visibility: exam.visibility as AssessmentVisibility,
  };
}

export function homeworkToAssessment(hw: TeacherHomework): CreateAssessmentData {
  return {
    title: hw.title, assessmentType: "homework",
    description: hw.description,
    courseIds: hw.courseId ? [hw.courseId] : [], chapterIds: hw.chapterIds, sessionIds: hw.sessionIds,
    settings: {
      dueDate: hw.dueDate, allowLateSubmission: hw.allowLateSubmission, totalScore: hw.maxScore,
      manualReviewRequired: hw.homeworkType === "essay", autoGradeAllowed: hw.homeworkType !== "essay",
    },
    rewards: { xpReward: hw.xpReward },
    status: hw.status as AssessmentStatus, visibility: hw.visibility as AssessmentVisibility,
  };
}

export function assignmentToAssessment(asn: TeacherAssignment): CreateAssessmentData {
  const typeMap: Record<string, AssessmentType> = {
    project: "project", research: "research", presentation: "presentation", custom: "assignment",
  };
  return {
    title: asn.title, assessmentType: typeMap[asn.assignmentType] || "assignment",
    description: asn.description,
    courseIds: asn.courseId ? [asn.courseId] : [], chapterIds: asn.chapterIds, sessionIds: asn.sessionIds,
    settings: {
      dueDate: asn.dueDate, fileUploadAllowed: true, manualReviewRequired: true, rubric: asn.rubric,
    },
    rewards: { xpReward: asn.xpReward },
    status: asn.status as AssessmentStatus, visibility: asn.visibility as AssessmentVisibility,
  };
}

export function assessmentToQuizLike(a: TeacherAssessment): Partial<TeacherQuiz> {
  return {
    id: a.id, publicCode: a.publicCode, title: a.title, description: a.description || "",
    questionIds: a.questionIds, durationMinutes: a.settings.durationMinutes || 0,
    attemptLimit: a.settings.attemptLimit || 0, shuffleQuestions: a.settings.shuffleQuestions || false,
    shuffleChoices: a.settings.shuffleChoices || false, xpReward: a.rewards.xpReward || 0,
    passingScorePercent: a.settings.passingScorePercent || 0,
    showAnswersAfterSubmit: a.settings.showAnswersPolicy === "after_submit" || a.settings.showAnswersPolicy === "immediately",
    showExplanationAfterSubmit: a.settings.showExplanationPolicy === "after_submit" || a.settings.showExplanationPolicy === "immediately",
    status: a.status, createdAt: a.createdAt, updatedAt: a.updatedAt,
  };
}

export function assessmentToExamLike(a: TeacherAssessment): Partial<TeacherExam> {
  return {
    id: a.id, publicCode: a.publicCode, title: a.title, description: a.description || "",
    questionIds: a.questionIds, durationMinutes: a.settings.durationMinutes || 0,
    attemptLimit: a.settings.attemptLimit || 1, shuffleQuestions: a.settings.shuffleQuestions || false,
    shuffleChoices: a.settings.shuffleChoices || false, passingScorePercent: a.settings.passingScorePercent || 50,
    examXpReward: a.rewards.xpReward || 0, passScoreBonus: a.rewards.passScoreBonus || 0,
    perfectScoreBonus: a.rewards.perfectScoreBonus || 0, allowRetakeXp: a.rewards.allowRetakeXp || false,
    maxRetakeXp: a.rewards.maxRetakeXp || 0, status: a.status, createdAt: a.createdAt, updatedAt: a.updatedAt,
  };
}

export function assessmentToHomeworkLike(a: TeacherAssessment): Partial<TeacherHomework> {
  return {
    id: a.id, publicCode: a.publicCode, title: a.title, description: a.description || "",
    dueDate: a.settings.dueDate || "", maxScore: a.settings.totalScore || 0,
    allowLateSubmission: a.settings.allowLateSubmission || false, xpReward: a.rewards.xpReward || 0,
    status: a.status, createdAt: a.createdAt, updatedAt: a.updatedAt,
  };
}

export function assessmentToAssignmentLike(a: TeacherAssessment): Partial<TeacherAssignment> {
  return {
    id: a.id, publicCode: a.publicCode, title: a.title, description: a.description || "",
    rubric: a.settings.rubric || "", dueDate: a.settings.dueDate || "", xpReward: a.rewards.xpReward || 0,
    status: a.status, createdAt: a.createdAt, updatedAt: a.updatedAt,
  };
}

/* ═══════════════════════════════════════════════════════════
   TYPE LABELS
   ═══════════════════════════════════════════════════════════ */

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  practice_quiz: "Practice Quiz", session_quiz: "Session Quiz", revision_quiz: "Revision Quiz",
  homework: "Homework", exam: "Exam", mock_exam: "Mock Exam", final_exam: "Final Exam",
  placement_test: "Placement Test", diagnostic_test: "Diagnostic Test",
  assignment: "Assignment", project: "Project", research: "Research", presentation: "Presentation",
  adaptive_assessment: "Adaptive Assessment", custom: "Custom",
};
