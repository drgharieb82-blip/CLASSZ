import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashPage } from "@/components/common/DashPage";
import { ChildSwitcher } from "@/components/parent/ChildSwitcher";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import { getChildProgress } from "@/lib/api/parents";
import type { StudentProgressSummaryRead } from "@/lib/api/progress";
import { useParentSelectedChildStore } from "@/lib/stores/parent-selected-child-store";

export const Route = createFileRoute("/parent/progress")({
  component: Page,
});

function Page() {
  const selectedChildId = useParentSelectedChildStore((s) => s.selectedChildId);
  const [progress, setProgress] = useState<StudentProgressSummaryRead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedChildId) {
      setProgress(null);
      return;
    }
    setLoading(true);
    setError("");
    getChildProgress(selectedChildId)
      .then(setProgress)
      .catch((err) => setError(extractDetail(err)))
      .finally(() => setLoading(false));
  }, [selectedChildId]);

  return (
    <DashPage role="parent" title="Child Progress" subtitle="Performance across subjects" icon={ROLES.parent.icon}>
      <ChildSwitcher />

      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
          Loading...
        </div>
      )}

      {!loading && progress && progress.courses.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
          No course progress recorded yet.
        </div>
      )}

      {!loading && progress && progress.courses.length > 0 && (
        <div className="space-y-2">
          {progress.courses.map((course) => (
            <div
              key={course.course_id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{course.course_title}</p>
                  <p className="text-xs text-slate-500">
                    {course.subject} · {course.grade} · {course.teacher_name ?? "Unassigned teacher"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-violet-300">{course.progress_percent}%</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-400 sm:grid-cols-4">
                <span>
                  Sessions: {course.sessions_completed}/{course.sessions_total}
                </span>
                <span>
                  Quizzes: {course.quizzes_completed}/{course.quizzes_total}
                </span>
                <span>Avg score: {course.average_score.toFixed(0)}%</span>
                <span>Status: {course.status}</span>
              </div>
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
  return "Unable to load progress.";
}
