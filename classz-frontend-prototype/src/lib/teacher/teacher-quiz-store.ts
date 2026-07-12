import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addQuizQuestion as addQuizQuestionApi, createQuiz as createQuizApi } from "@/lib/api/quizzes";
import { useTeacherQuestionStore } from "@/lib/teacher/teacher-question-store";

export type QuizType = "practice" | "session_quiz" | "revision" | "homework_quiz" | "checkpoint" | "exam_prep" | "standalone";
export type QuizStatus = "draft" | "published" | "archived";
export type QuizVisibility = "public" | "enrolled_only" | "private";

export interface TeacherQuiz {
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
  quizType: QuizType;
  questionIds: string[];
  durationMinutes: number;
  attemptLimit: number;
  shuffleQuestions: boolean;
  shuffleChoices: boolean;
  showAnswersAfterSubmit: boolean;
  showExplanationAfterSubmit: boolean;
  xpReward: number;
  passingScorePercent: number;
  status: QuizStatus;
  visibility: QuizVisibility;
  createdAt: string;
  updatedAt: string;

  // Backend sync — attemptLimit/shuffle*/xpReward/showAnswers* etc have no
  // backend column and stay local-only, same as the other teacher stores.
  backendId?: string;
  backendSynced?: boolean;
}

export type CreateQuizData = Pick<TeacherQuiz,
  "title" | "courseId" | "quizType"
> & Partial<Omit<TeacherQuiz, "id" | "publicCode" | "createdAt" | "updatedAt">>;

interface QuizState {
  quizzes: TeacherQuiz[];
  createQuiz: (data: CreateQuizData) => TeacherQuiz;
  updateQuiz: (quizId: string, data: Partial<TeacherQuiz>) => void;
  deleteQuiz: (quizId: string) => void;
  publishQuiz: (quizId: string) => void;
  archiveQuiz: (quizId: string) => void;
  duplicateQuiz: (quizId: string) => TeacherQuiz | null;
  attachQuizToSession: (quizId: string, sessionId: string) => void;
  detachQuizFromSession: (quizId: string, sessionId: string) => void;
}

let codeCounter = 0;

function generateId(): string {
  return `qz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function generateCode(): string {
  codeCounter++;
  return `QZ-26-${codeCounter.toString().padStart(4, "0")}`;
}

/** Best-effort backend sync for a batch of question ids: only questions
 * already synced to the backend (see teacher-question-store.ts) can be
 * attached to a real quiz — unsynced/unsupported-type questions are skipped
 * silently rather than blocking quiz creation. */
async function syncQuizQuestionsToBackend(quizBackendId: string, questionIds: string[]): Promise<void> {
  const questionState = useTeacherQuestionStore.getState();
  for (const [index, questionId] of questionIds.entries()) {
    const question = questionState.questions.find((q) => q.id === questionId);
    if (!question?.backendId) continue;
    try {
      await addQuizQuestionApi(quizBackendId, { question_id: question.backendId, position: index });
    } catch {
      // Skip — the question may already be attached, or the quiz/question
      // ownership check rejected it; the local quiz state is unaffected.
    }
  }
}

async function syncQuizToBackend(quiz: TeacherQuiz): Promise<void> {
  try {
    const created = await createQuizApi({
      title: quiz.title,
      description: quiz.description || null,
      course_id: quiz.courseId,
      chapter_id: quiz.chapterIds[0] ?? null,
      session_id: quiz.sessionIds[0] ?? null,
      duration_minutes: quiz.durationMinutes,
      passing_score: quiz.passingScorePercent,
      is_published: quiz.status === "published",
    });
    useTeacherQuizStore.getState().updateQuiz(quiz.id, { backendId: created.id, backendSynced: true });
    if (quiz.questionIds.length > 0) {
      await syncQuizQuestionsToBackend(created.id, quiz.questionIds);
    }
  } catch {
    // Leave the quiz as local-only; the teacher's draft isn't lost.
  }
}

export const useTeacherQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      quizzes: [],

      createQuiz: (data) => {
        const now = new Date().toISOString();
        const quiz: TeacherQuiz = {
          id: generateId(),
          publicCode: generateCode(),
          teacherId: data.teacherId || "TCH-26-0001",
          courseId: data.courseId,
          chapterIds: data.chapterIds || [],
          lessonIds: data.lessonIds || [],
          sessionIds: data.sessionIds || [],
          conceptIds: data.conceptIds || [],
          atomicConceptIds: data.atomicConceptIds || [],
          title: data.title,
          description: data.description || "",
          quizType: data.quizType,
          questionIds: data.questionIds || [],
          durationMinutes: data.durationMinutes || 10,
          attemptLimit: data.attemptLimit || 3,
          shuffleQuestions: data.shuffleQuestions ?? true,
          shuffleChoices: data.shuffleChoices ?? true,
          showAnswersAfterSubmit: data.showAnswersAfterSubmit ?? true,
          showExplanationAfterSubmit: data.showExplanationAfterSubmit ?? true,
          xpReward: data.xpReward || 30,
          passingScorePercent: data.passingScorePercent || 60,
          status: data.status || "draft",
          visibility: data.visibility || "enrolled_only",
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ quizzes: [quiz, ...state.quizzes] }));
        void syncQuizToBackend(quiz);
        return quiz;
      },

      updateQuiz: (quizId, data) => {
        const before = get().quizzes.find((q) => q.id === quizId);
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === quizId ? { ...q, ...data, updatedAt: new Date().toISOString() } : q,
          ),
        }));
        if (before?.backendId && data.questionIds) {
          const newIds = data.questionIds.filter((id) => !before.questionIds.includes(id));
          if (newIds.length > 0) void syncQuizQuestionsToBackend(before.backendId, newIds);
        }
      },

      deleteQuiz: (quizId) => {
        set((state) => ({ quizzes: state.quizzes.filter((q) => q.id !== quizId) }));
      },

      publishQuiz: (quizId) => {
        const quiz = get().quizzes.find((q) => q.id === quizId);
        if (quiz && quiz.questionIds.length > 0) {
          get().updateQuiz(quizId, { status: "published" });
        }
      },

      archiveQuiz: (quizId) => {
        get().updateQuiz(quizId, { status: "archived" });
      },

      duplicateQuiz: (quizId) => {
        const original = get().quizzes.find((q) => q.id === quizId);
        if (!original) return null;
        const { id, publicCode, createdAt, updatedAt, status, ...rest } = original;
        return get().createQuiz({ ...rest, title: `${rest.title} (Copy)`, status: "draft" });
      },

      attachQuizToSession: (quizId, sessionId) => {
        const quiz = get().quizzes.find((q) => q.id === quizId);
        if (!quiz) return;
        if (!quiz.sessionIds.includes(sessionId)) {
          get().updateQuiz(quizId, { sessionIds: [...quiz.sessionIds, sessionId] });
        }
      },

      detachQuizFromSession: (quizId, sessionId) => {
        const quiz = get().quizzes.find((q) => q.id === quizId);
        if (!quiz) return;
        get().updateQuiz(quizId, { sessionIds: quiz.sessionIds.filter((s) => s !== sessionId) });
      },
    }),
    { name: "classz-teacher-quizzes" },
  ),
);

export function listQuizzes(courseId?: string): TeacherQuiz[] {
  const all = useTeacherQuizStore.getState().quizzes;
  if (!courseId) return all;
  return all.filter((q) => q.courseId === courseId);
}

export function getQuizById(quizId: string): TeacherQuiz | undefined {
  return useTeacherQuizStore.getState().quizzes.find((q) => q.id === quizId);
}

export function getPublishedQuizzesForSession(sessionId: string): TeacherQuiz[] {
  return useTeacherQuizStore.getState().quizzes.filter(
    (q) => q.status === "published" && q.sessionIds.includes(sessionId),
  );
}
