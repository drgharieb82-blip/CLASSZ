import type { DetectedWeakness, ForgettingCurveItem, LearningPatternInsight, PersonalizedRecommendation } from "../types";

export function generateRecommendations(
  weaknesses: DetectedWeakness[],
  forgettingRisks: ForgettingCurveItem[],
  patterns: LearningPatternInsight[],
): PersonalizedRecommendation[] {
  const highWeakness = weaknesses.find((weakness) => weakness.severity === "high") ?? weaknesses[0];
  const highForgettingRisk = forgettingRisks.find((risk) => risk.riskLevel === "high") ?? forgettingRisks[0];
  const sessionPattern = patterns.find((pattern) => pattern.patternType === "sessionLength");

  return [
    highWeakness
      ? {
          id: "recommendation-weakness",
          title: `Repair ${highWeakness.conceptName}`,
          description: highWeakness.recommendedAction,
          priority: highWeakness.severity,
          actionType: "practice",
          relatedConcept: highWeakness.conceptName,
        }
      : null,
    highForgettingRisk
      ? {
          id: "recommendation-forgetting",
          title: `Review ${highForgettingRisk.conceptName}`,
          description: highForgettingRisk.recommendation,
          priority: highForgettingRisk.riskLevel,
          actionType: "review",
          relatedConcept: highForgettingRisk.conceptName,
        }
      : null,
    sessionPattern
      ? {
          id: "recommendation-pattern",
          title: "Use the best study window",
          description: sessionPattern.recommendation,
          priority: "medium",
          actionType: "learningPath",
          relatedConcept: "Study rhythm",
        }
      : null,
  ].filter((recommendation): recommendation is PersonalizedRecommendation => Boolean(recommendation));
}

export const recommendationService = {
  generateRecommendations,
};
