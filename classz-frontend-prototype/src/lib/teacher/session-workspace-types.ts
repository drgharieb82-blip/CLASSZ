/**
 * CLASSZ Session Workspace Types
 * Premium session builder architecture.
 * Sessions are learning experiences, not just video containers.
 */

export type SessionWorkspaceType =
  | "lesson" | "revision" | "practice" | "quiz_session" | "exam_session"
  | "homework_session" | "mixed" | "live" | "crash_course" | "final_revision";

export interface SessionTemplate {
  id: string;
  name: string;
  type: SessionWorkspaceType;
  blocks: SessionBlockType[];
  isBuiltIn: boolean;
}

export type SessionBlockType =
  | "video" | "pdf" | "notes" | "image" | "question_block"
  | "quiz_block" | "homework_block" | "exam_block" | "assignment_block"
  | "meeting_link" | "mind_map" | "summary";

export interface SessionBlock {
  id: string;
  type: SessionBlockType;
  title: string;
  order: number;
  entityId?: string;
  isNew?: boolean;
}

export interface SessionDependency {
  type: "session" | "quiz_score" | "homework_complete";
  entityId: string;
  entityTitle: string;
  minScore?: number;
}

export interface SessionCompletionRule {
  watchPercent?: number;
  questionCount?: number;
  quizMinScore?: number;
  homeworkSubmitted?: boolean;
  customRule?: string;
}

export interface SessionReward {
  xp: number;
  coins?: number;
  badgeId?: string;
  achievementId?: string;
}

export interface SessionTarget {
  type: "all" | "country" | "group" | "weak_students" | "scholarship" | "specific";
  value?: string;
}

export interface LearningObjective {
  conceptId: string;
  conceptTitle: string;
  atomicConceptIds: string[];
}

export interface SessionWorkspaceData {
  // Info
  subtitle: string;
  thumbnailUrl: string;
  bannerUrl: string;
  previewVideoUrl: string;
  teacherNote: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  // Type & Template
  workspaceType: SessionWorkspaceType;
  templateId?: string;
  // Canvas
  blocks: SessionBlock[];
  // Dependencies
  dependencies: SessionDependency[];
  prerequisiteSessionIds: string[];
  // Completion
  completionRules: SessionCompletionRule;
  // Rewards
  rewards: SessionReward;
  // Target
  targets: SessionTarget[];
  // Objectives
  objectives: LearningObjective[];
  // Series
  seriesId?: string;
  seriesName?: string;
  // Schedule
  publishAt?: string;
  closeAt?: string;
  lockAfterDays?: number;
  // Team
  assignedAssistant?: string;
  assignedContentManager?: string;
  assignedGrader?: string;
  // Version
  version: number;
  clonedFrom?: string;
}

export const BUILT_IN_TEMPLATES: SessionTemplate[] = [
  { id: "tpl-full-lesson", name: "Full Lesson", type: "lesson", blocks: ["video", "pdf", "question_block", "quiz_block", "homework_block"], isBuiltIn: true },
  { id: "tpl-revision", name: "Revision", type: "revision", blocks: ["video", "mind_map", "question_block", "quiz_block"], isBuiltIn: true },
  { id: "tpl-final-revision", name: "Final Revision", type: "final_revision", blocks: ["summary", "question_block", "exam_block"], isBuiltIn: true },
  { id: "tpl-live", name: "Live Session", type: "live", blocks: ["meeting_link", "notes", "homework_block"], isBuiltIn: true },
  { id: "tpl-practice", name: "Practice Only", type: "practice", blocks: ["question_block", "quiz_block"], isBuiltIn: true },
  { id: "tpl-crash", name: "Crash Course", type: "crash_course", blocks: ["video", "summary", "quiz_block", "exam_block"], isBuiltIn: true },
];

export const SESSION_TYPE_META: Record<SessionWorkspaceType, { label: string; color: string }> = {
  lesson: { label: "Lesson", color: "text-blue-600 bg-blue-500/10" },
  revision: { label: "Revision", color: "text-violet-600 bg-violet-500/10" },
  practice: { label: "Practice", color: "text-emerald-600 bg-emerald-500/10" },
  quiz_session: { label: "Quiz", color: "text-amber-600 bg-amber-500/10" },
  exam_session: { label: "Exam", color: "text-rose-600 bg-rose-500/10" },
  homework_session: { label: "Homework", color: "text-orange-600 bg-orange-500/10" },
  mixed: { label: "Mixed", color: "text-cyan-600 bg-cyan-500/10" },
  live: { label: "Live", color: "text-green-600 bg-green-500/10" },
  crash_course: { label: "Crash Course", color: "text-pink-600 bg-pink-500/10" },
  final_revision: { label: "Final Revision", color: "text-indigo-600 bg-indigo-500/10" },
};

export const BLOCK_META: Record<SessionBlockType, { label: string; icon: string; color: string }> = {
  video: { label: "Video", icon: "🎬", color: "border-blue-300 bg-blue-500/5" },
  pdf: { label: "PDF", icon: "📄", color: "border-rose-300 bg-rose-500/5" },
  notes: { label: "Notes", icon: "📝", color: "border-violet-300 bg-violet-500/5" },
  image: { label: "Image", icon: "🖼️", color: "border-emerald-300 bg-emerald-500/5" },
  question_block: { label: "Questions", icon: "❓", color: "border-amber-300 bg-amber-500/5" },
  quiz_block: { label: "Quiz", icon: "📋", color: "border-cyan-300 bg-cyan-500/5" },
  homework_block: { label: "Homework", icon: "✏️", color: "border-orange-300 bg-orange-500/5" },
  exam_block: { label: "Exam", icon: "📑", color: "border-red-300 bg-red-500/5" },
  assignment_block: { label: "Assignment", icon: "📁", color: "border-slate-300 bg-slate-500/5" },
  meeting_link: { label: "Live Meeting", icon: "📡", color: "border-green-300 bg-green-500/5" },
  mind_map: { label: "Mind Map", icon: "🧠", color: "border-pink-300 bg-pink-500/5" },
  summary: { label: "Summary", icon: "📊", color: "border-indigo-300 bg-indigo-500/5" },
};
