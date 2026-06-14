import type {
  ConceptReviewNeed,
  ForgettingCurveItem,
  ForgettingCurvePoint,
  ForgettingUrgency,
  MemoryPriority,
  MemoryTimeline,
  StudentStrength,
  StudentWeakness,
} from "../types";

const dayMs = 24 * 60 * 60 * 1000;
const forgettingThreshold = 60;

type ConceptMemoryInput = {
  conceptId: string;
  conceptName: string;
  masteryLevel: number;
  confidence: number;
};

function addDays(timestamp: string, days: number) {
  return new Date(new Date(timestamp).getTime() + days * dayMs).toISOString();
}

function daysSince(timestamp: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / dayMs));
}

function urgencyFromRetention(retentionScore: number): ForgettingUrgency {
  if (retentionScore < 30) {
    return "Critical";
  }

  if (retentionScore < 50) {
    return "High";
  }

  if (retentionScore < 75) {
    return "Medium";
  }

  return "Low";
}

function priorityFromUrgency(urgency: ForgettingUrgency): MemoryPriority {
  if (urgency === "Critical" || urgency === "High") {
    return "high";
  }

  if (urgency === "Medium") {
    return "medium";
  }

  return "low";
}

function reviewDelayForUrgency(urgency: ForgettingUrgency) {
  if (urgency === "Critical") {
    return 0;
  }

  if (urgency === "High") {
    return 1;
  }

  if (urgency === "Medium") {
    return 2;
  }

  return 5;
}

export function calculateRetentionScore(lastReviewedAt: string, masteryLevel: number, confidence: number): number {
  const elapsedDays = daysSince(lastReviewedAt);
  const masteryResistance = Math.max(0.45, masteryLevel / 100);
  const confidenceDrag = (100 - confidence) * 0.18;
  const decay = elapsedDays * (7 - masteryResistance * 3.5);

  return Math.max(0, Math.min(100, Math.round(masteryLevel - decay - confidenceDrag)));
}

export function predictForgettingDate(lastReviewedAt: string, masteryLevel: number, confidence: number): string {
  const masteryResistance = Math.max(0.45, masteryLevel / 100);
  const dailyDecay = 7 - masteryResistance * 3.5;
  const confidenceDrag = (100 - confidence) * 0.18;
  const daysUntilThreshold = Math.max(0, Math.ceil((masteryLevel - confidenceDrag - forgettingThreshold) / dailyDecay));

  return addDays(lastReviewedAt, daysUntilThreshold);
}

function buildConceptInputs(strengths: StudentStrength[], weaknesses: StudentWeakness[]): ConceptMemoryInput[] {
  return [
    ...weaknesses.map((weakness) => ({
      conceptId: weakness.conceptId,
      conceptName: weakness.conceptName,
      masteryLevel: weakness.masteryLevel,
      confidence: weakness.priority === "high" ? 42 : weakness.priority === "medium" ? 58 : 72,
    })),
    ...strengths.map((strength) => ({
      conceptId: strength.conceptId,
      conceptName: strength.conceptName,
      masteryLevel: strength.masteryLevel,
      confidence: Math.min(94, Math.max(65, strength.masteryLevel + 8)),
    })),
  ];
}

function findLastReviewDate(conceptName: string, timeline: MemoryTimeline, fallbackTimestamp: string, index: number) {
  const relatedEvent = timeline.events.find((event) => event.description.toLowerCase().includes(conceptName.toLowerCase()));

  return relatedEvent?.timestamp ?? addDays(fallbackTimestamp, index);
}

export function calculateForgettingRisk(
  strengths: StudentStrength[],
  weaknesses: StudentWeakness[],
  timeline: MemoryTimeline,
): ForgettingCurveItem[] {
  const fallbackTimestamp = timeline.events[timeline.events.length - 1]?.timestamp ?? new Date().toISOString();

  return buildConceptInputs(strengths, weaknesses).map((concept, index) => {
    const lastReviewedAt = findLastReviewDate(concept.conceptName, timeline, fallbackTimestamp, index);
    const retentionScore = calculateRetentionScore(lastReviewedAt, concept.masteryLevel, concept.confidence);
    const urgency = urgencyFromRetention(retentionScore);
    const recommendedReviewAt = addDays(new Date().toISOString(), reviewDelayForUrgency(urgency));
    const reason =
      urgency === "Critical"
        ? "Retention is below 30%, so the concept needs immediate review."
        : urgency === "High"
          ? "Retention is below 50%, so review should happen very soon."
          : urgency === "Medium"
            ? "Retention is below 75%, so a spaced review session is recommended."
            : "Retention is stable, but a light spaced review will help maintain mastery.";

    return {
      id: `forgetting-${concept.conceptId}`,
      conceptId: concept.conceptId,
      conceptName: concept.conceptName,
      lastReviewedAt,
      retentionScore,
      predictedForgettingDate: predictForgettingDate(lastReviewedAt, concept.masteryLevel, concept.confidence),
      urgency,
      riskLevel: priorityFromUrgency(urgency),
      nextReviewAt: recommendedReviewAt,
      recommendation: reason,
    };
  });
}

export function getReviewNeeds(
  strengths: StudentStrength[],
  weaknesses: StudentWeakness[],
  timeline: MemoryTimeline,
): ConceptReviewNeed[] {
  return calculateForgettingRisk(strengths, weaknesses, timeline).map((point) => ({
    conceptId: point.conceptId,
    conceptName: point.conceptName,
    urgency: point.urgency,
    recommendedReviewAt: point.nextReviewAt,
    reason: point.recommendation,
  }));
}

export const forgettingCurveService = {
  calculateRetentionScore,
  predictForgettingDate,
  getReviewNeeds,
  calculateForgettingRisk,
};
