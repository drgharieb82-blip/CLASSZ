import type { Concept, ConceptDependency, ConceptWeakness, StudentConceptState } from "../types";

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

const studentConceptStates: StudentConceptState[] = [
  {
    conceptId: "electrochemistry",
    masteryLevel: 64,
    confidenceLevel: "medium",
    attempts: 18,
    correctAnswers: 12,
    wrongAnswers: 6,
  },
  {
    conceptId: "oxidation-number",
    masteryLevel: 35,
    confidenceLevel: "low",
    attempts: 20,
    correctAnswers: 7,
    wrongAnswers: 13,
  },
  {
    conceptId: "galvanic-cell",
    masteryLevel: 72,
    confidenceLevel: "high",
    attempts: 14,
    correctAnswers: 10,
    wrongAnswers: 4,
  },
];

const weakConcepts: ConceptWeakness[] = [
  {
    id: "weak-concept-1",
    conceptId: "oxidation-number",
    conceptName: "Oxidation Number",
    subject: "Chemistry",
    chapter: "Redox Reactions",
    masteryLevel: 35,
    confidenceLevel: "low",
    priority: "high",
    recommendation: "Review oxidation number rules and solve 10 focused practice questions.",
  },
  {
    id: "weak-concept-2",
    conceptId: "electrochemistry",
    conceptName: "Electrochemistry",
    subject: "Chemistry",
    chapter: "Electrochemistry",
    masteryLevel: 64,
    confidenceLevel: "medium",
    priority: "medium",
    recommendation: "Review electron flow examples before attempting galvanic cell questions.",
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
    return simulateApi(weakConcepts);
  },
};
