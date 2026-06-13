import type { Concept, ConceptDependency, ConceptGraphNode, StudentConceptState } from "../types";
import { adaptiveRevisionService } from "./adaptiveRevisionService";
import { conceptMasteryService } from "./conceptMasteryService";
import { conceptReasoningService } from "./conceptReasoningService";
import { dependencyImpactService } from "./dependencyImpactService";
import { explainableAIService } from "./explainableAIService";
import { learningPathService } from "./learningPathService";
import { weakConceptService } from "./weakConceptService";

const concepts: Concept[] = [
  {
    id: "electrochemistry",
    name: "Electrochemistry",
    subject: "Chemistry",
    chapter: "Redox Reactions",
    lesson: "Introduction to Electrochemistry",
    description: "How chemical reactions can produce or consume electrical energy.",
  },
  {
    id: "oxidation-number",
    name: "Oxidation Number",
    subject: "Chemistry",
    chapter: "Redox Reactions",
    lesson: "Oxidation Number Rules",
    description: "A bookkeeping value used to track electron transfer in compounds and ions.",
  },
  {
    id: "galvanic-cell",
    name: "Galvanic Cell",
    subject: "Chemistry",
    chapter: "Electrochemistry",
    lesson: "Galvanic Cells",
    description: "A cell that converts spontaneous chemical energy into electrical energy.",
  },
  {
    id: "electrolysis",
    name: "Electrolysis",
    subject: "Chemistry",
    chapter: "Electrochemistry",
    lesson: "Electrolytic Cells",
    description: "Using electrical energy to drive a non-spontaneous chemical reaction.",
  },
];

const dependencies: ConceptDependency[] = [
  {
    id: "dependency-1",
    conceptId: "galvanic-cell",
    conceptName: "Galvanic Cell",
    dependsOnConceptId: "oxidation-number",
    dependsOnConceptName: "Oxidation Number",
    relationType: "prerequisite",
    strength: "strong",
  },
  {
    id: "dependency-2",
    conceptId: "electrolysis",
    conceptName: "Electrolysis",
    dependsOnConceptId: "electrochemistry",
    dependsOnConceptName: "Electrochemistry",
    relationType: "extends",
    strength: "medium",
  },
  {
    id: "dependency-3",
    conceptId: "electrochemistry",
    conceptName: "Electrochemistry",
    dependsOnConceptId: "oxidation-number",
    dependsOnConceptName: "Oxidation Number",
    relationType: "supports",
    strength: "strong",
  },
];

function buildStudentConceptState(input: Omit<StudentConceptState, "masteryLevel" | "confidenceLevel" | "weaknessScore">): StudentConceptState {
  return {
    ...input,
    ...conceptMasteryService.calculateMastery(input),
  };
}

const studentConceptStates: StudentConceptState[] = [
  buildStudentConceptState({
    conceptId: "electrochemistry",
    attempts: 18,
    correctAnswers: 12,
    wrongAnswers: 6,
  }),
  buildStudentConceptState({
    conceptId: "oxidation-number",
    attempts: 20,
    correctAnswers: 7,
    wrongAnswers: 13,
  }),
  buildStudentConceptState({
    conceptId: "galvanic-cell",
    attempts: 20,
    correctAnswers: 15,
    wrongAnswers: 5,
  }),
];

const conceptGraph: ConceptGraphNode[] = [
  {
    conceptId: "redox-reactions",
    conceptName: "Redox Reactions",
    parentConcepts: [],
    childConcepts: ["Electrochemistry", "Oxidation Number"],
    dependencyCount: 2,
    prerequisites: [],
    dependsOn: [],
    strengthens: ["Electrochemistry"],
    relatedConcepts: ["Oxidation", "Reduction"],
  },
  {
    conceptId: "electrochemistry",
    conceptName: "Electrochemistry",
    parentConcepts: ["Redox Reactions"],
    childConcepts: ["Galvanic Cell", "Electrolysis"],
    dependencyCount: 3,
    prerequisites: ["Oxidation Number"],
    dependsOn: ["Redox Reactions"],
    strengthens: ["Galvanic Cell"],
    relatedConcepts: ["Electrolysis"],
  },
  {
    conceptId: "oxidation-number",
    conceptName: "Oxidation Number",
    parentConcepts: ["Redox Reactions"],
    childConcepts: ["Electrochemistry", "Galvanic Cell"],
    dependencyCount: 2,
    prerequisites: [],
    dependsOn: ["Atomic Charge"],
    strengthens: ["Electrochemistry", "Balancing Redox Equations"],
    relatedConcepts: ["Reduction", "Oxidation"],
  },
  {
    conceptId: "galvanic-cell",
    conceptName: "Galvanic Cell",
    parentConcepts: ["Electrochemistry"],
    childConcepts: ["Cell Potential"],
    dependencyCount: 2,
    prerequisites: ["Oxidation Number", "Electrochemistry"],
    dependsOn: ["Electron Flow"],
    strengthens: ["Cell Potential"],
    relatedConcepts: ["Salt Bridge", "Anode and Cathode"],
  },
];

function simulateApi<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), 300);
  });
}

export const conceptEngineService = {
  getConcepts() {
    return simulateApi(concepts);
  },

  getConceptDependencies() {
    return simulateApi(dependencies);
  },

  getStudentConceptStates() {
    return simulateApi(studentConceptStates);
  },

  getWeakConcepts() {
    const weakConcepts = weakConceptService.rankWeakConcepts(
      weakConceptService.detectWeakConcepts(studentConceptStates, conceptGraph),
    );

    return simulateApi(weakConcepts);
  },

  getConceptGraph() {
    return simulateApi(conceptGraph);
  },

  getAffectedConcepts() {
    const weakConcepts = weakConceptService.rankWeakConcepts(
      weakConceptService.detectWeakConcepts(studentConceptStates, conceptGraph),
    );

    return simulateApi(dependencyImpactService.calculateDependencyImpact(weakConcepts, conceptGraph));
  },

  getRevisionPlan() {
    const weakConcepts = weakConceptService.rankWeakConcepts(
      weakConceptService.detectWeakConcepts(studentConceptStates, conceptGraph),
    );
    const affectedConcepts = dependencyImpactService.calculateDependencyImpact(weakConcepts, conceptGraph);
    const revisionPlan = adaptiveRevisionService.prioritizeRevisionSteps(
      adaptiveRevisionService.generateRevisionPlan(weakConcepts, affectedConcepts, studentConceptStates),
    );

    return simulateApi(revisionPlan);
  },

  getLearningPath() {
    const weakConcepts = weakConceptService.rankWeakConcepts(
      weakConceptService.detectWeakConcepts(studentConceptStates, conceptGraph),
    );
    const affectedConcepts = dependencyImpactService.calculateDependencyImpact(weakConcepts, conceptGraph);
    const revisionPlan = adaptiveRevisionService.prioritizeRevisionSteps(
      adaptiveRevisionService.generateRevisionPlan(weakConcepts, affectedConcepts, studentConceptStates),
    );

    return simulateApi(
      learningPathService.generateLearningPath(
        studentConceptStates,
        weakConcepts,
        affectedConcepts,
        revisionPlan,
        conceptGraph,
      ),
    );
  },

  getConceptReasons() {
    const weakConcepts = weakConceptService.rankWeakConcepts(
      weakConceptService.detectWeakConcepts(studentConceptStates, conceptGraph),
    );
    const affectedConcepts = dependencyImpactService.calculateDependencyImpact(weakConcepts, conceptGraph);
    const revisionPlan = adaptiveRevisionService.prioritizeRevisionSteps(
      adaptiveRevisionService.generateRevisionPlan(weakConcepts, affectedConcepts, studentConceptStates),
    );
    const learningPath = learningPathService.generateLearningPath(
      studentConceptStates,
      weakConcepts,
      affectedConcepts,
      revisionPlan,
      conceptGraph,
    );

    return simulateApi(
      conceptReasoningService.generateReasoning(
        weakConcepts,
        affectedConcepts,
        revisionPlan,
        learningPath,
        conceptGraph,
      ),
    );
  },

  getExplainableInsights() {
    const weakConcepts = weakConceptService.rankWeakConcepts(
      weakConceptService.detectWeakConcepts(studentConceptStates, conceptGraph),
    );
    const affectedConcepts = dependencyImpactService.calculateDependencyImpact(weakConcepts, conceptGraph);
    const revisionPlan = adaptiveRevisionService.prioritizeRevisionSteps(
      adaptiveRevisionService.generateRevisionPlan(weakConcepts, affectedConcepts, studentConceptStates),
    );
    const learningPath = learningPathService.generateLearningPath(
      studentConceptStates,
      weakConcepts,
      affectedConcepts,
      revisionPlan,
      conceptGraph,
    );
    const conceptReasons = conceptReasoningService.generateReasoning(
      weakConcepts,
      affectedConcepts,
      revisionPlan,
      learningPath,
      conceptGraph,
    );

    return simulateApi(
      explainableAIService.generateExplanation(
        conceptReasons,
        learningPath,
        revisionPlan,
        weakConcepts,
      ),
    );
  },
};
