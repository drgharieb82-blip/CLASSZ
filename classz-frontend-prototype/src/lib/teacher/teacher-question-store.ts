import { create } from "zustand";
import { persist } from "zustand/middleware";

export type QuestionType = "mcq" | "essay" | "calculation";
export type QuestionDifficulty = "easy" | "medium" | "hard";
export type QuestionStatus = "draft" | "published" | "archived";

export interface MCQChoice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface TeacherQuestion {
  id: string;
  publicCode: string;
  type: QuestionType;
  courseId: string;
  chapterId: string;
  sessionId: string;
  concept: string;
  atomicConcept: string;
  difficulty: QuestionDifficulty;
  source: string;
  tags: string[];
  status: QuestionStatus;
  text: string;
  explanation: string;
  // MCQ
  choices?: MCQChoice[];
  // Essay
  modelAnswer?: string;
  maxWords?: number;
  // Calculation
  correctAnswer?: string;
  unit?: string;
  tolerance?: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateQuestionData = Pick<TeacherQuestion,
  "type" | "courseId" | "chapterId" | "sessionId" | "concept" | "atomicConcept" |
  "difficulty" | "source" | "tags" | "text" | "explanation"
> & {
  choices?: MCQChoice[];
  modelAnswer?: string;
  maxWords?: number;
  correctAnswer?: string;
  unit?: string;
  tolerance?: number;
  status?: QuestionStatus;
};

interface QuestionState {
  questions: TeacherQuestion[];
  createQuestion: (data: CreateQuestionData) => TeacherQuestion;
  updateQuestion: (questionId: string, data: Partial<TeacherQuestion>) => void;
  deleteQuestion: (questionId: string) => void;
  publishQuestion: (questionId: string) => void;
  archiveQuestion: (questionId: string) => void;
  duplicateQuestion: (questionId: string) => TeacherQuestion | null;
}

let codeCounter = 0;

function generateId(): string {
  return `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function generateCode(): string {
  codeCounter++;
  return `QST-26-${codeCounter.toString().padStart(6, "0")}`;
}

export const useTeacherQuestionStore = create<QuestionState>()(
  persist(
    (set, get) => ({
      questions: [],

      createQuestion: (data) => {
        const now = new Date().toISOString();
        const question: TeacherQuestion = {
          id: generateId(),
          publicCode: generateCode(),
          type: data.type,
          courseId: data.courseId,
          chapterId: data.chapterId,
          sessionId: data.sessionId,
          concept: data.concept,
          atomicConcept: data.atomicConcept,
          difficulty: data.difficulty,
          source: data.source,
          tags: data.tags,
          status: data.status || "draft",
          text: data.text,
          explanation: data.explanation,
          choices: data.choices,
          modelAnswer: data.modelAnswer,
          maxWords: data.maxWords,
          correctAnswer: data.correctAnswer,
          unit: data.unit,
          tolerance: data.tolerance,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ questions: [question, ...state.questions] }));
        return question;
      },

      updateQuestion: (questionId, data) => {
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === questionId ? { ...q, ...data, updatedAt: new Date().toISOString() } : q,
          ),
        }));
      },

      deleteQuestion: (questionId) => {
        set((state) => ({ questions: state.questions.filter((q) => q.id !== questionId) }));
      },

      publishQuestion: (questionId) => {
        get().updateQuestion(questionId, { status: "published" });
      },

      archiveQuestion: (questionId) => {
        get().updateQuestion(questionId, { status: "archived" });
      },

      duplicateQuestion: (questionId) => {
        const original = get().questions.find((q) => q.id === questionId);
        if (!original) return null;
        const { id, publicCode, createdAt, updatedAt, status, ...rest } = original;
        return get().createQuestion({ ...rest, status: "draft" });
      },
    }),
    { name: "classz-teacher-questions" },
  ),
);

export function listQuestions(courseId?: string): TeacherQuestion[] {
  const all = useTeacherQuestionStore.getState().questions;
  if (!courseId) return all;
  return all.filter((q) => q.courseId === courseId);
}

export function getQuestionById(questionId: string): TeacherQuestion | undefined {
  return useTeacherQuestionStore.getState().questions.find((q) => q.id === questionId);
}
