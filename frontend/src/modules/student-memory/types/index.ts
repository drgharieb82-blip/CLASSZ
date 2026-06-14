export type LearningStyle = "visual" | "auditory" | "reading" | "practice" | "mixed";

export type DifficultyPreference = "easy" | "medium" | "hard" | "adaptive";

export type MemoryEventType =
  | "LessonCompleted"
  | "QuizCompleted"
  | "WeaknessDetected"
  | "MasteryImproved"
  | "RevisionCompleted"
  | "LearningPathUpdated";

export type MemoryImportance = "low" | "medium" | "high";

export type MemoryPriority = "low" | "medium" | "high";

export type MemoryEvent = {
  id: string;
  timestamp: string;
  eventType: MemoryEventType;
  title: string;
  description: string;
  importance: MemoryImportance;
};

export type MemoryTimeline = {
  id: string;
  studentId: string;
  events: MemoryEvent[];
};

export type DetectedWeakness = {
  id: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  severity: MemoryPriority;
  confidence: number;
  evidence: string[];
  recommendedAction: string;
};

export type DetectedStrength = {
  id: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  confidence: number;
  evidence: string[];
  reinforcementAction: string;
};

export type LearningPatternInsight = {
  id: string;
  patternType: "consistency" | "sessionLength" | "preferredTime" | "motivation";
  title: string;
  description: string;
  confidence: number;
  recommendation: string;
};

export type LearningPattern = {
  id: string;
  patternName: string;
  description: string;
  frequency: string;
  confidence: number;
};

export type ForgettingCurveItem = {
  id: string;
  conceptId: string;
  conceptName: string;
  lastReviewedAt: string;
  retentionScore: number;
  riskLevel: MemoryPriority;
  nextReviewAt: string;
  recommendation: string;
};

export type PersonalizedRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: MemoryPriority;
  actionType: "review" | "practice" | "quiz" | "lesson" | "learningPath";
  relatedConcept: string;
};

export type StudentSummary = {
  id: string;
  generatedAt: string;
  headline: string;
  overview: string;
  nextBestAction: string;
  confidence: number;
  strengthsCount: number;
  weaknessesCount: number;
};

export type LongTermMemoryInsight = {
  id: string;
  title: string;
  description: string;
  signalType: "strength" | "weakness" | "pattern" | "forgetting" | "recommendation";
  confidence: number;
  importance: MemoryImportance;
};

export type StudentMemorySnapshot = {
  studentProfile: StudentProfile;
  strengths: StudentStrength[];
  weaknesses: StudentWeakness[];
  learningPreferences: LearningPreference[];
  learningPatterns: LearningPattern[];
  studyHabit: StudyHabit;
  studyPatterns: StudyPattern[];
  attentionProfile: AttentionProfile | null;
  memoryTimeline: MemoryTimeline;
  detectedWeaknesses: DetectedWeakness[];
  detectedStrengths: DetectedStrength[];
  learningPatternInsights: LearningPatternInsight[];
  forgettingCurve: ForgettingCurveItem[];
  personalizedRecommendations: PersonalizedRecommendation[];
  studentSummary: StudentSummary | null;
  longTermMemoryInsights: LongTermMemoryInsight[];
};

export type StudentStrength = {
  id: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  masteryLevel: number;
  evidence: string;
};

export type StudentWeakness = {
  id: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  masteryLevel: number;
  priority: "low" | "medium" | "high";
  recommendedAction: string;
};

export type LearningPreference = {
  id: string;
  learningStyle: LearningStyle;
  preferredLanguage: "ar" | "en";
  preferredDifficulty: DifficultyPreference;
  bestContentType: "video" | "notes" | "questions" | "mixed";
};

export type StudyHabit = {
  preferredStudyTime: "morning" | "afternoon" | "evening" | "night";
  averageSessionMinutes: number;
  consistencyScore: number;
};

export type AttentionProfile = {
  focusLevel: number;
  distractionLevel: number;
  preferredSessionLength: number;
  attentionSpan: number;
  bestSessionLength: number;
  breakFrequencyMinutes: number;
  needsMotivation: boolean;
};

export type StudyPattern = {
  id: string;
  averageSessionMinutes: number;
  preferredStudyTime: "morning" | "afternoon" | "evening" | "night";
  weeklyStudyDays: number;
  consistencyLevel: "low" | "medium" | "high";
};

export type StudentProfile = {
  studentId: string;
  displayName: string;
  grade: string;
  preferredLanguage: "ar" | "en";
  learningStyle: LearningStyle;
  averageSessionMinutes: number;
  preferredDifficulty: DifficultyPreference;
  attentionSpan: number;
  strengths: StudentStrength[];
  weaknesses: StudentWeakness[];
};
