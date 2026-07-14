/**
 * Backward compatibility normalizers for flexible content models.
 *
 * These ensure old persisted data (without arrays) still works
 * after Phase A additions. Call these when reading from store
 * to guarantee arrays always exist.
 */

import type { TeacherSession } from "./teacher-session-store";
import type { TeacherMaterial } from "./teacher-material-store";
import type { TeacherQuestion } from "./teacher-question-store";

export function normalizeSession(session: Partial<TeacherSession> & { id: string; chapterId: string }): TeacherSession {
  return {
    ...session,
    sessionType: session.sessionType || "lesson",
    chapterIds: session.chapterIds || (session.chapterId ? [session.chapterId] : []),
    lessonIds: session.lessonIds || [],
    conceptIds: session.conceptIds || [],
    atomicConceptIds: session.atomicConceptIds || [],
    materialIds: session.materialIds || [],
    questionIds: session.questionIds || [],
    quizIds: session.quizIds || [],
    examIds: session.examIds || [],
    homeworkIds: session.homeworkIds || [],
    hasQuiz: session.hasQuiz || false,
    hasExam: session.hasExam || false,
    hasHomework: session.hasHomework || false,
    hasPractice: session.hasPractice || false,
  } as TeacherSession;
}

export function normalizeMaterial(material: Partial<TeacherMaterial> & { id: string; sessionId: string }): TeacherMaterial {
  return {
    ...material,
    linkedSessionIds: material.linkedSessionIds || (material.sessionId ? [material.sessionId] : []),
    linkedChapterIds: material.linkedChapterIds || (material.chapterId ? [material.chapterId] : []),
    linkedLessonIds: material.linkedLessonIds || [],
    linkedConceptIds: material.linkedConceptIds || [],
    linkedAtomicConceptIds: material.linkedAtomicConceptIds || [],
    reuseCount: material.reuseCount || 0,
    segments: material.segments || [],
  } as TeacherMaterial;
}

export function normalizeQuestion(question: Partial<TeacherQuestion> & { id: string }): TeacherQuestion {
  return {
    ...question,
    chapterIds: question.chapterIds || (question.chapterId ? [question.chapterId] : []),
    lessonIds: question.lessonIds || [],
    conceptIds: question.conceptIds || (question.concept ? [question.concept] : []),
    atomicConceptIds: question.atomicConceptIds || (question.atomicConcept ? [question.atomicConcept] : []),
    sessionIds: question.sessionIds || (question.sessionId ? [question.sessionId] : []),
  } as TeacherQuestion;
}
