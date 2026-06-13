import type { ConceptGraphNode, ConceptWeakness, StudentConceptState } from "../types";
import { conceptMasteryService } from "./conceptMasteryService";

type Priority = ConceptWeakness["priority"];

function increasePriority(priority: Priority): Priority {
  if (priority === "low") {
    return "medium";
  }

  if (priority === "medium") {
    return "high";
  }

  return "high";
}

export function calculatePriority(masteryLevel: number, dependentConceptCount = 0): Priority {
  let priority: Priority = "low";

  if (masteryLevel < 40) {
    priority = "high";
  } else if (masteryLevel <= 75) {
    priority = "medium";
  }

  if (dependentConceptCount >= 2) {
    return increasePriority(priority);
  }

  return priority;
}

function buildReason(priority: Priority, dependentConceptCount: number) {
  if (dependentConceptCount >= 2) {
    return "Many dependent concepts require it.";
  }

  if (priority === "high") {
    return "Mastery is below the safe learning threshold.";
  }

  if (priority === "medium") {
    return "Mastery is developing but still needs reinforcement.";
  }

  return "Mastery is currently acceptable, but continued practice will preserve it.";
}

function buildRecommendedAction(priority: Priority) {
  if (priority === "high") {
    return "Review lesson and solve 10 questions.";
  }

  if (priority === "medium") {
    return "Review notes and solve 5 targeted questions.";
  }

  return "Do a quick recap and keep practicing mixed questions.";
}

export function detectWeakConcepts(studentConceptStates: StudentConceptState[], conceptGraph: ConceptGraphNode[]): ConceptWeakness[] {
  return studentConceptStates.map((state) => {
    const graphNode = conceptGraph.find((node) => node.conceptId === state.conceptId);
    const calculated = conceptMasteryService.calculateMastery(state);
    const dependentConceptCount = graphNode?.childConcepts.length ?? 0;
    const priority = calculatePriority(calculated.masteryLevel, dependentConceptCount);
    const recommendedAction = buildRecommendedAction(priority);

    return {
      id: `weak-${state.conceptId}`,
      conceptId: state.conceptId,
      conceptName: graphNode?.conceptName ?? state.conceptId,
      attempts: state.attempts,
      correctAnswers: state.correctAnswers,
      wrongAnswers: state.wrongAnswers,
      masteryLevel: calculated.masteryLevel,
      confidenceLevel: calculated.confidenceLevel,
      weaknessScore: calculated.weaknessScore,
      priority,
      reason: buildReason(priority, dependentConceptCount),
      recommendedAction,
      recommendation: recommendedAction,
    };
  });
}

export function rankWeakConcepts(weakConcepts: ConceptWeakness[]) {
  const priorityWeight: Record<Priority, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...weakConcepts].sort((first, second) => {
    const priorityDifference = priorityWeight[second.priority] - priorityWeight[first.priority];

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return second.weaknessScore - first.weaknessScore;
  });
}

export const weakConceptService = {
  detectWeakConcepts,
  rankWeakConcepts,
  calculatePriority,
};
