import type { AttentionProfile, LearningPreference, StudentProfile, StudentStrength, StudentWeakness, StudyPattern } from "../types";
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

  getStudyPatterns() {
    return simulateApi(studyPatterns);
  },

  getAttentionProfile() {
    return simulateApi(attentionProfile);
  },

  getTimeline() {
    return memoryTimelineService.getTimeline();
  },

  addMemoryEvent: memoryTimelineService.addMemoryEvent,

  async getDetectedWeaknesses() {
    const timeline = await memoryTimelineService.getTimeline();
    return weaknessDetectionService.detectWeaknesses(weaknesses, timeline);
  },

  async getDetectedStrengths() {
    const timeline = await memoryTimelineService.getTimeline();
    return strengthDetectionService.detectStrengths(strengths, timeline);
  },

  async getLearningPatternInsights() {
    const timeline = await memoryTimelineService.getTimeline();
    return learningPatternService.analyzeLearningPatterns(studyPatterns, attentionProfile, timeline);
  },

  async getForgettingCurve() {
    const timeline = await memoryTimelineService.getTimeline();
    return forgettingCurveService.calculateForgettingRisk(strengths, weaknesses, timeline);
  },

  async getPersonalizedRecommendations() {
    const timeline = await memoryTimelineService.getTimeline();
    const detectedWeaknesses = weaknessDetectionService.detectWeaknesses(weaknesses, timeline);
    const learningPatternInsights = learningPatternService.analyzeLearningPatterns(studyPatterns, attentionProfile, timeline);
    const forgettingCurve = forgettingCurveService.calculateForgettingRisk(strengths, weaknesses, timeline);

    return recommendationService.generateRecommendations(detectedWeaknesses, forgettingCurve, learningPatternInsights);
  },

  async getStudentSummary() {
    const timeline = await memoryTimelineService.getTimeline();
    const detectedWeaknesses = weaknessDetectionService.detectWeaknesses(weaknesses, timeline);
    const detectedStrengths = strengthDetectionService.detectStrengths(strengths, timeline);
    const learningPatternInsights = learningPatternService.analyzeLearningPatterns(studyPatterns, attentionProfile, timeline);
    const forgettingCurve = forgettingCurveService.calculateForgettingRisk(strengths, weaknesses, timeline);
    const recommendations = recommendationService.generateRecommendations(detectedWeaknesses, forgettingCurve, learningPatternInsights);

    return studentSummaryService.generateStudentSummary(studentProfile, detectedStrengths, detectedWeaknesses, recommendations);
  },

  async getLongTermMemoryInsights() {
    const timeline = await memoryTimelineService.getTimeline();
    const detectedWeaknesses = weaknessDetectionService.detectWeaknesses(weaknesses, timeline);
    const detectedStrengths = strengthDetectionService.detectStrengths(strengths, timeline);
    const learningPatternInsights = learningPatternService.analyzeLearningPatterns(studyPatterns, attentionProfile, timeline);
    const forgettingCurve = forgettingCurveService.calculateForgettingRisk(strengths, weaknesses, timeline);
    const recommendations = recommendationService.generateRecommendations(detectedWeaknesses, forgettingCurve, learningPatternInsights);

    return longTermMemoryEngineService.aggregateLongTermMemoryInsights(
      studentProfile,
      timeline,
      detectedStrengths,
      detectedWeaknesses,
      learningPatternInsights,
      forgettingCurve,
      recommendations,
    );
  },
};
