import type { LevelDefinition } from "./xp-types";

export const LEVELS: LevelDefinition[] = [
  { level: 1, title: "Beginner", minXP: 0 },
  { level: 2, title: "Learner", minXP: 100 },
  { level: 3, title: "Explorer", minXP: 250 },
  { level: 4, title: "Dedicated", minXP: 500 },
  { level: 5, title: "Focused", minXP: 850 },
  { level: 6, title: "Rising Star", minXP: 1300 },
  { level: 7, title: "Achiever", minXP: 1900 },
  { level: 8, title: "Ambitious", minXP: 2600 },
  { level: 9, title: "Skilled", minXP: 3500 },
  { level: 10, title: "Scholar", minXP: 4600 },
  { level: 12, title: "Advanced", minXP: 6200 },
  { level: 15, title: "Expert", minXP: 9000 },
  { level: 18, title: "Veteran", minXP: 13000 },
  { level: 20, title: "Master", minXP: 17000 },
  { level: 25, title: "Grandmaster", minXP: 25000 },
  { level: 30, title: "Legend", minXP: 40000 },
];

export function getLevelForXP(totalXP: number): LevelDefinition {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (totalXP >= l.minXP) current = l;
    else break;
  }
  return current;
}

export function getNextLevel(totalXP: number): LevelDefinition | null {
  for (const l of LEVELS) {
    if (l.minXP > totalXP) return l;
  }
  return null;
}

export function getLevelProgress(totalXP: number): {
  currentLevel: LevelDefinition;
  nextLevel: LevelDefinition | null;
  progressPercent: number;
  xpToNext: number;
} {
  const currentLevel = getLevelForXP(totalXP);
  const nextLevel = getNextLevel(totalXP);

  if (!nextLevel) {
    return { currentLevel, nextLevel: null, progressPercent: 100, xpToNext: 0 };
  }

  const levelRange = nextLevel.minXP - currentLevel.minXP;
  const progressInLevel = totalXP - currentLevel.minXP;
  const progressPercent = Math.round((progressInLevel / levelRange) * 100);

  return {
    currentLevel,
    nextLevel,
    progressPercent,
    xpToNext: nextLevel.minXP - totalXP,
  };
}
