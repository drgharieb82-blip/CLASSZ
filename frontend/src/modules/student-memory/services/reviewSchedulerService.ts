import type {
  ConceptReviewNeed,
  ForgettingCurveItem,
  LearningPattern,
  MemoryTimeline,
  ReviewPriority,
  ReviewSession,
  ReviewTask,
  StudentWeakness,
} from "../types";

const dayMs = 24 * 60 * 60 * 1000;

const priorityWeight: Record<ReviewPriority, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

function addDays(timestamp: string, days: number) {
  return new Date(new Date(timestamp).getTime() + days * dayMs).toISOString();
}

function maxPriority(priorities: ReviewPriority[]): ReviewPriority {
  return priorities.reduce((highest, priority) => (priorityWeight[priority] > priorityWeight[highest] ? priority : highest), "Low");
}

function durationForUrgency(urgency: ReviewPriority) {
  if (urgency === "Critical") {
    return 18;
  }

  if (urgency === "High") {
    return 15;
  }

  if (urgency === "Medium") {
    return 12;
  }

  return 8;
}

function urgencyForWeakness(priority: StudentWeakness["priority"]): ReviewPriority {
  if (priority === "high") {
    return "High";
  }

  if (priority === "medium") {
    return "Medium";
  }

  return "Low";
}

function scheduleDateForPriority(priority: ReviewPriority, timeline: MemoryTimeline) {
  const latestEvent = timeline.events[0]?.timestamp ?? new Date().toISOString();

  if (priority === "Critical") {
    return new Date().toISOString();
  }

  if (priority === "High") {
    return addDays(new Date().toISOString(), 1);
  }

  if (priority === "Medium") {
    return addDays(latestEvent, 2);
  }

  return addDays(latestEvent, 5);
}

function patternReason(learningPatterns: LearningPattern[]) {
  const focusedSessionPattern = learningPatterns.find((pattern) => pattern.patternName.toLowerCase().includes("focused"));
  return focusedSessionPattern
    ? `${focusedSessionPattern.patternName}: ${focusedSessionPattern.description}`
    : "Schedule review during the student's most consistent study window.";
}

export function estimateSessionDuration(tasks: ReviewTask[], learningPatterns: LearningPattern[]): number {
  const totalTaskMinutes = tasks.reduce((sum, task) => sum + task.durationMinutes, 0);
  const focusedSession = learningPatterns.find((pattern) => pattern.patternName.toLowerCase().includes("focused"));
  const sessionCap = focusedSession ? 28 : 35;

  return Math.min(sessionCap, Math.max(10, totalTaskMinutes));
}

export function prioritizeTasks(tasks: ReviewTask[]): ReviewTask[] {
  return [...tasks].sort((firstTask, secondTask) => {
    const urgencyDelta = priorityWeight[secondTask.urgency] - priorityWeight[firstTask.urgency];

    if (urgencyDelta !== 0) {
      return urgencyDelta;
    }

    return secondTask.durationMinutes - firstTask.durationMinutes;
  });
}

export function generateReviewSchedule(
  forgettingCurve: ForgettingCurveItem[],
  reviewNeeds: ConceptReviewNeed[],
  weakConcepts: StudentWeakness[],
  learningPatterns: LearningPattern[],
  timeline: MemoryTimeline,
): ReviewSession[] {
  const reviewTasks = reviewNeeds.map((reviewNeed) => ({
    conceptId: reviewNeed.conceptId,
    conceptName: reviewNeed.conceptName,
    reason: reviewNeed.reason,
    durationMinutes: durationForUrgency(reviewNeed.urgency),
    urgency: reviewNeed.urgency,
  }));

  const weaknessTasks = weakConcepts
    .filter((weakness) => !reviewTasks.some((task) => task.conceptId === weakness.conceptId))
    .map((weakness) => {
      const urgency = urgencyForWeakness(weakness.priority);

      return {
        conceptId: weakness.conceptId,
        conceptName: weakness.conceptName,
        reason: weakness.recommendedAction,
        durationMinutes: durationForUrgency(urgency),
        urgency,
      };
    });

  const fallbackTasks = forgettingCurve
    .filter((point) => !reviewTasks.some((task) => task.conceptId === point.conceptId))
    .map((point) => ({
      conceptId: point.conceptId,
      conceptName: point.conceptName,
      reason: `Retention is currently ${point.retentionScore}%, with likely forgetting around ${new Date(point.predictedForgettingDate).toLocaleDateString()}.`,
      durationMinutes: durationForUrgency(point.urgency),
      urgency: point.urgency,
    }));

  const tasks = prioritizeTasks([...reviewTasks, ...weaknessTasks, ...fallbackTasks]).slice(0, 4);

  if (tasks.length === 0) {
    return [];
  }

  const priority = maxPriority(tasks.map((task) => task.urgency));
  const estimatedMinutes = estimateSessionDuration(tasks, learningPatterns);
  const followUpPriority: ReviewPriority = priority === "Critical" ? "High" : priority === "High" ? "Medium" : "Low";

  return [
    {
      id: "review-session-primary",
      scheduledAt: scheduleDateForPriority(priority, timeline),
      estimatedMinutes,
      priority,
      tasks,
    },
    {
      id: "review-session-follow-up",
      scheduledAt: addDays(scheduleDateForPriority(priority, timeline), priority === "Critical" || priority === "High" ? 2 : 4),
      estimatedMinutes: Math.max(10, Math.round(estimatedMinutes * 0.65)),
      priority: followUpPriority,
      tasks: tasks.slice(0, 2).map((task) => ({
        ...task,
        reason: `${task.reason} Follow up after the first review. ${patternReason(learningPatterns)}`,
        durationMinutes: Math.max(6, Math.round(task.durationMinutes * 0.7)),
      })),
    },
  ].filter((session) => session.tasks.length > 0);
}

export const reviewSchedulerService = {
  generateReviewSchedule,
  prioritizeTasks,
  estimateSessionDuration,
};
