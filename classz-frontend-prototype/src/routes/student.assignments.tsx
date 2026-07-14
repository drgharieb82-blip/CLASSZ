import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ClipboardList, Clock, Loader2, Send } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { GradientButton } from "@/components/premium/GradientButton";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import {
  listAssignments,
  submitAssignment,
  type AssignmentRead,
} from "@/lib/api/assignments";

export const Route = createFileRoute("/student/assignments")({
  component: Page,
});

function extractDetail(error: unknown, fallback: string): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return fallback;
}

function Page() {
  const [assignments, setAssignments] = useState<AssignmentRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    listAssignments()
      .then((items) => {
        if (active) setAssignments(items);
      })
      .catch((err) => {
        if (active) setError(extractDetail(err, "Failed to load assignments."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const sorted = useMemo(
    () =>
      [...assignments].sort((a, b) => {
        if (!a.deadline_at) return 1;
        if (!b.deadline_at) return -1;
        return new Date(a.deadline_at).getTime() - new Date(b.deadline_at).getTime();
      }),
    [assignments],
  );

  const startSubmit = (assignment: AssignmentRead) => {
    setActiveId(assignment.id);
    setDraftText(assignment.submissions[0]?.submission_text ?? "");
    setSubmitError("");
  };

  const submit = async (assignment: AssignmentRead) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const submission = await submitAssignment(assignment.id, { submission_text: draftText });
      setAssignments((prev) =>
        prev.map((item) =>
          item.id === assignment.id ? { ...item, submissions: [submission] } : item,
        ),
      );
      setActiveId(null);
    } catch (err) {
      setSubmitError(extractDetail(err, "Failed to submit assignment."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashPage
      role="student"
      title="Assignments"
      subtitle="Real assignments from your enrolled courses"
      icon={ROLES.student.icon}
    >
      {loading && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" /> Loading assignments…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-slate-400">
          Assignments unavailable: {error}
        </div>
      )}

      {!loading && !error && sorted.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
          <ClipboardList className="h-12 w-12 text-slate-600" />
          <p className="text-sm text-slate-400">No assignments yet.</p>
        </div>
      )}

      {!loading && !error && sorted.length > 0 && (
        <div className="space-y-3">
          {sorted.map((assignment) => {
            const mySubmission = assignment.submissions[0] ?? null;
            const isActive = activeId === assignment.id;
            return (
              <div
                key={assignment.id}
                className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{assignment.title}</p>
                    {assignment.description && (
                      <p className="mt-0.5 text-sm text-slate-400">{assignment.description}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{assignment.max_points} points</span>
                      {assignment.deadline_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Due {new Date(assignment.deadline_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {mySubmission ? (
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                      Not submitted
                    </span>
                  )}
                </div>

                {(!mySubmission || assignment.allow_multiple_submissions) && (
                  <div className="mt-3">
                    {isActive ? (
                      <div className="space-y-2">
                        <textarea
                          value={draftText}
                          onChange={(event) => setDraftText(event.target.value)}
                          rows={4}
                          placeholder="Write your answer..."
                          className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-200 outline-none focus:border-violet-500/40"
                        />
                        {submitError && <p className="text-xs text-red-400">{submitError}</p>}
                        <div className="flex gap-2">
                          <GradientButton
                            size="sm"
                            disabled={submitting || !draftText.trim()}
                            onClick={() => void submit(assignment)}
                          >
                            {submitting ? "Submitting..." : (
                              <>
                                <Send className="h-3.5 w-3.5" /> Submit
                              </>
                            )}
                          </GradientButton>
                          <GradientButton variant="outline" size="sm" onClick={() => setActiveId(null)}>
                            Cancel
                          </GradientButton>
                        </div>
                      </div>
                    ) : (
                      <GradientButton size="sm" onClick={() => startSubmit(assignment)}>
                        {mySubmission ? "Resubmit" : "Submit"}
                      </GradientButton>
                    )}
                  </div>
                )}

                {mySubmission?.submission_text && !isActive && (
                  <p className="mt-3 whitespace-pre-wrap rounded-xl border border-white/5 bg-black/20 p-3 text-sm text-slate-300">
                    {mySubmission.submission_text}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashPage>
  );
}
