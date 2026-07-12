import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { ChildSwitcher } from "@/components/parent/ChildSwitcher";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import { getChildAttendance } from "@/lib/api/parents";
import type { CourseProgressRead } from "@/lib/api/progress";
import { useParentSelectedChildStore } from "@/lib/stores/parent-selected-child-store";

export const Route = createFileRoute("/parent/attendance")({
  component: Page,
});

function Page() {
  const selectedChildId = useParentSelectedChildStore((s) => s.selectedChildId);
  const [courses, setCourses] = useState<CourseProgressRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedChildId) {
      setCourses([]);
      return;
    }
    setLoading(true);
    setError("");
    getChildAttendance(selectedChildId)
      .then((map) => setCourses(Object.values(map)))
      .catch((err) => setError(extractDetail(err)))
      .finally(() => setLoading(false));
  }, [selectedChildId]);

  return (
    <DashPage role="parent" title="Attendance" subtitle="Session completion overview" icon={ROLES.parent.icon}>
      <ChildSwitcher />

      <div className="flex items-start gap-2 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-xs text-sky-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          This shows session completion per course, not roll-call attendance — CLASSZ doesn't track live
          class check-ins.
        </span>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
          Loading...
        </div>
      )}

      {!loading && courses.length === 0 && !error && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
          No sessions recorded yet.
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div className="space-y-2">
          {courses.map((course) => (
            <div key={course.course_id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{course.course_title}</p>
                <span className="text-sm font-semibold text-violet-300">
                  {course.sessions_completed}/{course.sessions_total} sessions
                </span>
              </div>
              {course.last_session_title && (
                <p className="mt-1 text-xs text-slate-500">Last: {course.last_session_title}</p>
              )}
              {course.next_session_title && (
                <p className="text-xs text-slate-500">Next: {course.next_session_title}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashPage>
  );
}

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Unable to load attendance.";
}
