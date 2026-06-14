import type { AttentionProfile, LearningPattern, LearningPatternInsight, MemoryTimeline, StudyHabit, StudyPattern } from "../types";

const studyHabit: StudyHabit = {
  preferredStudyTime: "evening",
  averageSessionMinutes: 28,
  consistencyScore: 78,
};

const attentionProfile: AttentionProfile = {
  focusLevel: 74,
  distractionLevel: 32,
  preferredSessionLength: 28,
  attentionSpan: 22,
  bestSessionLength: 28,
  breakFrequencyMinutes: 25,
  needsMotivation: true,
};

function simulateApi<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), 300);
  });
}

export function calculateConsistencyScore(studyHabitInput: StudyHabit, timeline: MemoryTimeline): number {
  const completedEvents = timeline.events.filter((event) =>
    ["LessonCompleted", "QuizCompleted", "RevisionCompleted", "MasteryImproved"].includes(event.eventType),
  );
  const activityScore = Math.min(completedEvents.length * 8, 40);
  const sessionScore = studyHabitInput.averageSessionMinutes >= 20 && studyHabitInput.averageSessionMinutes <= 35 ? 30 : 18;
  const habitScore = Math.round(studyHabitInput.consistencyScore * 0.3);

  return Math.min(100, activityScore + sessionScore + habitScore);
}

export function detectPatterns(
  studyHabitInput: StudyHabit,
  attentionProfileInput: AttentionProfile,
  timeline: MemoryTimeline,
): LearningPattern[] {
  const consistencyScore = calculateConsistencyScore(studyHabitInput, timeline);
  const completedEvents = timeline.events.filter((event) =>
    ["LessonCompleted", "QuizCompleted", "RevisionCompleted"].includes(event.eventType),
  );

  return [
    {
      id: "learning-pattern-evening-rhythm",
      patternName: "Evening study rhythm",
      description: `The student repeatedly studies in the ${studyHabitInput.preferredStudyTime}, which appears to be the most reliable learning window.`,
      frequency: "5 days/week",
      confidence: consistencyScore,
    },
    {
      id: "learning-pattern-focused-sessions",
      patternName: "Focused short sessions",
      description: `The strongest learning window is around ${attentionProfileInput.preferredSessionLength} minutes before attention starts to drop.`,
      frequency: "Most sessions",
      confidence: attentionProfileInput.focusLevel,
    },
    {
      id: "learning-pattern-completion-momentum",
      patternName: "Completion momentum",
      description: `${completedEvents.length} recent timeline events show completed lessons, quizzes, or revision tasks.`,
      frequency: "Recent timeline",
      confidence: completedEvents.length >= 3 ? 84 : 68,
    },
  ];
}

export function getLearningPatterns(timeline: MemoryTimeline): Promise<LearningPattern[]> {
  return simulateApi(detectPatterns(studyHabit, attentionProfile, timeline));
}

export function analyzeLearningPatterns(
  studyPatterns: StudyPattern[],
  attentionProfile: AttentionProfile,
  timeline: MemoryTimeline,
): LearningPatternInsight[] {
  const pattern = studyPatterns[0];
  const completedEvents = timeline.events.filter((event) =>
    ["LessonCompleted", "QuizCompleted", "RevisionCompleted"].includes(event.eventType),
  );

  if (!pattern) {
    return [];
  }

  return [
    {
      id: "pattern-consistency",
      patternType: "consistency",
      title: "Study consistency",
      description: `The student studies ${pattern.weeklyStudyDays} days per week with ${pattern.consistencyLevel} consistency.`,
      confidence: pattern.weeklyStudyDays >= 5 ? 86 : 70,
      recommendation: "Keep revision sessions predictable and connect them to short practice tasks.",
    },
    {
      id: "pattern-session-length",
      patternType: "sessionLength",
      title: "Best session window",
      description: `Average sessions are ${pattern.averageSessionMinutes} minutes, while attention is strongest around ${attentionProfile.bestSessionLength} minutes.`,
      confidence: 82,
      recommendation: `Plan focused sessions near ${attentionProfile.bestSessionLength} minutes before adding a break.`,
    },
    {
      id: "pattern-activity",
      patternType: "motivation",
      title: "Recent productive activity",
      description: `${completedEvents.length} recent timeline events show completed learning activity.`,
      confidence: completedEvents.length >= 3 ? 84 : 68,
      recommendation: attentionProfile.needsMotivation ? "Use visible progress feedback after every revision step." : "Maintain the current feedback rhythm.",
    },
  ];
}

export const learningPatternService = {
  getLearningPatterns,
  detectPatterns,
  calculateConsistencyScore,
  analyzeLearningPatterns,
};
