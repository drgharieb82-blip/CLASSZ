import type { ExamXPConfig } from "./xp-types";

export const XP_RULES = {
  session_completed: 50,
  quiz_base: 30,
  quiz_score_multiplier: 0.4,
  quiz_high_score_bonus: 25,
  quiz_perfect_bonus: 50,
  quiz_high_score_threshold: 80,
  questions_solved_10: 20,
  wrong_questions_retry: 15,
  weak_concept_review: 20,
  daily_mission: 20,
  streak_7_day: 70,
  streak_30_day: 200,
  certificate_unlocked: 100,
  leaderboard_top3: 150,
  leaderboard_top10: 75,
} as const;

export function calculateQuizXP(scorePercent: number, attemptNumber: number): { total: number; breakdown: string[] } {
  if (attemptNumber > 1) {
    const reduced = Math.round(XP_RULES.quiz_base * 0.25);
    return { total: reduced, breakdown: [`Retake: +${reduced} XP`] };
  }

  const breakdown: string[] = [];
  let total = XP_RULES.quiz_base;
  breakdown.push(`Base: +${XP_RULES.quiz_base} XP`);

  const scoreBonus = Math.round(scorePercent * XP_RULES.quiz_score_multiplier);
  total += scoreBonus;
  breakdown.push(`Score bonus: +${scoreBonus} XP`);

  if (scorePercent >= XP_RULES.quiz_high_score_threshold) {
    total += XP_RULES.quiz_high_score_bonus;
    breakdown.push(`High score (≥80%): +${XP_RULES.quiz_high_score_bonus} XP`);
  }

  if (scorePercent === 100) {
    total += XP_RULES.quiz_perfect_bonus;
    breakdown.push(`Perfect score: +${XP_RULES.quiz_perfect_bonus} XP`);
  }

  return { total, breakdown };
}

export function calculateExamXP(
  config: ExamXPConfig,
  scorePercent: number,
  attemptNumber: number,
): { total: number; breakdown: string[] } {
  const breakdown: string[] = [];

  if (attemptNumber > 1 && !config.allowRetakeXp) {
    return { total: 0, breakdown: ["Retake: no XP awarded"] };
  }

  let total = config.examXpReward;
  breakdown.push(`Exam completion: +${config.examXpReward} XP`);

  if (scorePercent >= config.passScorePercent && config.passScoreBonus > 0) {
    total += config.passScoreBonus;
    breakdown.push(`Pass bonus (≥${config.passScorePercent}%): +${config.passScoreBonus} XP`);
  }

  if (scorePercent === 100 && config.perfectScoreBonus > 0) {
    total += config.perfectScoreBonus;
    breakdown.push(`Perfect score: +${config.perfectScoreBonus} XP`);
  }

  if (attemptNumber > 1 && config.allowRetakeXp) {
    total = Math.min(total, config.maxRetakeXp);
    breakdown.push(`Retake cap: max ${config.maxRetakeXp} XP`);
  }

  return { total, breakdown };
}

export function getExpectedExamXP(config: ExamXPConfig): string {
  const max = config.examXpReward + config.passScoreBonus + config.perfectScoreBonus;
  return `Complete this exam and earn up to ${max} XP`;
}
