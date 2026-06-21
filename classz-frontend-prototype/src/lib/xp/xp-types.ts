export type XPSourceType =
  | "session"
  | "quiz"
  | "exam"
  | "periodic_exam"
  | "question_practice"
  | "wrong_questions"
  | "weak_concept_review"
  | "daily_mission"
  | "streak"
  | "certificate"
  | "leaderboard";

export interface XPEvent {
  eventId: string;
  studentId: string;
  sourceType: XPSourceType;
  sourceId: string;
  xpAmount: number;
  reason: string;
  scorePercent?: number;
  attemptNumber?: number;
  awardedAt: string;
}

export interface ExamXPConfig {
  examXpReward: number;
  perfectScoreBonus: number;
  passScoreBonus: number;
  passScorePercent: number;
  allowRetakeXp: boolean;
  maxRetakeXp: number;
}

export interface LevelDefinition {
  level: number;
  title: string;
  minXP: number;
}

export interface AchievementDefinition {
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: "learning" | "practice" | "streak" | "social" | "mastery";
  condition: string;
}

export interface StudentAchievement {
  achievementId: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface DailyMission {
  id: string;
  title: string;
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: string;
}

export interface XPNotification {
  id: string;
  type: "xp_earned" | "level_up" | "achievement_unlocked" | "mission_completed" | "streak_bonus";
  title: string;
  description: string;
  xpAmount?: number;
  newLevel?: number;
  timestamp: string;
}
