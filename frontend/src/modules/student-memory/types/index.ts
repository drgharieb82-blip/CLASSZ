export type LearningStyle = "visual" | "auditory" | "reading" | "practice" | "mixed";

export type DifficultyPreference = "easy" | "medium" | "hard" | "adaptive";

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

export type AttentionProfile = {
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
