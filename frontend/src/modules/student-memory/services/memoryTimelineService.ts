import type { MemoryEvent, MemoryTimeline } from "../types";

const timelineEvents: MemoryEvent[] = [
  {
    id: "memory-event-1",
    timestamp: "2026-06-13T15:30:00.000Z",
    eventType: "LearningPathUpdated",
    title: "Revision path updated",
    description: "The student memory timeline recorded a focused path for oxidation number and electrolysis revision.",
    importance: "high",
  },
  {
    id: "memory-event-2",
    timestamp: "2026-06-12T18:10:00.000Z",
    eventType: "WeaknessDetected",
    title: "Weakness detected in oxidation numbers",
    description: "Recent answers showed repeated mistakes when assigning oxidation numbers in redox equations.",
    importance: "high",
  },
  {
    id: "memory-event-3",
    timestamp: "2026-06-11T17:45:00.000Z",
    eventType: "QuizCompleted",
    title: "Electrochemistry quiz completed",
    description: "The student completed a short quiz covering galvanic cells, electrolytic cells, and electrode roles.",
    importance: "medium",
  },
  {
    id: "memory-event-4",
    timestamp: "2026-06-10T16:20:00.000Z",
    eventType: "MasteryImproved",
    title: "Mastery improved in galvanic cells",
    description: "Concept mastery improved after consistent success with anode, cathode, and salt bridge questions.",
    importance: "medium",
  },
  {
    id: "memory-event-5",
    timestamp: "2026-06-09T19:05:00.000Z",
    eventType: "RevisionCompleted",
    title: "Focused revision completed",
    description: "The student completed a targeted revision session on mole ratios and mass conversion.",
    importance: "low",
  },
  {
    id: "memory-event-6",
    timestamp: "2026-06-08T14:40:00.000Z",
    eventType: "LessonCompleted",
    title: "Lesson completed",
    description: "The student completed the introductory electrochemistry lesson and unlocked follow-up practice.",
    importance: "low",
  },
];

let timeline: MemoryTimeline = {
  id: "memory-timeline-1",
  studentId: "student-1",
  events: timelineEvents,
};

function simulateApi<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), 300);
  });
}

export function sortTimeline(memoryTimeline: MemoryTimeline): MemoryTimeline {
  return {
    ...memoryTimeline,
    events: [...memoryTimeline.events].sort((firstEvent, secondEvent) => {
      return new Date(secondEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime();
    }),
  };
}

export function getTimeline(): Promise<MemoryTimeline> {
  return simulateApi(sortTimeline(timeline));
}

export function addMemoryEvent(memoryEvent: MemoryEvent): Promise<MemoryTimeline> {
  timeline = sortTimeline({
    ...timeline,
    events: [memoryEvent, ...timeline.events],
  });

  return simulateApi(timeline);
}

export const memoryTimelineService = {
  getTimeline,
  addMemoryEvent,
  sortTimeline,
};
