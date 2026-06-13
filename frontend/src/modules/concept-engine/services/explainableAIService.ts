import type { ConceptReason, ConceptWeakness, ExplainableInsight, LearningPathStep, RevisionStep } from "../types";

function getPrimaryReason(conceptReasons: ConceptReason[]) {
  return conceptReasons[0];
}

function getPrimaryRevision(revisionPlan: RevisionStep[], conceptId: string) {
  return revisionPlan.find((step) => step.conceptId === conceptId) ?? revisionPlan[0];
}

function getPrimaryPathStep(learningPath: LearningPathStep[], conceptId: string) {
  return learningPath.find((step) => step.conceptId === conceptId) ?? learningPath[0];
}

function getPrimaryWeakness(weakConcepts: ConceptWeakness[], conceptId: string) {
  return weakConcepts.find((weakness) => weakness.conceptId === conceptId) ?? weakConcepts[0];
}

export function generateStudentExplanation(
  conceptReasons: ConceptReason[],
  learningPath: LearningPathStep[],
  revisionPlan: RevisionStep[],
  weakConcepts: ConceptWeakness[],
): ExplainableInsight | null {
  const reason = getPrimaryReason(conceptReasons);
  if (!reason) {
    return null;
  }

  const revision = getPrimaryRevision(revisionPlan, reason.conceptId);
  const pathStep = getPrimaryPathStep(learningPath, reason.conceptId);

  return {
    id: `student-${reason.conceptId}`,
    targetAudience: "student",
    title: `Why review ${reason.conceptName}?`,
    summary: `You should review ${reason.conceptName} because many later concepts depend on it.`,
    details: reason.reason,
    recommendedAction: revision?.recommendedAction ?? pathStep?.recommendedAction ?? reason.recommendedAction,
    priority: reason.priority,
  };
}

export function generateTeacherExplanation(
  conceptReasons: ConceptReason[],
  learningPath: LearningPathStep[],
  revisionPlan: RevisionStep[],
  weakConcepts: ConceptWeakness[],
): ExplainableInsight | null {
  const reason = getPrimaryReason(conceptReasons);
  if (!reason) {
    return null;
  }

  const weakness = getPrimaryWeakness(weakConcepts, reason.conceptId);
  const impactedConcept = reason.chain[1] ?? "later concepts";

  return {
    id: `teacher-${reason.conceptId}`,
    targetAudience: "teacher",
    title: `${reason.conceptName} intervention`,
    summary: `Student weakness in ${reason.conceptName} affects ${impactedConcept}.`,
    details: `Mastery is ${weakness?.masteryLevel ?? 0}% with a ${weakness?.weaknessScore ?? 0}% weakness score.`,
    recommendedAction: reason.recommendedAction,
    priority: reason.priority,
  };
}

export function generateParentExplanation(
  conceptReasons: ConceptReason[],
  learningPath: LearningPathStep[],
  revisionPlan: RevisionStep[],
  weakConcepts: ConceptWeakness[],
): ExplainableInsight | null {
  const reason = getPrimaryReason(conceptReasons);
  if (!reason) {
    return null;
  }

  const pathStep = getPrimaryPathStep(learningPath, reason.conceptId);

  return {
    id: `parent-${reason.conceptId}`,
    targetAudience: "parent",
    title: `${reason.conceptName} support`,
    summary: `Your child should spend approximately ${pathStep?.estimatedTime ?? "20 min"} reviewing ${reason.conceptName}.`,
    details: "This recommendation is based on current mastery and how this concept affects upcoming learning.",
    recommendedAction: pathStep?.recommendedAction ?? reason.recommendedAction,
    priority: reason.priority,
  };
}

export function generateExplanation(
  conceptReasons: ConceptReason[],
  learningPath: LearningPathStep[],
  revisionPlan: RevisionStep[],
  weakConcepts: ConceptWeakness[],
): ExplainableInsight[] {
  return [
    generateStudentExplanation(conceptReasons, learningPath, revisionPlan, weakConcepts),
    generateTeacherExplanation(conceptReasons, learningPath, revisionPlan, weakConcepts),
    generateParentExplanation(conceptReasons, learningPath, revisionPlan, weakConcepts),
  ].filter((insight): insight is ExplainableInsight => Boolean(insight));
}

export const explainableAIService = {
  generateExplanation,
  generateStudentExplanation,
  generateTeacherExplanation,
  generateParentExplanation,
};
