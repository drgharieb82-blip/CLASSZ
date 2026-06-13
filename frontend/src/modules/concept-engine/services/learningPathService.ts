import type { AffectedConcept, ConceptGraphNode, ConceptWeakness, LearningPathStep, RevisionStep, StudentConceptState } from "../types";

type PathPriority = LearningPathStep["priority"];

const priorityWeight: Record<PathPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function mapRevisionActionToStepType(actionType: RevisionStep["actionType"]): LearningPathStep["stepType"] {
  const stepTypes: Record<RevisionStep["actionType"], LearningPathStep["stepType"]> = {
    review_lesson: "review",
    watch_video: "watch_video",
    read_notes: "read_notes",
    solve_questions: "solve_questions",
    retake_quiz: "retake_quiz",
  };

  return stepTypes[actionType];
}

function getPriorityFromMastery(state: StudentConceptState | undefined): PathPriority {
  if (!state || state.masteryLevel < 40) {
    return "critical";
  }

  if (state.masteryLevel <= 75) {
    return "medium";
  }

  return "low";
}

function getEstimatedMinutes(step: Pick<LearningPathStep, "estimatedTime">) {
  return Number.parseInt(step.estimatedTime, 10) || 0;
}

export function estimatePathDuration(steps: Array<Pick<LearningPathStep, "estimatedTime">>) {
  const minutes = steps.reduce((total, step) => total + getEstimatedMinutes(step), 0);
  return `${minutes} min`;
}

export function prioritizeLearningSequence(steps: LearningPathStep[]) {
  return [...steps]
    .sort((first, second) => {
      const priorityDifference = priorityWeight[second.priority] - priorityWeight[first.priority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return getEstimatedMinutes(second) - getEstimatedMinutes(first);
    })
    .map((step, index) => ({ ...step, order: index + 1 }));
}

export function generateLearningPath(
  studentConceptStates: StudentConceptState[],
  weakConcepts: ConceptWeakness[],
  affectedConcepts: AffectedConcept[],
  revisionPlan: RevisionStep[],
  conceptGraph: ConceptGraphNode[],
): LearningPathStep[] {
  const steps: LearningPathStep[] = revisionPlan.map((revisionStep) => ({
    id: `path-${revisionStep.id}`,
    order: 0,
    conceptId: revisionStep.conceptId,
    conceptName: revisionStep.conceptName,
    stepType: mapRevisionActionToStepType(revisionStep.actionType),
    priority: revisionStep.priority,
    estimatedTime: revisionStep.estimatedTime,
    reason: revisionStep.reason,
    recommendedAction: revisionStep.recommendedAction,
  }));

  weakConcepts.forEach((weakConcept) => {
    const graphNode = conceptGraph.find((node) => node.conceptId === weakConcept.conceptId);
    const state = studentConceptStates.find((conceptState) => conceptState.conceptId === weakConcept.conceptId);
    const firstPrerequisite = graphNode?.prerequisites[0] ?? graphNode?.parentConcepts[0];

    if (firstPrerequisite) {
      steps.push({
        id: `path-prereq-${weakConcept.conceptId}`,
        order: 0,
        conceptId: `${weakConcept.conceptId}-prerequisite`,
        conceptName: firstPrerequisite,
        stepType: "learn",
        priority: getPriorityFromMastery(state),
        estimatedTime: "10 min",
        reason: `Required before ${weakConcept.conceptName}.`,
        recommendedAction: "Learn the prerequisite concept before continuing the revision sequence.",
      });
    }
  });

  affectedConcepts.slice(0, 3).forEach((affectedConcept) => {
    steps.push({
      id: `path-check-${affectedConcept.sourceWeakConceptId}-${affectedConcept.conceptId}`,
      order: 0,
      conceptId: affectedConcept.conceptId,
      conceptName: affectedConcept.conceptName,
      stepType: "mastery_check",
      priority: affectedConcept.impactScore >= 75 ? "high" : "medium",
      estimatedTime: "5 min",
      reason: affectedConcept.reason,
      recommendedAction: "Complete a quick mastery check after revision.",
    });
  });

  return prioritizeLearningSequence(steps);
}

export const learningPathService = {
  generateLearningPath,
  prioritizeLearningSequence,
  estimatePathDuration,
};
