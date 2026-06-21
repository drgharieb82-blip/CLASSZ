import type { AchievementDefinition } from "./xp-types";

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { achievementId: "first-session", title: "First Session", description: "Complete your first learning session", icon: "🎯", xpReward: 50, category: "learning", condition: "sessions_completed >= 1" },
  { achievementId: "first-quiz", title: "First Quiz", description: "Complete your first quiz", icon: "📝", xpReward: 50, category: "practice", condition: "quizzes_completed >= 1" },
  { achievementId: "perfect-score", title: "Perfect Score", description: "Score 100% on any quiz or exam", icon: "💯", xpReward: 200, category: "mastery", condition: "any_score == 100" },
  { achievementId: "10-questions", title: "Question Rookie", description: "Solve 10 questions", icon: "✏️", xpReward: 30, category: "practice", condition: "questions_solved >= 10" },
  { achievementId: "50-questions", title: "Question Pro", description: "Solve 50 questions", icon: "📖", xpReward: 100, category: "practice", condition: "questions_solved >= 50" },
  { achievementId: "100-questions", title: "Century Solver", description: "Solve 100 questions", icon: "🧠", xpReward: 300, category: "practice", condition: "questions_solved >= 100" },
  { achievementId: "500-questions", title: "Knowledge Machine", description: "Solve 500 questions", icon: "🤖", xpReward: 500, category: "mastery", condition: "questions_solved >= 500" },
  { achievementId: "3-day-streak", title: "Getting Started", description: "Maintain a 3-day streak", icon: "✨", xpReward: 30, category: "streak", condition: "streak >= 3" },
  { achievementId: "7-day-streak", title: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", xpReward: 70, category: "streak", condition: "streak >= 7" },
  { achievementId: "14-day-streak", title: "Consistency Hero", description: "Maintain a 14-day streak", icon: "🦸", xpReward: 150, category: "streak", condition: "streak >= 14" },
  { achievementId: "30-day-streak", title: "Monthly Champion", description: "Maintain a 30-day streak", icon: "⚡", xpReward: 300, category: "streak", condition: "streak >= 30" },
  { achievementId: "60-day-streak", title: "Unstoppable", description: "Maintain a 60-day streak", icon: "💎", xpReward: 600, category: "streak", condition: "streak >= 60" },
  { achievementId: "5-quizzes", title: "Quiz Enthusiast", description: "Complete 5 quizzes", icon: "📋", xpReward: 75, category: "practice", condition: "quizzes_completed >= 5" },
  { achievementId: "10-quizzes", title: "Quiz Master", description: "Complete 10 quizzes with 80%+", icon: "🏆", xpReward: 200, category: "practice", condition: "quizzes_80plus >= 10" },
  { achievementId: "dragon-challenger", title: "Dragon Challenger", description: "Reach Top 3 on any leaderboard", icon: "🐉", xpReward: 1000, category: "mastery", condition: "leaderboard_rank <= 3" },
  { achievementId: "top-10", title: "Rising Star", description: "Reach Top 10 on any leaderboard", icon: "⭐", xpReward: 500, category: "social", condition: "leaderboard_rank <= 10" },
  { achievementId: "fast-learner", title: "Fast Learner", description: "Complete 3 sessions in one day", icon: "⚡", xpReward: 100, category: "learning", condition: "sessions_today >= 3" },
  { achievementId: "note-taker", title: "Note Taker", description: "Create 20 notes across courses", icon: "📒", xpReward: 100, category: "learning", condition: "notes_created >= 20" },
  { achievementId: "early-bird", title: "Early Bird", description: "Study before 7 AM", icon: "🌅", xpReward: 75, category: "streak", condition: "study_before_7am" },
  { achievementId: "night-owl", title: "Night Owl", description: "Study after 11 PM", icon: "🦉", xpReward: 75, category: "streak", condition: "study_after_11pm" },
  { achievementId: "first-certificate", title: "Certified!", description: "Earn your first certificate", icon: "🎓", xpReward: 200, category: "mastery", condition: "certificates >= 1" },
  { achievementId: "wrong-q-master", title: "Mistake Master", description: "Correct 50 wrong questions", icon: "✅", xpReward: 150, category: "practice", condition: "wrong_corrected >= 50" },
];

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.achievementId === id);
}

export function getAchievementsByCategory(category: AchievementDefinition["category"]): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}
