import type { DetectedStrength, MemoryTimeline, StudentStrength } from "../types";

export function detectStrengths(strengths: StudentStrength[], timeline: MemoryTimeline): DetectedStrength[] {
  const masteryEvents = timeline.events.filter((event) => event.eventType === "MasteryImproved" || event.eventType === "QuizCompleted");

  return strengths.map((strength) => ({
    id: `detected-${strength.id}`,
    conceptId: strength.conceptId,
    conceptName: strength.conceptName,
    subject: strength.subject,
    confidence: strength.masteryLevel >= 80 ? 90 : 78,
    evidence: [
      `${strength.masteryLevel}% current mastery`,
      strength.evidence,
      masteryEvents.length > 0 ? "Recent mastery or quiz completion supports this strength." : "Strength is based on profile mastery only.",
    ],
    reinforcementAction: `Use ${strength.conceptName} as a confidence anchor before harder connected practice.`,
  }));
}

export const strengthDetectionService = {
  detectStrengths,
};
