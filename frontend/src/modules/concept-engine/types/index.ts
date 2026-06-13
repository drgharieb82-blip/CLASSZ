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

export type RevisionStep = {
  id: string;
  conceptId: string;
  conceptName: string;
  priority: "critical" | "high" | "medium" | "low";
  estimatedTime: string;
  reason: string;
  recommendedAction: string;
  difficulty: "easy" | "medium" | "hard";
  actionType: "review_lesson" | "watch_video" | "read_notes" | "solve_questions" | "retake_quiz";
};

export type LearningPathStep = {
  id: string;
  order: number;
  conceptId: string;
  conceptName: string;
  stepType: "learn" | "review" | "watch_video" | "read_notes" | "solve_questions" | "retake_quiz" | "mastery_check";
  priority: "critical" | "high" | "medium" | "low";
  estimatedTime: string;
  reason: string;
  recommendedAction: string;
};

export type ConceptReason = {
  id: string;
  conceptId: string;
  conceptName: string;
  reason: string;
  chain: string[];
  recommendedAction: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type ExplainableInsight = {
  id: string;
  targetAudience: "student" | "teacher" | "parent";
  title: string;
  summary: string;
  details: string;
  recommendedAction: string;
  priority: "critical" | "high" | "medium" | "low";
};
