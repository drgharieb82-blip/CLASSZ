import type { XPEvent, XPSourceType, StudentAchievement, XPNotification, ExamXPConfig } from "./xp-types";
import { calculateQuizXP, calculateExamXP, XP_RULES } from "./xp-rules";
import { getLevelForXP, getLevelProgress } from "./level-service";
import { ACHIEVEMENTS } from "./achievement-service";

const STORAGE_KEY = "classz-xp-events";
const ACHIEVEMENTS_KEY = "classz-achievements";

function loadEvents(): XPEvent[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveEvents(events: XPEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function loadAchievements(): StudentAchievement[] {
  const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAchievements(achievements: StudentAchievement[]): void {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
}

function isDuplicate(events: XPEvent[], sourceType: XPSourceType, sourceId: string, attemptNumber?: number): boolean {
  if (attemptNumber && attemptNumber > 1) return false;
  return events.some((e) => e.sourceType === sourceType && e.sourceId === sourceId && (e.attemptNumber ?? 1) === 1);
}

function createEvent(studentId: string, sourceType: XPSourceType, sourceId: string, xpAmount: number, reason: string, opts?: { scorePercent?: number; attemptNumber?: number }): XPEvent {
  return {
    eventId: `xp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    studentId,
    sourceType,
    sourceId,
    xpAmount,
    reason,
    scorePercent: opts?.scorePercent,
    attemptNumber: opts?.attemptNumber ?? 1,
    awardedAt: new Date().toISOString(),
  };
}

export function getTotalXP(): number {
  return loadEvents().reduce((sum, e) => sum + e.xpAmount, 0);
}

export function getXPEvents(): XPEvent[] {
  return loadEvents();
}

export function getStudentAchievements(): StudentAchievement[] {
  return loadAchievements();
}

export function awardSessionXP(studentId: string, sessionId: string): XPEvent | null {
  const events = loadEvents();
  if (isDuplicate(events, "session", sessionId)) return null;

  const event = createEvent(studentId, "session", sessionId, XP_RULES.session_completed, "Session completed");
  events.push(event);
  saveEvents(events);
  return event;
}

export function awardQuizXP(studentId: string, quizId: string, scorePercent: number, attemptNumber: number): XPEvent | null {
  const events = loadEvents();
  if (attemptNumber === 1 && isDuplicate(events, "quiz", quizId)) return null;

  const { total } = calculateQuizXP(scorePercent, attemptNumber);
  const reason = attemptNumber > 1 ? `Quiz retake (${scorePercent}%)` : `Quiz completed (${scorePercent}%)`;
  const event = createEvent(studentId, "quiz", quizId, total, reason, { scorePercent, attemptNumber });
  events.push(event);
  saveEvents(events);
  return event;
}

export function awardExamXP(studentId: string, examId: string, config: ExamXPConfig, scorePercent: number, attemptNumber: number): XPEvent | null {
  const events = loadEvents();
  if (attemptNumber === 1 && isDuplicate(events, "exam", examId)) return null;

  const { total } = calculateExamXP(config, scorePercent, attemptNumber);
  if (total === 0) return null;

  const reason = `Exam completed (${scorePercent}%)`;
  const event = createEvent(studentId, "exam", examId, total, reason, { scorePercent, attemptNumber });
  events.push(event);
  saveEvents(events);
  return event;
}

export function awardGenericXP(studentId: string, sourceType: XPSourceType, sourceId: string, xpAmount: number, reason: string): XPEvent | null {
  const events = loadEvents();
  if (isDuplicate(events, sourceType, sourceId)) return null;

  const event = createEvent(studentId, sourceType, sourceId, xpAmount, reason);
  events.push(event);
  saveEvents(events);
  return event;
}

export function unlockAchievement(achievementId: string): { achievement: StudentAchievement; xpEvent: XPEvent | null } | null {
  const achievements = loadAchievements();
  const existing = achievements.find((a) => a.achievementId === achievementId);
  if (existing?.isUnlocked) return null;

  const def = ACHIEVEMENTS.find((a) => a.achievementId === achievementId);
  if (!def) return null;

  const sa: StudentAchievement = { achievementId, isUnlocked: true, unlockedAt: new Date().toISOString() };

  const updated = achievements.filter((a) => a.achievementId !== achievementId);
  updated.push(sa);
  saveAchievements(updated);

  const xpEvent = awardGenericXP("current", "certificate", `achievement-${achievementId}`, def.xpReward, `Achievement: ${def.title}`);

  return { achievement: sa, xpEvent };
}

export function getXPSummary() {
  const totalXP = getTotalXP();
  const levelInfo = getLevelProgress(totalXP);
  const achievements = loadAchievements();
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return {
    totalXP,
    ...levelInfo,
    unlockedAchievements: unlockedCount,
    totalAchievements: ACHIEVEMENTS.length,
  };
}
