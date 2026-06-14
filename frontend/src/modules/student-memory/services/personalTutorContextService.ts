import type {
  PersonalTutorContext,
  PersonalizedRecommendation,
  StudentPersona,
  StudentProfile,
  StudentSummary,
  StudentWeakness,
  TutorRecommendation,
} from "../types";

export function summarizeStudentForTutor(profile: StudentProfile, persona: StudentPersona, summary: StudentSummary | null): string {
  return summary?.overview ?? `${profile.displayName} is a ${profile.grade} learner with a ${persona.learningStyle} learning preference and ${persona.personaName.toLowerCase()} profile.`;
}

export function generateTutorRecommendations(
  weaknesses: StudentWeakness[],
  recommendations: PersonalizedRecommendation[],
  persona: StudentPersona,
): TutorRecommendation[] {
  const primaryWeakness = weaknesses.find((weakness) => weakness.priority === "high") ?? weaknesses[0];
  const primaryRecommendation = recommendations[0];

  return [
    primaryWeakness
      ? {
          id: "tutor-recommendation-repair",
          title: `Repair ${primaryWeakness.conceptName}`,
          action: primaryWeakness.recommendedAction,
          rationale: "This concept has the highest local weakness priority.",
          priority: primaryWeakness.priority,
        }
      : null,
    primaryRecommendation
      ? {
          id: "tutor-recommendation-next",
          title: primaryRecommendation.title,
          action: primaryRecommendation.description,
          rationale: `Matches the ${persona.personaName} teaching approach.`,
          priority: primaryRecommendation.priority,
        }
      : null,
    {
      id: "tutor-recommendation-pacing",
      title: "Keep the session paced",
      action: "Use one explanation, one worked example, and one short check before moving on.",
      rationale: "The persona engine detected that attention pacing and guided repair are important.",
      priority: "medium",
    },
  ].filter((recommendation): recommendation is TutorRecommendation => Boolean(recommendation));
}

export function buildPersonalTutorContext(
  profile: StudentProfile,
  persona: StudentPersona,
  summary: StudentSummary | null,
  weaknesses: StudentWeakness[],
  recommendations: PersonalizedRecommendation[],
): PersonalTutorContext {
  const tutorRecommendations = generateTutorRecommendations(weaknesses, recommendations, persona);
  const keyWeaknesses = weaknesses.slice(0, 3).map((weakness) => weakness.conceptName);
  const keyStrengths = profile.strengths.slice(0, 3).map((strength) => strength.conceptName);
  const nextRecommendedAction = tutorRecommendations[0]?.action ?? summary?.nextBestAction ?? "Continue collecting learning signals.";

  return {
    id: "personal-tutor-context-1",
    studentId: profile.studentId,
    generatedAt: new Date().toISOString(),
    studentSummary: summarizeStudentForTutor(profile, persona, summary),
    keyWeaknesses,
    keyStrengths,
    preferredLearningStyle: persona.learningStyle,
    nextRecommendedAction,
    tutorInstructions: `Teach ${profile.displayName} with concise ${persona.learningStyle} support, connect new work to strengths, and check understanding before increasing difficulty.`,
    sections: [
      {
        id: "tutor-context-strengths",
        title: "Strength anchors",
        summary: keyStrengths.length > 0 ? `Use ${keyStrengths.join(", ")} as anchors.` : "No stable strength anchors yet.",
        priority: "medium",
      },
      {
        id: "tutor-context-weaknesses",
        title: "Repair targets",
        summary: keyWeaknesses.length > 0 ? `Prioritize ${keyWeaknesses.join(", ")}.` : "No active repair targets.",
        priority: keyWeaknesses.length > 0 ? "high" : "low",
      },
    ],
    recommendations: tutorRecommendations,
  };
}

export const personalTutorContextService = {
  buildPersonalTutorContext,
  summarizeStudentForTutor,
  generateTutorRecommendations,
};
