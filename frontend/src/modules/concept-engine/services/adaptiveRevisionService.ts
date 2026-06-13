import type { AffectedConcept, ConceptWeakness, RevisionStep, StudentConceptState } from "../types";

type RevisionPriority = RevisionStep["priority"];

const priorityWeight: Record<RevisionPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function getPriority(weakness: ConceptWeakness, affectedConcepts: AffectedConcept[]): RevisionPriority {
  const highestImpact = Math.max(0, ...affectedConcepts.map((concept) => concept.impactScore));

  if (weakness.priority === "high" && highestImpact >= 75) {
    return "critical";
  }

  if (weakness.priority === "high") {
    return "high";
  }

  if (weakness.priority === "medium" || highestImpact >= 75) {
    return "medium";
  }

  return "low";
}

function getDifficulty(state: StudentConceptState | undefined): RevisionStep["difficulty"] {
  if (!state || state.masteryLevel < 40) {
    return "hard";
  }

  if (state.masteryLevel <= 75) {
    return "medium";
  }

  return "easy";
}

function getActionType(priority: RevisionPriority): RevisionStep["actionType"] {
  if (priority === "critical") {
    return "solve_questions";
  }

  if (priority === "high") {
    return "review_lesson";
  }

  if (priority === "medium") {
    return "watch_video";
  }

  return "read_notes";
}

function getRecommendedAction(priority: RevisionPriority) {
  if (priority === "critical") {
    return "Solve 10 questions after reviewing lesson.";
  }

  if (priority === "high") {
    return "Review the lesson, then solve 6 targeted questions.";
  }

  if (priority === "medium") {
    return "Watch the concept video and answer 4 quick checks.";
  }

  return "Read notes and complete a quick recap.";
}

export function estimateRevisionTime(priority: RevisionPriority) {
  if (priority === "critical") {
    return "20 min";
  }

  if (priority === "high") {
    return "15 min";
  }

  if (priority === "medium") {
    return "10 min";
  }

  return "5 min";
}

function buildReason(weakness: ConceptWeakness, affectedConcepts: AffectedConcept[]) {
  if (affectedConcepts.length === 0) {
    return weakness.reason;
  }

  const impactedNames = affectedConcepts
    .slice(0, 2)
    .map((concept) => concept.conceptName)
    .join(" and ");

  return `Required for ${impactedNames}.`;
}

export function generateRevisionPlan(
  weakConcepts: ConceptWeakness[],
  affectedConcepts: AffectedConcept[],
  studentConceptStates: StudentConceptState[],
): RevisionStep[] {
  return weakConcepts.map((weakness) => {
    const relatedImpacts = affectedConcepts.filter((concept) => concept.sourceWeakConceptId === weakness.conceptId);
    const state = studentConceptStates.find((conceptState) => conceptState.conceptId === weakness.conceptId);
    const priority = getPriority(weakness, relatedImpacts);

    return {
      id: `revision-${weakness.conceptId}`,
      conceptId: weakness.conceptId,
      conceptName: weakness.conceptName,
      priority,
      estimatedTime: estimateRevisionTime(priority),
      reason: buildReason(weakness, relatedImpacts),
      recommendedAction: getRecommendedAction(priority),
      difficulty: getDifficulty(state),
      actionType: getActionType(priority),
    };
  });
}

export function prioritizeRevisionSteps(revisionSteps: RevisionStep[]) {
  return [...revisionSteps].sort((first, second) => priorityWeight[second.priority] - priorityWeight[first.priority]);
}

export const adaptiveRevisionService = {
  generateRevisionPlan,
  prioritizeRevisionSteps,
  estimateRevisionTime,
};
