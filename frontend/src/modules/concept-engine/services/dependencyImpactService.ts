import type { AffectedConcept, ConceptGraphNode, ConceptWeakness } from "../types";

export function calculateImpactScore(dependencyDepth: number) {
  if (dependencyDepth === 1) {
    return 100;
  }

  if (dependencyDepth === 2) {
    return 75;
  }

  if (dependencyDepth === 3) {
    return 50;
  }

  return 0;
}

function getNextConceptNames(node: ConceptGraphNode) {
  return [...node.parentConcepts, ...node.childConcepts, ...node.strengthens];
}

function findNodeByName(conceptGraph: ConceptGraphNode[], conceptName: string) {
  return conceptGraph.find((node) => node.conceptName === conceptName);
}

export function getAffectedConcepts(weakConcept: ConceptWeakness, conceptGraph: ConceptGraphNode[]): AffectedConcept[] {
  const affectedConcepts: AffectedConcept[] = [];
  const visited = new Set<string>([weakConcept.conceptId]);
  const queue: Array<{ node: ConceptGraphNode; depth: number }> = [];
  const sourceNode = conceptGraph.find((node) => node.conceptId === weakConcept.conceptId);

  if (!sourceNode) {
    return affectedConcepts;
  }

  getNextConceptNames(sourceNode).forEach((conceptName) => {
    const node = findNodeByName(conceptGraph, conceptName);
    if (node) {
      queue.push({ node, depth: 1 });
    }
  });

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current.node.conceptId) || current.depth > 3) {
      continue;
    }

    visited.add(current.node.conceptId);

    affectedConcepts.push({
      conceptId: current.node.conceptId,
      conceptName: current.node.conceptName,
      sourceWeakConceptId: weakConcept.conceptId,
      sourceWeakConceptName: weakConcept.conceptName,
      impactScore: calculateImpactScore(current.depth),
      dependencyDepth: current.depth,
      reason: `${current.node.conceptName} depends on or is strengthened by ${weakConcept.conceptName}.`,
    });

    getNextConceptNames(current.node).forEach((conceptName) => {
      const node = findNodeByName(conceptGraph, conceptName);
      if (node && !visited.has(node.conceptId)) {
        queue.push({ node, depth: current.depth + 1 });
      }
    });
  }

  return affectedConcepts;
}

export function calculateDependencyImpact(weakConcepts: ConceptWeakness[], conceptGraph: ConceptGraphNode[]): AffectedConcept[] {
  const impactMap = new Map<string, AffectedConcept>();

  weakConcepts.forEach((weakConcept) => {
    getAffectedConcepts(weakConcept, conceptGraph).forEach((affectedConcept) => {
      const key = `${affectedConcept.sourceWeakConceptId}-${affectedConcept.conceptId}`;
      const current = impactMap.get(key);

      if (!current || affectedConcept.impactScore > current.impactScore) {
        impactMap.set(key, affectedConcept);
      }
    });
  });

  return [...impactMap.values()].sort((first, second) => second.impactScore - first.impactScore);
}

export const dependencyImpactService = {
  calculateDependencyImpact,
  getAffectedConcepts,
  calculateImpactScore,
};
