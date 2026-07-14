import { ApiError } from "@/lib/api/client";
import { getCourse, type CourseDetailsRead } from "@/lib/api/courses";
import { getMyEnrollmentStatus } from "@/lib/api/enrollments";
import { listSessions } from "@/lib/api/sessions";

export type StudentCourseAccess = {
  allowed: boolean;
  course: CourseDetailsRead | null;
  sessionCount: number;
};

export async function loadStudentCourseOwnership(courseId: string): Promise<boolean> {
  const status = await getMyEnrollmentStatus(courseId);
  return status.enrolled;
}

export async function loadStudentCourseAccess(
  courseId: string,
  options: { includeSessions?: boolean } = {},
): Promise<StudentCourseAccess> {
  const includeSessions = options.includeSessions ?? false;

  const [allowed, course, sessions] = await Promise.all([
    loadStudentCourseOwnership(courseId),
    getCourse(courseId),
    includeSessions ? listSessions(courseId) : Promise.resolve(null),
  ]);

  return {
    allowed,
    course,
    sessionCount: sessions?.length ?? 0,
  };
}

export function getStudentCourseAccessError(
  err: unknown,
  fallbackMessage: string,
): string {
  if (
    err instanceof ApiError &&
    typeof err.body === "object" &&
    err.body !== null &&
    "detail" in err.body
  ) {
    return String((err.body as { detail: string }).detail);
  }

  return fallbackMessage;
}
