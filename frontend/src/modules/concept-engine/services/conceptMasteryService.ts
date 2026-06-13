import type { StudentConceptState } from "../types";

type MasteryInput = {
  attempts: number;
  correctAnswers: number;
  wrongAnswers: number;
};

type MasteryOutput = {
  masteryLevel: number;
  confidenceLevel: StudentConceptState["confidenceLevel"];
  weaknessScore: number;
};

function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function calculateMastery({ attempts, correctAnswers, wrongAnswers }: MasteryInput) {
  const totalAttempts = attempts || correctAnswers + wrongAnswers;

  if (totalAttempts <= 0) {
    return 0;
  }

  return clampPercentage((correctAnswers / totalAttempts) * 100);
}

export function calculateConfidence(masteryLevel: number): StudentConceptState["confidenceLevel"] {
  if (masteryLevel <= 40) {
    return "low";
  }

  if (masteryLevel <= 75) {
    return "medium";
  }

  return "high";
}

export function calculateWeaknessScore(input: MasteryInput) {
  return clampPercentage(100 - calculateMastery(input));
}

export const conceptMasteryService = {
  calculateMastery(input: MasteryInput): MasteryOutput {
    const masteryLevel = calculateMastery(input);

    return {
      masteryLevel,
      confidenceLevel: calculateConfidence(masteryLevel),
      weaknessScore: calculateWeaknessScore(input),
    };
  },

  calculateConfidence,
  calculateWeaknessScore,
};
