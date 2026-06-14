import type {
  AttentionProfile,
  LearningBehavior,
  LearningPattern,
  LearningPatternInsight,
  PersonaTrait,
  StudentPersona,
  StudentProfile,
  StudentStrength,
  StudentWeakness,
  StudyHabit,
} from "../types";

export function detectPersonaTraits(profile: StudentProfile, strengths: StudentStrength[], weaknesses: StudentWeakness[]): PersonaTrait[] {
  const strongestConcept = strengths[0];
  const highestRiskConcept = weaknesses.find((weakness) => weakness.priority === "high") ?? weaknesses[0];
  const traitCandidates: Array<PersonaTrait | null> = [
    strongestConcept
      ? {
          id: "persona-trait-concept-anchor",
          name: "Concept anchor",
          category: "strength",
          confidence: Math.max(76, strongestConcept.masteryLevel),
          summary: `${profile.displayName} can use ${strongestConcept.conceptName} as a confidence base.`,
        }
      : null,
    profile.averageSessionMinutes >= 25
      ? {
          id: "persona-trait-steady-session",
          name: "Steady session rhythm",
          category: "strength",
          confidence: 78,
          summary: `Average sessions around ${profile.averageSessionMinutes} minutes support focused practice.`,
        }
      : null,
    highestRiskConcept
      ? {
          id: "persona-trait-repair-risk",
          name: "Repair loop needed",
          category: "risk",
          confidence: highestRiskConcept.priority === "high" ? 88 : 74,
          summary: `${highestRiskConcept.conceptName} should be repaired before harder connected work.`,
        }
      : null,
    profile.attentionSpan < profile.averageSessionMinutes
      ? {
          id: "persona-trait-attention-drop",
          name: "Attention drop risk",
          category: "risk",
          confidence: 80,
          summary: `Attention span is shorter than the usual session length, so pacing matters.`,
        }
      : null,
  ];

  return traitCandidates.filter((trait): trait is PersonaTrait => Boolean(trait));
}

export function summarizeLearningBehavior(
  profile: StudentProfile,
  studyHabit: StudyHabit,
  attentionProfile: AttentionProfile | null,
  patterns: LearningPattern[],
  insights: LearningPatternInsight[],
): LearningBehavior[] {
  const consistencyPattern = patterns.find((pattern) => pattern.patternName.toLowerCase().includes("consistent")) ?? patterns[0];
  const sessionInsight = insights.find((insight) => insight.patternType === "sessionLength");

  return [
    {
      id: "learning-behavior-consistency",
      behaviorType: "consistency",
      title: "Study consistency",
      summary: consistencyPattern?.description ?? `${profile.displayName} studies most reliably in the ${studyHabit.preferredStudyTime}.`,
      confidence: Math.max(68, studyHabit.consistencyScore),
    },
    {
      id: "learning-behavior-attention",
      behaviorType: "attention",
      title: "Attention pacing",
      summary: attentionProfile
        ? `Best sessions are around ${attentionProfile.bestSessionLength} minutes with breaks every ${attentionProfile.breakFrequencyMinutes} minutes.`
        : `Sessions should stay close to ${profile.averageSessionMinutes} minutes.`,
      confidence: attentionProfile ? 82 : 70,
    },
    {
      id: "learning-behavior-review",
      behaviorType: "review",
      title: "Review response",
      summary: sessionInsight?.recommendation ?? "Short review loops before new difficulty should keep memory stable.",
      confidence: sessionInsight?.confidence ?? 74,
    },
  ];
}

export function generateStudentPersona(
  profile: StudentProfile,
  strengths: StudentStrength[],
  weaknesses: StudentWeakness[],
  studyHabit: StudyHabit,
  attentionProfile: AttentionProfile | null,
  patterns: LearningPattern[],
  insights: LearningPatternInsight[],
): StudentPersona {
  const traits = detectPersonaTraits(profile, strengths, weaknesses);
  const learningBehaviors = summarizeLearningBehavior(profile, studyHabit, attentionProfile, patterns, insights);
  const riskTraits = traits.filter((trait) => trait.category === "risk");
  const strengthTraits = traits.filter((trait) => trait.category === "strength");
  const personaName = riskTraits.length > 0 ? "Guided Concept Builder" : "Independent Momentum Learner";

  return {
    id: "student-persona-1",
    studentId: profile.studentId,
    personaName,
    learningStyle: profile.learningStyle,
    strengthTraits,
    riskTraits,
    learningBehaviors,
    behaviorSummary: learningBehaviors.map((behavior) => behavior.summary).join(" "),
    recommendedTeachingApproach:
      "Start with a known strength, repair one weak concept with guided practice, then finish with a short confidence check.",
  };
}

export const studentPersonaService = {
  generateStudentPersona,
  detectPersonaTraits,
  summarizeLearningBehavior,
};
