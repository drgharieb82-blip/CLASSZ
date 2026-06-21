import { courses, enrolledCourses, type EnrolledCourse } from "./mock";
import { useEnrollmentStore } from "./stores/enrollment-store";
import { getPublishedPublicCourses } from "./teacher/teacher-course-store";

function courseToEnrolled(courseId: string): EnrolledCourse | null {
  const base = courses.find((c) => c.id === courseId)
    ?? (() => {
      const tc = getPublishedPublicCourses().find((c) => c.id === courseId);
      if (!tc) return undefined;
      return { id: tc.id, title: tc.title, emoji: tc.coverEmoji, color: tc.coverColor, teacher: tc.teacherName, lessons: tc.lessonsCount, hours: tc.hoursCount, price: tc.price } as any;
    })();
  if (!base) return null;
  return {
    id: base.id,
    name: base.title,
    emoji: base.emoji,
    color: base.color,
    teacher: base.teacher,
    status: "active",
    progress: 0,
    completedLessons: 0,
    totalLessons: base.lessons,
    completedQuizzes: 0,
    totalQuizzes: Math.ceil(base.lessons / 6),
    averageScore: 0,
    lastWatchedLesson: "—",
    nextLesson: "Start first lesson",
    weakestConcept: "—",
    strongestConcept: "—",
  };
}

export function getAllEnrolledCourses(): EnrolledCourse[] {
  const storeIds = useEnrollmentStore.getState().enrolledCourseIds;
  const mockIds = new Set(enrolledCourses.map((c) => c.id));

  const dynamicCourses: EnrolledCourse[] = [];
  for (const id of storeIds) {
    if (!mockIds.has(id)) {
      const converted = courseToEnrolled(id);
      if (converted) dynamicCourses.push(converted);
    }
  }

  return [...enrolledCourses, ...dynamicCourses];
}

export function getEnrolledCourse(id: string): EnrolledCourse | undefined {
  const storeIds = useEnrollmentStore.getState().enrolledCourseIds;
  const mock = enrolledCourses.find((c) => c.id === id);
  if (mock) return mock;

  if (storeIds.includes(id)) {
    return courseToEnrolled(id) ?? undefined;
  }
  return undefined;
}
