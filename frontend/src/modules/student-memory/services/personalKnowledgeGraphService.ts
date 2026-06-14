import type {
  DetectedStrength,
  DetectedWeakness,
  PersonalKnowledgeEdge,
  PersonalKnowledgeGraph,
  PersonalKnowledgeNode,
  StudentProfile,
  StudentStrength,
  StudentWeakness,
} from "../types";

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getConnectedConcepts(conceptId: string, edges: PersonalKnowledgeEdge[]): string[] {
  return edges
    .filter((edge) => edge.sourceConceptId === conceptId || edge.targetConceptId === conceptId)
    .map((edge) => (edge.sourceConceptId === conceptId ? edge.targetConceptId : edge.sourceConceptId));
}

export function calculateNodeImportance(node: Pick<PersonalKnowledgeNode, "mastery" | "confidence" | "weaknessScore">, connectedConceptsCount: number): number {
  const supportNeed = node.weaknessScore * 0.38;
  const reliability = node.confidence * 0.22;
  const masterySignal = node.mastery * 0.2;
  const connectedness = Math.min(connectedConceptsCount * 8, 20);

  return clampScore(supportNeed + reliability + masterySignal + connectedness);
}

function buildEdges(strengths: StudentStrength[], weaknesses: StudentWeakness[]): PersonalKnowledgeEdge[] {
  const primaryStrength = strengths[0];
  const primaryWeakness = weaknesses[0];
  const secondaryWeakness = weaknesses[1];

  return [
    primaryStrength && primaryWeakness
      ? {
          id: "pkg-edge-anchor-weakness",
          sourceConceptId: primaryStrength.conceptId,
          targetConceptId: primaryWeakness.conceptId,
          relationType: "supports",
          strength: 76,
          summary: `${primaryStrength.conceptName} can anchor practice for ${primaryWeakness.conceptName}.`,
        }
      : null,
    primaryWeakness && secondaryWeakness
      ? {
          id: "pkg-edge-weakness-chain",
          sourceConceptId: primaryWeakness.conceptId,
          targetConceptId: secondaryWeakness.conceptId,
          relationType: "dependsOn",
          strength: 82,
          summary: `${secondaryWeakness.conceptName} depends on repairing ${primaryWeakness.conceptName}.`,
        }
      : null,
    strengths[1] && primaryStrength
      ? {
          id: "pkg-edge-strength-reinforce",
          sourceConceptId: strengths[1].conceptId,
          targetConceptId: primaryStrength.conceptId,
          relationType: "reinforces",
          strength: 64,
          summary: `${strengths[1].conceptName} reinforces reasoning used in ${primaryStrength.conceptName}.`,
        }
      : null,
  ].filter((edge): edge is PersonalKnowledgeEdge => Boolean(edge));
}

export function generatePersonalKnowledgeGraph(
  profile: StudentProfile,
  strengths: StudentStrength[],
  weaknesses: StudentWeakness[],
  detectedStrengths: DetectedStrength[],
  detectedWeaknesses: DetectedWeakness[],
): PersonalKnowledgeGraph {
  const edges = buildEdges(strengths, weaknesses);
  const strengthNodes = strengths.map((strength) => {
    const detectedStrength = detectedStrengths.find((item) => item.conceptId === strength.conceptId);
    const connectedConceptsCount = getConnectedConcepts(strength.conceptId, edges).length;
    const weaknessScore = clampScore(100 - strength.masteryLevel);
    const confidence = detectedStrength?.confidence ?? Math.max(70, strength.masteryLevel);
    const baseNode = {
      id: `pkg-node-${strength.conceptId}`,
      conceptId: strength.conceptId,
      conceptName: strength.conceptName,
      subject: strength.subject,
      mastery: strength.masteryLevel,
      confidence,
      weaknessScore,
      connectedConceptsCount,
      relationSummary: edges.find((edge) => edge.sourceConceptId === strength.conceptId || edge.targetConceptId === strength.conceptId)?.summary ?? "No strong local relation yet.",
    };

    return {
      ...baseNode,
      importance: calculateNodeImportance(baseNode, connectedConceptsCount),
    };
  });

  const weaknessNodes = weaknesses.map((weakness) => {
    const detectedWeakness = detectedWeaknesses.find((item) => item.conceptId === weakness.conceptId);
    const connectedConceptsCount = getConnectedConcepts(weakness.conceptId, edges).length;
    const weaknessScore = clampScore(100 - weakness.masteryLevel);
    const confidence = detectedWeakness?.confidence ?? (weakness.priority === "high" ? 84 : 72);
    const baseNode = {
      id: `pkg-node-${weakness.conceptId}`,
      conceptId: weakness.conceptId,
      conceptName: weakness.conceptName,
      subject: weakness.subject,
      mastery: weakness.masteryLevel,
      confidence,
      weaknessScore,
      connectedConceptsCount,
      relationSummary: edges.find((edge) => edge.sourceConceptId === weakness.conceptId || edge.targetConceptId === weakness.conceptId)?.summary ?? weakness.recommendedAction,
    };

    return {
      ...baseNode,
      importance: calculateNodeImportance(baseNode, connectedConceptsCount),
    };
  });

  return {
    id: "personal-knowledge-graph-1",
    studentId: profile.studentId,
    generatedAt: new Date().toISOString(),
    nodes: [...strengthNodes, ...weaknessNodes].sort((firstNode, secondNode) => secondNode.importance - firstNode.importance),
    edges,
  };
}

export const personalKnowledgeGraphService = {
  generatePersonalKnowledgeGraph,
  getConnectedConcepts,
  calculateNodeImportance,
};
