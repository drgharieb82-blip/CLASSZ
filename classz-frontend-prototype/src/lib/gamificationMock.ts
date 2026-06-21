export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  category: "learning" | "practice" | "streak" | "social" | "mastery";
}

export const achievements: Achievement[] = [
  { id: "first-session", title: "First Session", description: "Complete your first learning session", icon: "🎯", xpReward: 50, unlocked: true, unlockedAt: "2026-06-01", category: "learning" },
  { id: "first-quiz", title: "First Quiz", description: "Complete your first quiz", icon: "📝", xpReward: 50, unlocked: true, unlockedAt: "2026-06-02", category: "practice" },
  { id: "perfect-score", title: "Perfect Score", description: "Score 100% on any quiz", icon: "💯", xpReward: 200, unlocked: true, unlockedAt: "2026-06-10", category: "mastery" },
  { id: "100-questions", title: "Century Solver", description: "Solve 100 questions", icon: "🧠", xpReward: 300, unlocked: true, unlockedAt: "2026-06-15", category: "practice" },
  { id: "7-day-streak", title: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", xpReward: 150, unlocked: true, unlockedAt: "2026-06-08", category: "streak" },
  { id: "30-day-streak", title: "Monthly Champion", description: "Maintain a 30-day streak", icon: "⚡", xpReward: 500, unlocked: false, category: "streak" },
  { id: "dragon-challenger", title: "Dragon Challenger", description: "Reach Top 3 on any leaderboard", icon: "🐉", xpReward: 1000, unlocked: false, category: "mastery" },
  { id: "quiz-master", title: "Quiz Master", description: "Complete 50 quizzes with 80%+", icon: "🏆", xpReward: 400, unlocked: false, category: "practice" },
  { id: "consistency-hero", title: "Consistency Hero", description: "Study every day for 14 days", icon: "🦸", xpReward: 250, unlocked: true, unlockedAt: "2026-06-14", category: "streak" },
  { id: "fast-learner", title: "Fast Learner", description: "Complete a session in under 20 minutes", icon: "⚡", xpReward: 100, unlocked: true, unlockedAt: "2026-06-05", category: "learning" },
  { id: "note-taker", title: "Note Taker", description: "Create 20 notes across your courses", icon: "📒", xpReward: 100, unlocked: true, unlockedAt: "2026-06-12", category: "learning" },
  { id: "early-bird", title: "Early Bird", description: "Study before 7 AM", icon: "🌅", xpReward: 75, unlocked: false, category: "streak" },
];

export interface XPLevel {
  level: number;
  title: string;
  minXP: number;
}

export const levels: XPLevel[] = [
  { level: 1, title: "Beginner", minXP: 0 },
  { level: 2, title: "Learner", minXP: 100 },
  { level: 3, title: "Explorer", minXP: 250 },
  { level: 5, title: "Dedicated", minXP: 600 },
  { level: 7, title: "Achiever", minXP: 1200 },
  { level: 10, title: "Scholar", minXP: 2500 },
  { level: 15, title: "Expert", minXP: 5000 },
  { level: 20, title: "Master", minXP: 10000 },
  { level: 25, title: "Grandmaster", minXP: 18000 },
  { level: 30, title: "Legend", minXP: 30000 },
];

export const currentXP = 2870;
export const currentLevel = 9;
export const currentTitle = "Achiever";
export const nextLevelXP = 5000;
export const currentStreak = 23;

export function getLevelForXP(xp: number): XPLevel {
  let current = levels[0];
  for (const l of levels) {
    if (xp >= l.minXP) current = l;
    else break;
  }
  return current;
}

export interface DailyMission {
  id: string;
  title: string;
  reward: string;
  progress: number;
  target: number;
  completed: boolean;
}

export const dailyMissions: DailyMission[] = [
  { id: "dm1", title: "Complete one session", reward: "+50 XP", progress: 0, target: 1, completed: false },
  { id: "dm2", title: "Solve 10 questions", reward: "+30 XP", progress: 7, target: 10, completed: false },
  { id: "dm3", title: "Review weak concepts", reward: "+20 XP", progress: 1, target: 1, completed: true },
  { id: "dm4", title: "Maintain your streak", reward: "+10 XP", progress: 1, target: 1, completed: true },
];

export interface RevisionItem {
  id: string;
  chapter: string;
  concept: string;
  subject: string;
  priority: "high" | "medium" | "low";
  confidence: number;
  estimatedMinutes: number;
  dueCategory: "today" | "tomorrow" | "overdue" | "weak" | "forgotten";
}

export const revisionItems: RevisionItem[] = [
  { id: "r1", chapter: "Differential Calculus", concept: "Chain Rule", subject: "Math", priority: "high", confidence: 35, estimatedMinutes: 15, dueCategory: "overdue" },
  { id: "r2", chapter: "Integral Calculus", concept: "Integration by Substitution", subject: "Math", priority: "high", confidence: 42, estimatedMinutes: 20, dueCategory: "today" },
  { id: "r3", chapter: "Organic Chemistry", concept: "Aromatic Compounds", subject: "Chemistry", priority: "medium", confidence: 55, estimatedMinutes: 12, dueCategory: "today" },
  { id: "r4", chapter: "Mechanics", concept: "Projectile Motion", subject: "Physics", priority: "medium", confidence: 48, estimatedMinutes: 18, dueCategory: "tomorrow" },
  { id: "r5", chapter: "Sequences", concept: "Series Convergence", subject: "Math", priority: "low", confidence: 60, estimatedMinutes: 10, dueCategory: "tomorrow" },
  { id: "r6", chapter: "Differential Calculus", concept: "Implicit Differentiation", subject: "Math", priority: "high", confidence: 30, estimatedMinutes: 25, dueCategory: "forgotten" },
  { id: "r7", chapter: "Chemical Equilibrium", concept: "Le Chatelier's Principle", subject: "Chemistry", priority: "medium", confidence: 50, estimatedMinutes: 15, dueCategory: "weak" },
];

export const welcomeMessages = [
  "Welcome back! 🔥 You're one session away from keeping your streak.",
  "Great job! Your chemistry progress improved this week. 🧪",
  "Keep pushing toward THE DRAGON! 🐉 You're getting closer.",
  "23 days strong! Don't break the chain today. ⚡",
  "You solved 15 questions yesterday — can you beat that today? 💪",
  "Your weak concepts are getting stronger. Keep reviewing! 📈",
];

export const parentConnection = {
  linked: true,
  parentName: "Mohamed Mansour",
  parentCode: "PRT-26-0001",
  relation: "Father",
  notificationsEnabled: true,
  connectedSince: "2026-02-01",
};
