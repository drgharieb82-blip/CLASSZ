import type { AttentionProfile, LearningPatternInsight, MemoryTimeline, StudyPattern } from "../types";

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
  analyzeLearningPatterns,
};
