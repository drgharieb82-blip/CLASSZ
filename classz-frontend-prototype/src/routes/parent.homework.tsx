import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashPage } from "@/components/common/DashPage";
import { ChildSwitcher } from "@/components/parent/ChildSwitcher";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import { getChildHomework } from "@/lib/api/parents";
import type { AssignmentRead } from "@/lib/api/assignments";
import { useParentSelectedChildStore } from "@/lib/stores/parent-selected-child-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/parent/homework")({
  component: Page,
});

function Page() {
  const selectedChildId = useParentSelectedChildStore((s) => s.selectedChildId);
  const [assignments, setAssignments] = useState<AssignmentRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedChildId) {
      setAssignments([]);
      return;
    }
    setLoading(true);
    setError("");
    getChildHomework(selectedChildId)
      .then(setAssignments)
      .catch((err) => setError(extractDetail(err)))
      .finally(() => setLoading(false));
  }, [selectedChildId]);

  return (
    <DashPage role="parent" title="Homework" subtitle="Assignments and due dates" icon={ROLES.parent.icon}>
      <ChildSwitcher />

      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
          Loading...
        </div>
      )}

      {!loading && assignments.length === 0 && !error && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
          No assignments yet.
        </div>
      )}

      {!loading && assignments.length > 0 && (
        <div className="space-y-2">
          {assignments.map((assignment) => {
            const submission = assignment.submissions[0];
            return (
              <div key={assignment.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{assignment.title}</p>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                      submission
                        ? submission.status === "GRADED"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-sky-500/15 text-sky-300"
                        : "bg-amber-500/15 text-amber-300",
                    )}
                  >
                    {submission ? submission.status : "Not submitted"}
                  </span>
                </div>
                {assignment.description && (
                  <p className="mt-1 text-sm text-slate-400">{assignment.description}</p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  {assignment.deadline_at
                    ? `Due ${new Date(assignment.deadline_at).toLocaleDateString()}`
                    : "No deadline"}{" "}
                  · {assignment.max_points} points
                </p>
              </div>
            );
          })}
        </div>
      )}
    </DashPage>
  );
}

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Unable to load homework.";
}
