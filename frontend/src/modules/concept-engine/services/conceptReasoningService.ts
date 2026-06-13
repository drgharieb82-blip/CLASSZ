import type { AffectedConcept, ConceptGraphNode, ConceptReason, ConceptWeakness, LearningPathStep, RevisionStep } from "../types";

type ReasonPriority = ConceptReason["priority"];

const priorityWeight: Record<ReasonPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function mapWeaknessPriority(priority: ConceptWeakness["priority"]): ReasonPriority {
  if (priority === "high") {
    return "high";
  }

  if (priority === "medium") {
    return "medium";
  }

  return "low";
}

function findNodeByName(conceptGraph: ConceptGraphNode[], conceptName: string) {
  return conceptGraph.find((node) => node.conceptName === conceptName);
}

export function buildReasonChain(conceptId: string, conceptGraph: ConceptGraphNode[]) {
  const sourceNode = conceptGraph.find((node) => node.conceptId === conceptId);

  if (!sourceNode) {
    return [conceptId];
  }

  const chain = [sourceNode.conceptName];
  let currentNode = sourceNode;

  for (let depth = 0; depth < 3; depth += 1) {
    const nextName = currentNode.parentConcepts[0] ?? currentNode.childConcepts[0] ?? currentNode.strengthens[0];
    const nextNode = nextName ? findNodeByName(conceptGraph, nextName) : undefined;

    if (!nextNode || chain.includes(nextNode.conceptName)) {
      break;
    }

    chain.push(nextNode.conceptName);
    currentNode = nextNode;
  }

  return chain;
}

export function explainRecommendation(
  weakConcept: ConceptWeakness,
  affectedConcepts: AffectedConcept[],
  revisionPlan: RevisionStep[],
  learningPath: LearningPathStep[],
) {
  const relatedImpacts = affectedConcepts.filter((concept) => concept.sourceWeakConceptId === weakConcept.conceptId);
  const revisionStep = revisionPlan.find((step) => step.conceptId === weakConcept.conceptId);
  const pathStep = learningPath.find((step) => step.conceptId === weakConcept.conceptId);

  if (relatedImpacts.length > 0) {
    const impactedConcepts = relatedImpacts.slice(0, 3).map((concept) => concept.conceptName).join(", ");
    return `Weak mastery detected and it affects ${impactedConcepts}.`;
  }

  return revisionStep?.reason ?? pathStep?.reason ?? weakConcept.reason;
}

export function generateReasoning(
  weakConcepts: ConceptWeakness[],
  affectedConcepts: AffectedConcept[],
  revisionPlan: RevisionStep[],
  learningPath: LearningPathStep[],
  conceptGraph: ConceptGraphNode[],
): ConceptReason[] {
  return weakConcepts
    .map((weakConcept) => {
      const revisionStep = revisionPlan.find((step) => step.conceptId === weakConcept.conceptId);
      const pathStep = learningPath.find((step) => step.conceptId === weakConcept.conceptId);
      const priority = revisionStep?.priority ?? pathStep?.priority ?? mapWeaknessPriority(weakConcept.priority);

      return {
        id: `reason-${weakConcept.conceptId}`,
        conceptId: weakConcept.conceptId,
        conceptName: weakConcept.conceptName,
        reason: explainRecommendation(weakConcept, affectedConcepts, revisionPlan, learningPath),
        chain: buildReasonChain(weakConcept.conceptId, conceptGraph),
        recommendedAction: revisionStep?.recommendedAction ?? pathStep?.recommendedAction ?? weakConcept.recommendedAction,
        priority,
      };
    })
    .sort((first, second) => priorityWeight[second.priority] - priorityWeight[first.priority]);
}

export const conceptReasoningService = {
  generateReasoning,
  buildReasonChain,
  explainRecommendation,
};
