import type { ForgettingCurveItem, MemoryTimeline, StudentStrength, StudentWeakness } from "../types";

const dayMs = 24 * 60 * 60 * 1000;

function addDays(timestamp: string, days: number) {
  return new Date(new Date(timestamp).getTime() + days * dayMs).toISOString();
}

function calculateRetentionScore(lastReviewedAt: string, masteryLevel: number) {
  const daysSinceReview = Math.max(0, Math.floor((Date.now() - new Date(lastReviewedAt).getTime()) / dayMs));
  return Math.max(20, Math.min(96, masteryLevel - daysSinceReview * 6));
}

function riskFromRetention(retentionScore: number) {
  if (retentionScore < 50) {
    return "high" as const;
  }

  if (retentionScore < 72) {
    return "medium" as const;
  }

  return "low" as const;
}

export function calculateForgettingRisk(
  strengths: StudentStrength[],
  weaknesses: StudentWeakness[],
  timeline: MemoryTimeline,
): ForgettingCurveItem[] {
  const concepts = [
    ...weaknesses.map((weakness) => ({
      conceptId: weakness.conceptId,
      conceptName: weakness.conceptName,
      masteryLevel: weakness.masteryLevel,
    })),
    ...strengths.map((strength) => ({
      conceptId: strength.conceptId,
      conceptName: strength.conceptName,
      masteryLevel: strength.masteryLevel,
    })),
  ];

  const fallbackTimestamp = timeline.events[timeline.events.length - 1]?.timestamp ?? new Date().toISOString();

  return concepts.map((concept, index) => {
    const relatedEvent = timeline.events.find((event) => event.description.toLowerCase().includes(concept.conceptName.toLowerCase()));
    const lastReviewedAt = relatedEvent?.timestamp ?? addDays(fallbackTimestamp, index);
    const retentionScore = calculateRetentionScore(lastReviewedAt, concept.masteryLevel);
    const riskLevel = riskFromRetention(retentionScore);

    return {
      id: `forgetting-${concept.conceptId}`,
      conceptId: concept.conceptId,
      conceptName: concept.conceptName,
      lastReviewedAt,
      retentionScore,
      riskLevel,
      nextReviewAt: addDays(lastReviewedAt, riskLevel === "high" ? 1 : riskLevel === "medium" ? 2 : 4),
      recommendation: riskLevel === "high" ? "Review today with focused recall questions." : "Schedule a short spaced review session.",
    };
  });
}

export const forgettingCurveService = {
  calculateForgettingRisk,
};
