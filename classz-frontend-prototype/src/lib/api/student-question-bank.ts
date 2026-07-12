import { api } from "./client";

export interface StudentQuestionOptionRead {
  id: string;
  text: string;
}

export interface StudentQuestionRead {
  id: string;
  course_id: string | null;
  title: string;
  question_type: string;
  difficulty: string;
  explanation: string | null;
  points: number;
  chapter_ids: string[];
  lesson_ids: string[];
  concept_ids: string[];
  atomic_concept_ids: string[];
  chapter_titles: string[];
  lesson_titles: string[];
  concept_titles: string[];
  atomic_concept_titles: string[];
  answer_data_json: Record<string, unknown> | null;
  options: StudentQuestionOptionRead[];
}

export interface StudentQuestionConceptRead {
  id: string;
  name: string;
  question_count: number;
}

export interface StudentQuestionLessonRead {
  id: string;
  title: string;
  concepts: StudentQuestionConceptRead[];
}

export interface StudentQuestionChapterRead {
  id: string;
  title: string;
  lessons: StudentQuestionLessonRead[];
  total_questions: number;
  solved_questions: number;
  progress: number;
}

export interface StudentQuestionCourseRead {
  id: string;
  name: string;
  subject: string;
  grade: string;
  total_questions: number;
  solved_questions: number;
  accuracy: number;
  available_quizzes: number;
  chapters: StudentQuestionChapterRead[];
}

export interface StudentPracticeAnswerSubmit {
  question_id: string;
  answer_data: Record<string, unknown>;
}

export interface StudentPracticeResultRead {
  question_id: string;
  is_correct: boolean;
  pending_manual_review: boolean;
  earned_points: number;
  max_points: number;
  explanation: string | null;
  correct_choice_ids: string[];
  correct_choice_texts: string[];
  accepted_text_answers: string[];
  correct_order_ids: string[];
  correct_pairs: Array<Record<string, string>>;
}

export interface StudentWrongQuestionRead {
  question_id: string;
  course_id: string | null;
  course_name: string;
  subject_name: string;
  chapter_titles: string[];
  lesson_titles: string[];
  concept_titles: string[];
  atomic_concept_titles: string[];
  difficulty: string;
  source: string;
  question: StudentQuestionRead;
  wrong_count: number;
  retry_count: number;
  retry_corrected: boolean;
  last_wrong_at: string;
  bookmarked: boolean;
}

export function listStudentQuestionBankCourses(): Promise<StudentQuestionCourseRead[]> {
  return api.get<StudentQuestionCourseRead[]>("/api/student/question-bank/courses");
}

export function listStudentQuestionBankQuestions(filters: {
  courseId: string;
  chapterId?: string;
  lessonId?: string;
  conceptId?: string;
  atomicConceptId?: string;
}): Promise<StudentQuestionRead[]> {
  const params = new URLSearchParams({ course_id: filters.courseId });
  if (filters.chapterId) params.set("chapter_id", filters.chapterId);
  if (filters.lessonId) params.set("lesson_id", filters.lessonId);
  if (filters.conceptId) params.set("concept_id", filters.conceptId);
  if (filters.atomicConceptId) params.set("atomic_concept_id", filters.atomicConceptId);
  return api.get<StudentQuestionRead[]>(`/api/student/question-bank/questions?${params.toString()}`);
}

export function evaluateStudentQuestion(
  payload: StudentPracticeAnswerSubmit,
): Promise<StudentPracticeResultRead> {
  return api.post<StudentPracticeResultRead>("/api/student/question-bank/evaluate", payload);
}

export function listStudentWrongQuestions(): Promise<StudentWrongQuestionRead[]> {
  return api.get<StudentWrongQuestionRead[]>("/api/student/wrong-questions");
}
