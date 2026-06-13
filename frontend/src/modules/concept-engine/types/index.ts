export type Concept = {
  id: string;
  name: string;
  subject: string;
  chapter: string;
  lesson: string;
  description?: string;
};

export type ConceptRelation = {
  parentConceptId: string;
  childConceptId: string;
  relationType: "prerequisite" | "related" | "depends_on" | "strengthens" | "supports" | "extends";
};

export type StudentConceptState = {
  conceptId: string;
  masteryLevel: number;
  confidenceLevel: "low" | "medium" | "high";
  weaknessScore: number;
  attempts: number;
  correctAnswers: number;
  wrongAnswers: number;
};

export type ConceptMastery = {
  conceptId: string;
  conceptName: string;
  masteryLevel: number;
  confidenceLevel: "low" | "medium" | "high";
  lastPracticedAt?: string;
};

export type ConceptDependency = {
  id: string;
  conceptId: string;
  conceptName: string;
  dependsOnConceptId: string;
  dependsOnConceptName: string;
  relationType: ConceptRelation["relationType"];
  strength: "weak" | "medium" | "strong";
};

export type ConceptWeakness = {
  id: string;
  conceptId: string;
  conceptName: string;
  subject?: string;
  chapter?: string;
  attempts: number;
  correctAnswers: number;
  wrongAnswers: number;
  masteryLevel: number;
  confidenceLevel: "low" | "medium" | "high";
  weaknessScore: number;
  priority: "low" | "medium" | "high";
  reason: string;
  recommendedAction: string;
  recommendation?: string;
};

export type ConceptGraphNode = {
  conceptId: string;
  conceptName: string;
  parentConcepts: string[];
  childConcepts: string[];
  dependencyCount: number;
  prerequisites: string[];
  dependsOn: string[];
  strengthens: string[];
  relatedConcepts: string[];
};

export type AffectedConcept = {
  conceptId: string;
  conceptName: string;
  sourceWeakConceptId: string;
  sourceWeakConceptName: string;
  impactScore: number;
  dependencyDepth: number;
  reason: string;
};
