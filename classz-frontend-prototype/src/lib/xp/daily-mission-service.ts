import type { DailyMission } from "./xp-types";

export function generateDailyMissions(): DailyMission[] {
  const today = new Date().toISOString().slice(0, 10);
  const stored = localStorage.getItem(`classz-missions-${today}`);
  if (stored) {
    return JSON.parse(stored);
  }

  const missions: DailyMission[] = [
    { id: `dm-${today}-1`, title: "Complete one session", xpReward: 20, progress: 0, target: 1, completed: false },
    { id: `dm-${today}-2`, title: "Solve 10 questions", xpReward: 20, progress: 0, target: 10, completed: false },
    { id: `dm-${today}-3`, title: "Review a weak concept", xpReward: 20, progress: 0, target: 1, completed: false },
    { id: `dm-${today}-4`, title: "Keep your streak alive", xpReward: 20, progress: 0, target: 1, completed: false },
  ];

  localStorage.setItem(`classz-missions-${today}`, JSON.stringify(missions));
  return missions;
}

export function updateMissionProgress(missionId: string, progress: number): DailyMission[] {
  const today = new Date().toISOString().slice(0, 10);
  const missions = generateDailyMissions();
  const updated = missions.map((m) => {
    if (m.id !== missionId) return m;
    const newProgress = Math.min(progress, m.target);
    const completed = newProgress >= m.target;
    return { ...m, progress: newProgress, completed, completedAt: completed ? new Date().toISOString() : undefined };
  });
  localStorage.setItem(`classz-missions-${today}`, JSON.stringify(updated));
  return updated;
}

export function completeMission(missionId: string): DailyMission[] {
  const today = new Date().toISOString().slice(0, 10);
  const missions = generateDailyMissions();
  const updated = missions.map((m) => {
    if (m.id !== missionId) return m;
    return { ...m, progress: m.target, completed: true, completedAt: new Date().toISOString() };
  });
  localStorage.setItem(`classz-missions-${today}`, JSON.stringify(updated));
  return updated;
}
