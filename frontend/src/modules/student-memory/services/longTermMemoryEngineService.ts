import type {
  DetectedStrength,
  DetectedWeakness,
  ForgettingCurveItem,
  LearningPatternInsight,
  LongTermMemoryInsight,
  MemoryTimeline,
  PersonalizedRecommendation,
  StudentProfile,
} from "../types";

export function aggregateLongTermMemoryInsights(
  profile: StudentProfile,
  timeline: MemoryTimeline,
  strengths: DetectedStrength[],
  weaknesses: DetectedWeakness[],
  patterns: LearningPatternInsight[],
  forgettingRisks: ForgettingCurveItem[],
  recommendations: PersonalizedRecommendation[],
): LongTermMemoryInsight[] {
  const highRiskCount = forgettingRisks.filter((risk) => risk.riskLevel === "high").length;

  return [
    {
      id: "ltm-profile",
      title: "Stable learner profile",
      description: `${profile.displayName} has ${strengths.length} strength signals and ${weaknesses.length} active support signals in memory.`,
      signalType: strengths.length >= weaknesses.length ? "strength" : "weakness",
      confidence: 84,
      importance: weaknesses.length > 0 ? "high" : "medium",
    },
    {
      id: "ltm-timeline",
      title: "Timeline density",
      description: `${timeline.events.length} memory events are available for long-term learning context.`,
      signalType: "pattern",
      confidence: timeline.events.length >= 5 ? 88 : 70,
      importance: "medium",
    },
    {
      id: "ltm-forgetting",
      title: "Forgetting risk monitor",
      description: highRiskCount > 0 ? `${highRiskCount} concept requires urgent spaced review.` : "No urgent forgetting risk is currently detected.",
      signalType: "forgetting",
      confidence: 80,
      importance: highRiskCount > 0 ? "high" : "low",
    },
    {
      id: "ltm-next-action",
      title: "Next memory action",
      description: recommendations[0]?.description ?? patterns[0]?.recommendation ?? "Continue collecting learning signals.",
      signalType: "recommendation",
      confidence: 82,
      importance: recommendations[0]?.priority ?? "medium",
    },
  ];
}

export const longTermMemoryEngineService = {
  aggregateLongTermMemoryInsights,
};
