import type { DetectedStrength, DetectedWeakness, PersonalizedRecommendation, StudentProfile, StudentSummary } from "../types";

export function generateStudentSummary(
  profile: StudentProfile,
  strengths: DetectedStrength[],
  weaknesses: DetectedWeakness[],
  recommendations: PersonalizedRecommendation[],
): StudentSummary {
  const topStrength = strengths[0]?.conceptName ?? "core concepts";
  const topWeakness = weaknesses[0]?.conceptName ?? "the next target concept";
  const nextBestAction = recommendations[0]?.description ?? "Continue the current learning path with a short review session.";

  return {
    id: `summary-${profile.studentId}`,
    generatedAt: new Date().toISOString(),
    headline: `${profile.displayName} is building a stronger ${profile.grade} learning profile.`,
    overview: `The strongest current anchor is ${topStrength}. The main support area is ${topWeakness}.`,
    nextBestAction,
    confidence: strengths.length > 0 && weaknesses.length > 0 ? 86 : 72,
    strengthsCount: strengths.length,
    weaknessesCount: weaknesses.length,
  };
}

export const studentSummaryService = {
  generateStudentSummary,
};
