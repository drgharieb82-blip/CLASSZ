import type { LearningPreference, StudentProfile, StudentStrength, StudentWeakness } from "../types";

const strengths: StudentStrength[] = [
  {
    id: "strength-1",
    conceptId: "galvanic-cell",
    conceptName: "Galvanic Cell",
    subject: "Chemistry",
    masteryLevel: 82,
    evidence: "Consistently answers cell component questions correctly.",
  },
  {
    id: "strength-2",
    conceptId: "stoichiometry",
    conceptName: "Stoichiometry",
    subject: "Chemistry",
    masteryLevel: 78,
    evidence: "Shows strong accuracy in mole ratio and mass conversion practice.",
  },
];

const weaknesses: StudentWeakness[] = [
  {
    id: "weakness-1",
    conceptId: "oxidation-number",
    conceptName: "Oxidation Number",
    subject: "Chemistry",
    masteryLevel: 35,
    priority: "high",
    recommendedAction: "Review lesson 3 and solve 10 focused practice questions.",
  },
  {
    id: "weakness-2",
    conceptId: "electrolysis",
    conceptName: "Electrolysis",
    subject: "Chemistry",
    masteryLevel: 48,
    priority: "medium",
    recommendedAction: "Watch the electrolysis recap and retake the short quiz.",
  },
];

const learningPreferences: LearningPreference[] = [
  {
    id: "preference-1",
    learningStyle: "mixed",
    preferredLanguage: "ar",
    preferredDifficulty: "adaptive",
    bestContentType: "mixed",
  },
];

const studentProfile: StudentProfile = {
  studentId: "student-1",
  displayName: "Mariam Hassan",
  grade: "Secondary 3",
  preferredLanguage: "ar",
  learningStyle: "mixed",
  averageSessionMinutes: 28,
  preferredDifficulty: "adaptive",
  attentionSpan: 22,
  strengths,
  weaknesses,
};

function simulateApi<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), 300);
  });
}

export const studentMemoryService = {
  getStudentProfile() {
    return simulateApi(studentProfile);
  },

  getStrengths() {
    return simulateApi(strengths);
  },

  getWeaknesses() {
    return simulateApi(weaknesses);
  },

  getLearningPreferences() {
    return simulateApi(learningPreferences);
  },
};
