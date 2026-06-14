import type {
  AttentionProfile,
  LearningPreference,
  MemoryEvent,
  StudentMemorySnapshot,
  StudentProfile,
  StudentStrength,
  StudentWeakness,
  StudyPattern,
} from "../types";
import { forgettingCurveService } from "./forgettingCurveService";
import { learningPatternService } from "./learningPatternService";
import { longTermMemoryEngineService } from "./longTermMemoryEngineService";
import { memoryTimelineService } from "./memoryTimelineService";
import { recommendationService } from "./recommendationService";
import { strengthDetectionService } from "./strengthDetectionService";
import { studentSummaryService } from "./studentSummaryService";
import { weaknessDetectionService } from "./weaknessDetectionService";

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

const studyPatterns: StudyPattern[] = [
  {
    id: "study-pattern-1",
    averageSessionMinutes: 28,
    preferredStudyTime: "evening",
    weeklyStudyDays: 5,
    consistencyLevel: "medium",
  },
];

const attentionProfile: AttentionProfile = {
  attentionSpan: 22,
  bestSessionLength: 28,
  breakFrequencyMinutes: 25,
  needsMotivation: true,
};

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

async function buildLocalStudentMemorySnapshot(): Promise<StudentMemorySnapshot> {
  const timeline = await memoryTimelineService.getTimeline();
  const detectedWeaknesses = weaknessDetectionService.detectWeaknesses(weaknesses, timeline);
  const detectedStrengths = strengthDetectionService.detectStrengths(strengths, timeline);
  const learningPatternInsights = learningPatternService.analyzeLearningPatterns(studyPatterns, attentionProfile, timeline);
  const forgettingCurve = forgettingCurveService.calculateForgettingRisk(strengths, weaknesses, timeline);
  const personalizedRecommendations = recommendationService.generateRecommendations(
    detectedWeaknesses,
    forgettingCurve,
    learningPatternInsights,
  );
  const studentSummary = studentSummaryService.generateStudentSummary(
    studentProfile,
    detectedStrengths,
    detectedWeaknesses,
    personalizedRecommendations,
  );
  const longTermMemoryInsights = longTermMemoryEngineService.aggregateLongTermMemoryInsights(
    studentProfile,
    timeline,
    detectedStrengths,
    detectedWeaknesses,
    learningPatternInsights,
    forgettingCurve,
    personalizedRecommendations,
  );

  return {
    studentProfile,
    strengths,
    weaknesses,
    learningPreferences,
    studyPatterns,
    attentionProfile,
    memoryTimeline: timeline,
    detectedWeaknesses,
    detectedStrengths,
    learningPatternInsights,
    forgettingCurve,
    personalizedRecommendations,
    studentSummary,
    longTermMemoryInsights,
  };
}

function getStudentMemory() {
  return buildLocalStudentMemorySnapshot();
}

export const studentMemoryService = {
  getStudentMemory,

  getStudentProfile() {
    return getStudentMemory().then((memory) => memory.studentProfile);
  },

  getStrengths() {
    return getStudentMemory().then((memory) => memory.strengths);
  },

  getWeaknesses() {
    return getStudentMemory().then((memory) => memory.weaknesses);
  },

  getLearningPreferences() {
    return getStudentMemory().then((memory) => memory.learningPreferences);
  },

  getStudyPatterns() {
    return getStudentMemory().then((memory) => memory.studyPatterns);
  },

  getAttentionProfile() {
    return getStudentMemory().then((memory) => memory.attentionProfile);
  },

  getTimeline() {
    return getStudentMemory().then((memory) => memory.memoryTimeline);
  },

  addMemoryEvent(memoryEvent: MemoryEvent) {
    return memoryTimelineService.addMemoryEvent(memoryEvent);
  },

  getDetectedWeaknesses() {
    return getStudentMemory().then((memory) => memory.detectedWeaknesses);
  },

  getDetectedStrengths() {
    return getStudentMemory().then((memory) => memory.detectedStrengths);
  },

  getLearningPatternInsights() {
    return getStudentMemory().then((memory) => memory.learningPatternInsights);
  },

  getForgettingCurve() {
    return getStudentMemory().then((memory) => memory.forgettingCurve);
  },

  getPersonalizedRecommendations() {
    return getStudentMemory().then((memory) => memory.personalizedRecommendations);
  },

  getStudentSummary() {
    return getStudentMemory().then((memory) => memory.studentSummary);
  },

  getLongTermMemoryInsights() {
    return getStudentMemory().then((memory) => memory.longTermMemoryInsights);
  },
};
