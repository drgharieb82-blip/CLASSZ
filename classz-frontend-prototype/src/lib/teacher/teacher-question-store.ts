import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createQuestion as createQuestionApi,
  getDefaultCategoryId,
  type BackendDifficulty,
  type BackendQuestionType,
} from "@/lib/api/questions";

/* ═══════════════════════════════════════════════════════════
   QUESTION TYPES
   ═══════════════════════════════════════════════════════════ */

export type QuestionType =
  | "mcq" | "multi_select" | "true_false" | "short_answer" | "essay" | "calculation"
  | "fill_blank" | "matching" | "ordering" | "table_completion" | "matrix" | "classification"
  | "passage" | "case_study" | "group_question"
  | "drag_drop" | "hotspot" | "image_labeling" | "graph_plot" | "equation_builder" | "chemical_structure"
  | "file_upload" | "oral_answer" | "video_answer"
  | "coding"
  | "flashcard" | "adaptive";

export type QuestionDifficulty = "easy" | "medium" | "hard" | "advanced";
export type QuestionStatus = "draft" | "published" | "archived";
export type QuestionVisibility = "private" | "course" | "shared";

/* ═══════════════════════════════════════════════════════════
   ANSWER DATA — discriminated union per type
   ═══════════════════════════════════════════════════════════ */

export interface MCQChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  imageUrl?: string;
}

export interface MatchingPair { leftId: string; rightId: string; }
export interface TableCell { row: number; col: number; value: string; }
export interface CodingTestCase { input: string; expectedOutput: string; label?: string; hidden?: boolean; }
export interface HotspotZone { id: string; x: number; y: number; width: number; height: number; label: string; }
export interface AdaptiveRule { conditionType: string; conditionValue: string; nextQuestionId: string; }

export type AnswerData =
  | { kind: "mcq"; choices: MCQChoice[]; correctChoiceId: string }
  | { kind: "multi_select"; choices: MCQChoice[]; correctChoiceIds: string[] }
  | { kind: "true_false"; correctBoolean: boolean }
  | { kind: "short_answer"; acceptedAnswers: string[]; caseSensitive?: boolean; trimWhitespace?: boolean }
  | { kind: "essay"; modelAnswer?: string; keywords?: string[]; rubric?: string; maxWords?: number; gradingNotes?: string; manualReviewRequired?: boolean }
  | { kind: "calculation"; correctAnswer: string; unit?: string; tolerance?: number; solutionSteps?: string[]; formulaUsed?: string; manualReviewAllowed?: boolean }
  | { kind: "fill_blank"; promptWithBlanks: string; blanks: { id: string; acceptedAnswers: string[] }[] }
  | { kind: "matching"; leftItems: { id: string; text: string }[]; rightItems: { id: string; text: string }[]; correctPairs: MatchingPair[] }
  | { kind: "ordering"; items: { id: string; text: string }[]; correctOrder: string[] }
  | { kind: "table_completion"; columns: string[]; rows: string[]; blankCells: { row: number; col: number }[]; acceptedAnswersByCell: TableCell[] }
  | { kind: "matrix"; rows: string[]; columns: string[]; cellAnswers: TableCell[] }
  | { kind: "classification"; items: { id: string; text: string }[]; categories: { id: string; text: string }[]; correctCategoryByItem: Record<string, string> }
  | { kind: "passage"; passageText: string; subQuestionIds: string[] }
  | { kind: "case_study"; caseText: string; caseResources?: string[]; subQuestionIds: string[] }
  | { kind: "group_question"; groupStem: string; childQuestionIds: string[] }
  | { kind: "drag_drop"; draggableItems: { id: string; text: string }[]; dropZones: { id: string; label: string }[]; correctMapping: Record<string, string> }
  | { kind: "hotspot"; imageUrl: string; hotspots: HotspotZone[] }
  | { kind: "image_labeling"; imageUrl: string; labels: { id: string; text: string }[]; correctPositions: { labelId: string; x: number; y: number }[] }
  | { kind: "graph_plot"; graphConfig: Record<string, unknown>; expectedGraphData: Record<string, unknown>; tolerance?: number }
  | { kind: "equation_builder"; expectedEquation: string; acceptedEquivalentForms?: string[]; variables?: string[] }
  | { kind: "chemical_structure"; expectedStructure: string; acceptedStructures?: string[]; representation: "smiles" | "molfile" | "image" | "text" }
  | { kind: "file_upload"; allowedFileTypes: string[]; maxFileSizeMB?: number; rubric?: string }
  | { kind: "oral_answer"; prompt: string; maxDurationSeconds?: number; rubric?: string; transcriptionRequired?: boolean }
  | { kind: "video_answer"; prompt: string; maxDurationSeconds?: number; rubric?: string }
  | { kind: "coding"; language: string; starterCode?: string; testCases: CodingTestCase[]; timeLimitSeconds?: number; memoryLimitMB?: number }
  | { kind: "flashcard"; front: string; back: string; hint?: string }
  | { kind: "adaptive"; rules: AdaptiveRule[]; nextQuestionMap?: Record<string, string>; masteryThreshold?: number };

/* ═══════════════════════════════════════════════════════════
   ACADEMIC LINK
   ═══════════════════════════════════════════════════════════ */

export interface QuestionAcademicLink {
  id: string;
  chapterId?: string;
  lessonId?: string;
  conceptId?: string;
  atomicConceptId?: string;
}

/* ═══════════════════════════════════════════════════════════
   TEACHER QUESTION — full model
   ═══════════════════════════════════════════════════════════ */

export interface TeacherQuestion {
  id: string;
  publicCode: string;
  type: QuestionType;

  // Identity
  title?: string;
  body?: string;
  instructions?: string;

  // Legacy text field (backward compat — maps to body)
  text: string;

  // Owner
  teacherId?: string;
  ownerTeacherId?: string;

  // Course (optional)
  courseId: string;

  // Legacy single-value fields (backward compat)
  chapterId: string;
  sessionId: string;
  concept: string;
  atomicConcept: string;

  // Difficulty & metadata
  difficulty: QuestionDifficulty;
  estimatedTimeSeconds?: number;
  source: string;
  sourceType?: string;
  sourceLabel?: string;
  tags: string[];
  notes?: string;

  // Status
  status: QuestionStatus;
  visibility?: QuestionVisibility;

  // Versioning
  version?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;

  // Legacy answer fields (backward compat — preserved for old MCQ/Essay/Calc)
  choices?: MCQChoice[];
  modelAnswer?: string;
  maxWords?: number;
  correctAnswer?: string;
  unit?: string;
  tolerance?: number;
  explanation: string;

  // New structured answer data
  answerData?: AnswerData;

  // Pedagogical fields
  hint?: string;
  solution?: string;
  commonMistakes?: string[];
  teacherNotes?: string;
  studentFeedback?: string;
  markingScheme?: string;
  rubric?: string;
  points?: number;
  negativeMarks?: number;
  partialCreditAllowed?: boolean;

  // Media
  questionImages?: string[];
  choiceImages?: string[];
  solutionImages?: string[];
  attachments?: string[];

  // Backend sync (only mcq/multi_select/true_false/fill_blank/matching/
  // ordering/essay can sync — question_bank has no equivalent for the other
  // ~21 question types, which stay local-only)
  backendId?: string;
  backendSynced?: boolean;

  // Academic mapping (optional — can all be empty)
  academicLinks?: QuestionAcademicLink[];
  chapterIds: string[];
  lessonIds: string[];
  conceptIds: string[];
  atomicConceptIds: string[];

  // Many-to-many usage
  sessionIds: string[];
  quizIds?: string[];
  examIds?: string[];
  homeworkIds?: string[];
  assignmentIds?: string[];
  assessmentIds?: string[];

  // Relations
  similarQuestionIds?: string[];
  easierVersionIds?: string[];
  harderVersionIds?: string[];
  previousYearQuestionIds?: string[];
  sameConceptQuestionIds?: string[];
  parentQuestionId?: string;
  childQuestionIds?: string[];

  // Usage analytics
  useCount?: number;
  attemptCount?: number;
  correctCount?: number;
  wrongCount?: number;
  averageTimeSeconds?: number;
  wrongRate?: number;
  manualReviewCount?: number;
  pendingReviewCount?: number;
}

/* ═══════════════════════════════════════════════════════════
   CREATE DATA — all new fields optional for backward compat
   ═══════════════════════════════════════════════════════════ */

export type CreateQuestionData = Pick<TeacherQuestion, "type" | "text"> & {
  courseId?: string;
  chapterId?: string;
  sessionId?: string;
  concept?: string;
  atomicConcept?: string;
  difficulty?: QuestionDifficulty;
  source?: string;
  tags?: string[];
  explanation?: string;
  status?: QuestionStatus;
  // Legacy answer fields
  choices?: MCQChoice[];
  modelAnswer?: string;
  maxWords?: number;
  correctAnswer?: string;
  unit?: string;
  tolerance?: number;
  // New fields
  title?: string;
  body?: string;
  instructions?: string;
  answerData?: AnswerData;
  estimatedTimeSeconds?: number;
  sourceType?: string;
  sourceLabel?: string;
  notes?: string;
  visibility?: QuestionVisibility;
  hint?: string;
  solution?: string;
  commonMistakes?: string[];
  points?: number;
  negativeMarks?: number;
  partialCreditAllowed?: boolean;
  academicLinks?: QuestionAcademicLink[];
  questionImages?: string[];
  parentQuestionId?: string;
  childQuestionIds?: string[];
};

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

const BACKEND_TYPE_MAP: Partial<Record<QuestionType, BackendQuestionType>> = {
  mcq: "MCQ",
  multi_select: "MULTIPLE_SELECT",
  true_false: "TRUE_FALSE",
  fill_blank: "FILL_BLANK",
  matching: "MATCHING",
  ordering: "ORDERING",
  essay: "ESSAY",
};

const BACKEND_DIFFICULTY_MAP: Record<QuestionDifficulty, BackendDifficulty> = {
  easy: "EASY",
  medium: "MEDIUM",
  hard: "HARD",
  advanced: "HARD",
};

let codeCounter = 0;

function generateId(): string {
  return `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function generateCode(): string {
  codeCounter++;
  return `QST-26-${codeCounter.toString().padStart(6, "0")}`;
}

function deriveIds(links: QuestionAcademicLink[] | undefined, key: keyof QuestionAcademicLink): string[] {
  if (!links || links.length === 0) return [];
  const ids = links.map((l) => l[key] as string | undefined).filter(Boolean) as string[];
  return [...new Set(ids)];
}

export function createDefaultAnswerData(type: QuestionType): AnswerData | undefined {
  switch (type) {
    case "mcq": return { kind: "mcq", choices: [], correctChoiceId: "" };
    case "multi_select": return { kind: "multi_select", choices: [], correctChoiceIds: [] };
    case "true_false": return { kind: "true_false", correctBoolean: true };
    case "short_answer": return { kind: "short_answer", acceptedAnswers: [] };
    case "essay": return { kind: "essay" };
    case "calculation": return { kind: "calculation", correctAnswer: "" };
    case "fill_blank": return { kind: "fill_blank", promptWithBlanks: "", blanks: [] };
    case "matching": return { kind: "matching", leftItems: [], rightItems: [], correctPairs: [] };
    case "ordering": return { kind: "ordering", items: [], correctOrder: [] };
    case "table_completion": return { kind: "table_completion", columns: [], rows: [], blankCells: [], acceptedAnswersByCell: [] };
    case "matrix": return { kind: "matrix", rows: [], columns: [], cellAnswers: [] };
    case "classification": return { kind: "classification", items: [], categories: [], correctCategoryByItem: {} };
    case "passage": return { kind: "passage", passageText: "", subQuestionIds: [] };
    case "case_study": return { kind: "case_study", caseText: "", subQuestionIds: [] };
    case "group_question": return { kind: "group_question", groupStem: "", childQuestionIds: [] };
    case "drag_drop": return { kind: "drag_drop", draggableItems: [], dropZones: [], correctMapping: {} };
    case "hotspot": return { kind: "hotspot", imageUrl: "", hotspots: [] };
    case "image_labeling": return { kind: "image_labeling", imageUrl: "", labels: [], correctPositions: [] };
    case "graph_plot": return { kind: "graph_plot", graphConfig: {}, expectedGraphData: {} };
    case "equation_builder": return { kind: "equation_builder", expectedEquation: "" };
    case "chemical_structure": return { kind: "chemical_structure", expectedStructure: "", representation: "text" };
    case "file_upload": return { kind: "file_upload", allowedFileTypes: [] };
    case "oral_answer": return { kind: "oral_answer", prompt: "" };
    case "video_answer": return { kind: "video_answer", prompt: "" };
    case "coding": return { kind: "coding", language: "python", testCases: [] };
    case "flashcard": return { kind: "flashcard", front: "", back: "" };
    case "adaptive": return { kind: "adaptive", rules: [] };
    default: return undefined;
  }
}

export function normalizeQuestion(q: Partial<TeacherQuestion> & { id: string; type: QuestionType; text: string }): TeacherQuestion {
  const now = new Date().toISOString();
  return {
    id: q.id,
    publicCode: q.publicCode || "",
    type: q.type,
    title: q.title || "",
    body: q.body || q.text || "",
    instructions: q.instructions || "",
    text: q.text || q.body || "",
    teacherId: q.teacherId || "",
    ownerTeacherId: q.ownerTeacherId || "",
    courseId: q.courseId || "",
    chapterId: q.chapterId || "",
    sessionId: q.sessionId || "",
    concept: q.concept || "",
    atomicConcept: q.atomicConcept || "",
    difficulty: q.difficulty || "medium",
    estimatedTimeSeconds: q.estimatedTimeSeconds || 0,
    source: q.source || q.sourceLabel || "",
    sourceType: q.sourceType || "",
    sourceLabel: q.sourceLabel || q.source || "",
    tags: q.tags || [],
    notes: q.notes || "",
    status: q.status || "draft",
    visibility: q.visibility || "private",
    version: q.version || 1,
    createdBy: q.createdBy || "",
    updatedBy: q.updatedBy || "",
    createdAt: q.createdAt || now,
    updatedAt: q.updatedAt || now,
    choices: q.choices,
    modelAnswer: q.modelAnswer,
    maxWords: q.maxWords,
    correctAnswer: q.correctAnswer,
    unit: q.unit,
    tolerance: q.tolerance,
    explanation: q.explanation || "",
    answerData: q.answerData,
    hint: q.hint || "",
    solution: q.solution || "",
    commonMistakes: q.commonMistakes || [],
    teacherNotes: q.teacherNotes || "",
    studentFeedback: q.studentFeedback || "",
    markingScheme: q.markingScheme || "",
    rubric: q.rubric || "",
    points: q.points ?? 1,
    negativeMarks: q.negativeMarks ?? 0,
    partialCreditAllowed: q.partialCreditAllowed ?? false,
    questionImages: q.questionImages || [],
    choiceImages: q.choiceImages || [],
    solutionImages: q.solutionImages || [],
    attachments: q.attachments || [],
    academicLinks: q.academicLinks || [],
    chapterIds: q.chapterIds || (q.chapterId ? [q.chapterId] : deriveIds(q.academicLinks, "chapterId")),
    lessonIds: q.lessonIds || deriveIds(q.academicLinks, "lessonId"),
    conceptIds: q.conceptIds || (q.concept ? [q.concept] : deriveIds(q.academicLinks, "conceptId")),
    atomicConceptIds: q.atomicConceptIds || (q.atomicConcept ? [q.atomicConcept] : deriveIds(q.academicLinks, "atomicConceptId")),
    sessionIds: q.sessionIds || (q.sessionId ? [q.sessionId] : []),
    quizIds: q.quizIds || [],
    examIds: q.examIds || [],
    homeworkIds: q.homeworkIds || [],
    assignmentIds: q.assignmentIds || [],
    assessmentIds: q.assessmentIds || [],
    similarQuestionIds: q.similarQuestionIds || [],
    easierVersionIds: q.easierVersionIds || [],
    harderVersionIds: q.harderVersionIds || [],
    previousYearQuestionIds: q.previousYearQuestionIds || [],
    sameConceptQuestionIds: q.sameConceptQuestionIds || [],
    parentQuestionId: q.parentQuestionId,
    childQuestionIds: q.childQuestionIds || [],
    useCount: q.useCount ?? 0,
    attemptCount: q.attemptCount ?? 0,
    correctCount: q.correctCount ?? 0,
    wrongCount: q.wrongCount ?? 0,
    averageTimeSeconds: q.averageTimeSeconds ?? 0,
    wrongRate: q.wrongRate ?? 0,
    manualReviewCount: q.manualReviewCount ?? 0,
    pendingReviewCount: q.pendingReviewCount ?? 0,
  };
}

/* ═══════════════════════════════════════════════════════════
   STORE
   ═══════════════════════════════════════════════════════════ */

function linkArray(arr: string[] | undefined, id: string): string[] {
  const a = arr || [];
  return a.includes(id) ? a : [...a, id];
}

function unlinkArray(arr: string[] | undefined, id: string): string[] {
  return (arr || []).filter((x) => x !== id);
}

interface QuestionState {
  questions: TeacherQuestion[];
  createQuestion: (data: CreateQuestionData) => TeacherQuestion;
  updateQuestion: (questionId: string, data: Partial<TeacherQuestion>) => void;
  deleteQuestion: (questionId: string) => void;
  publishQuestion: (questionId: string) => void;
  archiveQuestion: (questionId: string) => void;
  duplicateQuestion: (questionId: string) => TeacherQuestion | null;
  linkQuestionToSession: (questionId: string, sessionId: string) => void;
  unlinkQuestionFromSession: (questionId: string, sessionId: string) => void;
  linkQuestionToQuiz: (questionId: string, quizId: string) => void;
  unlinkQuestionFromQuiz: (questionId: string, quizId: string) => void;
  linkQuestionToExam: (questionId: string, examId: string) => void;
  unlinkQuestionFromExam: (questionId: string, examId: string) => void;
  linkQuestionToHomework: (questionId: string, homeworkId: string) => void;
  unlinkQuestionFromHomework: (questionId: string, homeworkId: string) => void;
  linkQuestionToAssignment: (questionId: string, assignmentId: string) => void;
  unlinkQuestionFromAssignment: (questionId: string, assignmentId: string) => void;
  linkQuestionToAssessment: (questionId: string, assessmentId: string) => void;
  unlinkQuestionFromAssessment: (questionId: string, assessmentId: string) => void;
  incrementQuestionUse: (questionId: string, usageType: string, usageId: string) => void;
}

/** Fire-and-forget: creates the question (and MCQ/multi-select choices) on
 * the backend so it has a real id usable by quizzes/exams. Silently no-ops
 * for question types the backend doesn't support — those stay local-only. */
async function syncQuestionToBackend(question: TeacherQuestion): Promise<void> {
  const backendType = BACKEND_TYPE_MAP[question.type];
  if (!backendType) return;

  try {
    const categoryId = await getDefaultCategoryId();
    const answerData = question.answerData;
    const choices =
      answerData?.kind === "mcq"
        ? answerData.choices.map((choice, index) => ({
            client_id: choice.id,
            choice_text: choice.text,
            is_correct: choice.id === answerData.correctChoiceId,
            position: index,
          }))
        : answerData?.kind === "multi_select"
          ? answerData.choices.map((choice, index) => ({
              client_id: choice.id,
              choice_text: choice.text,
              is_correct: answerData.correctChoiceIds.includes(choice.id),
              position: index,
            }))
          : answerData?.kind === "true_false"
            ? [
                { client_id: "true", choice_text: "True", is_correct: answerData.correctBoolean === true, position: 0 },
                { client_id: "false", choice_text: "False", is_correct: answerData.correctBoolean === false, position: 1 },
              ]
            : [];
    const created = await createQuestionApi({
      category_id: categoryId,
      title: question.title || question.text,
      question_type: backendType,
      difficulty: BACKEND_DIFFICULTY_MAP[question.difficulty],
      explanation: question.explanation || null,
      course_id: question.courseId || null,
      answer_data_json: (question.answerData as Record<string, unknown> | undefined) ?? null,
      points: question.points ?? 1,
      chapter_ids: question.chapterIds || [],
      lesson_ids: question.lessonIds || [],
      concept_ids: question.conceptIds || [],
      atomic_concept_ids: question.atomicConceptIds || [],
      choices,
    });

    useTeacherQuestionStore.getState().updateQuestion(question.id, {
      backendId: created.id,
      backendSynced: true,
    });
  } catch {
    // Leave the question as local-only; the teacher's draft isn't lost, it
    // just won't be usable in a real quiz until sync succeeds on retry.
  }
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
          title: data.title || "",
          body: data.body || data.text || "",
          instructions: data.instructions || "",
          text: data.text || data.body || "",
          courseId: data.courseId || "",
          chapterId: data.chapterId || "",
          sessionId: data.sessionId || "",
          concept: data.concept || "",
          atomicConcept: data.atomicConcept || "",
          difficulty: data.difficulty || "medium",
          estimatedTimeSeconds: data.estimatedTimeSeconds || 0,
          source: data.source || data.sourceLabel || "",
          sourceType: data.sourceType || "",
          sourceLabel: data.sourceLabel || data.source || "",
          tags: data.tags || [],
          notes: data.notes || "",
          status: data.status || "draft",
          visibility: data.visibility || "private",
          version: 1,
          createdAt: now,
          updatedAt: now,
          explanation: data.explanation || "",
          // Legacy answer fields
          choices: data.choices,
          modelAnswer: data.modelAnswer,
          maxWords: data.maxWords,
          correctAnswer: data.correctAnswer,
          unit: data.unit,
          tolerance: data.tolerance,
          // Structured answer data
          answerData: data.answerData,
          // Pedagogical
          hint: data.hint || "",
          solution: data.solution || "",
          commonMistakes: data.commonMistakes || [],
          points: data.points ?? 1,
          negativeMarks: data.negativeMarks ?? 0,
          partialCreditAllowed: data.partialCreditAllowed ?? false,
          // Media
          questionImages: data.questionImages || [],
          // Academic mapping
          academicLinks: data.academicLinks || [],
          chapterIds: data.chapterId ? [data.chapterId] : deriveIds(data.academicLinks, "chapterId"),
          lessonIds: deriveIds(data.academicLinks, "lessonId"),
          conceptIds: data.concept ? [data.concept] : deriveIds(data.academicLinks, "conceptId"),
          atomicConceptIds: data.atomicConcept ? [data.atomicConcept] : deriveIds(data.academicLinks, "atomicConceptId"),
          // Usage
          sessionIds: data.sessionId ? [data.sessionId] : [],
          quizIds: [],
          examIds: [],
          homeworkIds: [],
          assignmentIds: [],
          assessmentIds: [],
          // Relations
          parentQuestionId: data.parentQuestionId,
          childQuestionIds: data.childQuestionIds || [],
          // Analytics defaults
          useCount: 0,
          attemptCount: 0,
          correctCount: 0,
          wrongCount: 0,
          averageTimeSeconds: 0,
          wrongRate: 0,
          manualReviewCount: 0,
          pendingReviewCount: 0,
        };
        set((state) => ({ questions: [question, ...state.questions] }));
        void syncQuestionToBackend(question);
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
        const { id, publicCode, createdAt, updatedAt, status, useCount, attemptCount, correctCount, wrongCount, ...rest } = original;
        return get().createQuestion({ ...rest, status: "draft" });
      },

      linkQuestionToSession: (questionId, sessionId) => {
        const q = get().questions.find((x) => x.id === questionId);
        if (q) get().updateQuestion(questionId, { sessionIds: linkArray(q.sessionIds, sessionId) });
      },
      unlinkQuestionFromSession: (questionId, sessionId) => {
        const q = get().questions.find((x) => x.id === questionId);
        if (q) get().updateQuestion(questionId, { sessionIds: unlinkArray(q.sessionIds, sessionId) });
      },

      linkQuestionToQuiz: (questionId, quizId) => {
        const q = get().questions.find((x) => x.id === questionId);
        if (q) get().updateQuestion(questionId, { quizIds: linkArray(q.quizIds, quizId) });
      },
      unlinkQuestionFromQuiz: (questionId, quizId) => {
        const q = get().questions.find((x) => x.id === questionId);
        if (q) get().updateQuestion(questionId, { quizIds: unlinkArray(q.quizIds, quizId) });
      },

      linkQuestionToExam: (questionId, examId) => {
        const q = get().questions.find((x) => x.id === questionId);
        if (q) get().updateQuestion(questionId, { examIds: linkArray(q.examIds, examId) });
      },
      unlinkQuestionFromExam: (questionId, examId) => {
        const q = get().questions.find((x) => x.id === questionId);
        if (q) get().updateQuestion(questionId, { examIds: unlinkArray(q.examIds, examId) });
      },

      linkQuestionToHomework: (questionId, homeworkId) => {
        const q = get().questions.find((x) => x.id === questionId);
        if (q) get().updateQuestion(questionId, { homeworkIds: linkArray(q.homeworkIds, homeworkId) });
      },
      unlinkQuestionFromHomework: (questionId, homeworkId) => {
        const q = get().questions.find((x) => x.id === questionId);
        if (q) get().updateQuestion(questionId, { homeworkIds: unlinkArray(q.homeworkIds, homeworkId) });
      },

      linkQuestionToAssignment: (questionId, assignmentId) => {
        const q = get().questions.find((x) => x.id === questionId);
        if (q) get().updateQuestion(questionId, { assignmentIds: linkArray(q.assignmentIds, assignmentId) });
      },
      unlinkQuestionFromAssignment: (questionId, assignmentId) => {
        const q = get().questions.find((x) => x.id === questionId);
        if (q) get().updateQuestion(questionId, { assignmentIds: unlinkArray(q.assignmentIds, assignmentId) });
      },
      linkQuestionToAssessment: (questionId, assessmentId) => {
        const q = get().questions.find((x) => x.id === questionId);
        if (q) get().updateQuestion(questionId, { assessmentIds: linkArray(q.assessmentIds, assessmentId) });
      },
      unlinkQuestionFromAssessment: (questionId, assessmentId) => {
        const q = get().questions.find((x) => x.id === questionId);
        if (q) get().updateQuestion(questionId, { assessmentIds: unlinkArray(q.assessmentIds, assessmentId) });
      },

      incrementQuestionUse: (questionId, usageType, usageId) => {
        const q = get().questions.find((x) => x.id === questionId);
        if (!q) return;
        const patch: Partial<TeacherQuestion> = { useCount: (q.useCount || 0) + 1 };
        if (usageType === "quiz") patch.quizIds = linkArray(q.quizIds, usageId);
        else if (usageType === "exam") patch.examIds = linkArray(q.examIds, usageId);
        else if (usageType === "homework") patch.homeworkIds = linkArray(q.homeworkIds, usageId);
        else if (usageType === "session") patch.sessionIds = linkArray(q.sessionIds, usageId);
        else if (usageType === "assignment") patch.assignmentIds = linkArray(q.assignmentIds, usageId);
        else if (usageType === "assessment") patch.assessmentIds = linkArray(q.assessmentIds, usageId);
        get().updateQuestion(questionId, patch);
      },
    }),
    { name: "classz-teacher-questions" },
  ),
);

/* ═══════════════════════════════════════════════════════════
   STANDALONE ACCESSORS
   ═══════════════════════════════════════════════════════════ */

export function listQuestions(courseId?: string): TeacherQuestion[] {
  const all = useTeacherQuestionStore.getState().questions;
  if (!courseId) return all;
  return all.filter((q) => q.courseId === courseId);
}

export function getQuestionById(questionId: string): TeacherQuestion | undefined {
  return useTeacherQuestionStore.getState().questions.find((q) => q.id === questionId);
}

export function linkQuestionToCourse(questionId: string, courseId: string): void {
  useTeacherQuestionStore.getState().updateQuestion(questionId, { courseId });
}

export function copyQuestionToCourse(questionId: string, courseId: string): TeacherQuestion | null {
  const original = getQuestionById(questionId);
  if (!original) return null;
  const { id, publicCode, createdAt, updatedAt, status, useCount, attemptCount, correctCount, wrongCount, ...rest } = original;
  return useTeacherQuestionStore.getState().createQuestion({ ...rest, courseId, status: "draft" } as any);
}

export function moveQuestionToCourse(questionId: string, courseId: string): void {
  useTeacherQuestionStore.getState().updateQuestion(questionId, { courseId });
}
