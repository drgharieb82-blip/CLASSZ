import type { DetectedWeakness, MemoryTimeline, StudentWeakness } from "../types";

export function detectWeaknesses(weaknesses: StudentWeakness[], timeline: MemoryTimeline): DetectedWeakness[] {
  const weaknessEvents = timeline.events.filter((event) => event.eventType === "WeaknessDetected");

  return weaknesses.map((weakness) => ({
    id: `detected-${weakness.id}`,
    conceptId: weakness.conceptId,
    conceptName: weakness.conceptName,
    subject: weakness.subject,
    severity: weakness.priority,
    confidence: weakness.priority === "high" ? 88 : 74,
    evidence: [
      `${weakness.masteryLevel}% current mastery`,
      weakness.recommendedAction,
      weaknessEvents.length > 0 ? "Recent timeline contains weakness signals." : "No recent weakness event found.",
    ],
    recommendedAction: weakness.recommendedAction,
  }));
}

export const weaknessDetectionService = {
  detectWeaknesses,
};
