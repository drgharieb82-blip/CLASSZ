export * from "./components";
export { useConceptEngine } from "./hooks";
export {
  calculateConfidence,
  calculateDependencyImpact,
  calculateImpactScore,
  calculateMastery,
  calculatePriority,
  calculateWeaknessScore,
  adaptiveRevisionService,
  conceptEngineService,
  conceptMasteryService,
  dependencyImpactService,
  detectWeakConcepts,
  estimateRevisionTime,
  getAffectedConcepts,
  generateRevisionPlan,
  prioritizeRevisionSteps,
  rankWeakConcepts,
  weakConceptService,
} from "./services";
export type {
  AffectedConcept,
  Concept,
  ConceptDependency,
  ConceptGraphNode,
  ConceptMastery,
  ConceptRelation,
  ConceptWeakness,
  RevisionStep,
  StudentConceptState,
} from "./types";
