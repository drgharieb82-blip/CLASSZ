import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getMyPermissions, type AssistantAction, type AssistantResource, type AssistantTeacherPermissionsRead } from "@/lib/api/assistants";
import { listMyCourses, type CourseRead } from "@/lib/api/courses";

export function extractErrorDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Something went wrong. Please try again.";
}

export interface AssistantScopedCourse {
  course: CourseRead;
  teacherId: string;
  teacherName: string;
}

/** For the `assistant` role: resolves the set of courses reachable through an
 * ACTIVE teacher link that has granted `(resource, action)`, by combining the
 * existing `GET /assistants/me/permissions` and `GET /courses?teacher_id=`
 * endpoints — no assistant-specific backend endpoint exists for this, so the
 * course list is built client-side from data already scoped server-side. */
export function useAssistantScopedCourses(resource: AssistantResource, action: AssistantAction) {
  const [courses, setCourses] = useState<AssistantScopedCourse[]>([]);
  const [permissions, setPermissions] = useState<AssistantTeacherPermissionsRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const perTeacher = await getMyPermissions();
        const granted = perTeacher.filter((tp) =>
          tp.permissions.some((g) => g.resource === resource && g.action === action)
        );
        const courseLists = await Promise.all(granted.map((tp) => listMyCourses(tp.teacher_id)));
        if (!active) return;
        const scoped: AssistantScopedCourse[] = [];
        granted.forEach((tp, idx) => {
          for (const course of courseLists[idx]) {
            scoped.push({ course, teacherId: tp.teacher_id, teacherName: tp.teacher_full_name });
          }
        });
        setCourses(scoped);
        setPermissions(perTeacher);
      } catch (err) {
        if (active) setError(extractErrorDetail(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [resource, action]);

  const hasPermission = (courseId: string, res: AssistantResource, act: AssistantAction): boolean => {
    const scoped = courses.find((c) => c.course.id === courseId);
    if (!scoped) return false;
    const teacherPerms = permissions.find((tp) => tp.teacher_id === scoped.teacherId);
    return teacherPerms?.permissions.some((g) => g.resource === res && g.action === act) ?? false;
  };

  return { courses, loading, error, hasPermission };
}
