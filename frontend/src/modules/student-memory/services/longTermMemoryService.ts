import type {
  DetectedStrength,
  DetectedWeakness,
  LongTermMemoryItem,
  MemoryInsight,
  MemoryTimeline,
  MemoryTrend,
  PersonalizedRecommendation,
  StudentProfile,
} from "../types";

export function getLongTermMemory(
  profile: StudentProfile,
  timeline: MemoryTimeline,
  strengths: DetectedStrength[],
  weaknesses: DetectedWeakness[],
  recommendations: PersonalizedRecommendation[],
): LongTermMemoryItem[] {
  const latestEvent = timeline.events[0];

  return [
    ...strengths.map((strength) => ({
      id: `ltm-item-strength-${strength.conceptId}`,
      title: `Reliable strength in ${strength.conceptName}`,
      type: "concept" as const,
      importance: "medium" as const,
      relatedConcept: strength.conceptName,
      insightSummary: strength.reinforcementAction,
      createdAt: latestEvent?.timestamp ?? new Date().toISOString(),
    })),
    ...weaknesses.map((weakness) => ({
      id: `ltm-item-weakness-${weakness.conceptId}`,
      title: `Support needed in ${weakness.conceptName}`,
      type: "risk" as const,
      importance: weakness.severity === "high" ? ("high" as const) : ("medium" as const),
      relatedConcept: weakness.conceptName,
      insightSummary: weakness.recommendedAction,
      createdAt: latestEvent?.timestamp ?? new Date().toISOString(),
    })),
    {
      id: "ltm-item-preference",
      title: `${profile.learningStyle} learning preference`,
      type: "preference",
      importance: "medium",
      relatedConcept: "Learning style",
      insightSummary: `Tutor responses should blend explanation, examples, and practice for ${profile.displayName}.`,
      createdAt: latestEvent?.timestamp ?? new Date().toISOString(),
    },
    ...recommendations.slice(0, 2).map((recommendation) => ({
      id: `ltm-item-recommendation-${recommendation.id}`,
      title: recommendation.title,
      type: "recommendation" as const,
      importance: recommendation.priority,
      relatedConcept: recommendation.relatedConcept,
      insightSummary: recommendation.description,
      createdAt: latestEvent?.timestamp ?? new Date().toISOString(),
    })),
  ];
}

export function generateMemoryInsights(memoryItems: LongTermMemoryItem[]): MemoryInsight[] {
  const highImportanceItems = memoryItems.filter((item) => item.importance === "high");
  const conceptItems = memoryItems.filter((item) => item.type === "concept");
  const riskItems = memoryItems.filter((item) => item.type === "risk");

  return [
    {
      id: "memory-insight-risk-load",
      title: "Active support load",
      summary: highImportanceItems.length > 0 ? `${highImportanceItems.length} high-priority memory signal needs tutor attention.` : "No high-priority memory signal is active.",
      importance: highImportanceItems.length > 0 ? "high" : "low",
      relatedConcept: highImportanceItems[0]?.relatedConcept ?? "General memory",
      confidence: 84,
    },
    {
      id: "memory-insight-concept-balance",
      title: "Concept balance",
      summary: `${conceptItems.length} strength memories and ${riskItems.length} risk memories are available for personalization.`,
      importance: riskItems.length > conceptItems.length ? "high" : "medium",
      relatedConcept: riskItems[0]?.relatedConcept ?? conceptItems[0]?.relatedConcept ?? "Concept map",
      confidence: 80,
    },
  ];
}

export function detectMemoryTrends(memoryItems: LongTermMemoryItem[], timeline: MemoryTimeline): MemoryTrend[] {
  const hasRecentMastery = timeline.events.some((event) => event.eventType === "MasteryImproved");
  const hasRecentWeakness = timeline.events.some((event) => event.eventType === "WeaknessDetected");
  const firstRisk = memoryItems.find((item) => item.type === "risk");
  const firstStrength = memoryItems.find((item) => item.type === "concept");

  return [
    {
      id: "memory-trend-mastery",
      title: "Mastery momentum",
      direction: hasRecentMastery ? "improving" : "stable",
      conceptName: firstStrength?.relatedConcept ?? "General mastery",
      summary: hasRecentMastery ? "Recent timeline events show mastery improvement that can be reinforced." : "Mastery signals are stable and need continued evidence.",
      confidence: hasRecentMastery ? 82 : 70,
    },
    {
      id: "memory-trend-risk",
      title: "Weakness pressure",
      direction: hasRecentWeakness ? "declining" : "stable",
      conceptName: firstRisk?.relatedConcept ?? "Weakness memory",
      summary: hasRecentWeakness ? "Recent weakness evidence suggests a short repair loop before adding difficulty." : "Weakness memory is not worsening in the latest timeline.",
      confidence: hasRecentWeakness ? 86 : 74,
    },
  ];
}

export const longTermMemoryService = {
  getLongTermMemory,
  generateMemoryInsights,
  detectMemoryTrends,
};
