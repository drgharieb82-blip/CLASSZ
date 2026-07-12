import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState, type ElementType } from "react";
import { BarChart3, BookOpen, ClipboardList, Clock3 } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import { getMyProgressSummary, type StudentProgressSummaryRead } from "@/lib/api/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  const [summary, setSummary] = useState<StudentProgressSummaryRead | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMyProgressSummary()
      .then((response) => {
        if (!active) return;
        setSummary(response);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof ApiError && typeof err.body === "object" && err.body !== null && "detail" in err.body
            ? String((err.body as { detail: string }).detail)
            : "Failed to load progress.",
        );
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DashPage
      role="student"
      title="My Progress"
      subtitle="Real progress across your enrolled courses"
      icon={ROLES.student.icon}
    >
      {!summary ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-sm text-slate-400">
          Loading progress...
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.45 }}
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            <MetricCard
              icon={BookOpen}
              label="Courses Enrolled"
              value={`${summary.total_courses_enrolled}`}
              helper={`${summary.total_courses_completed} completed`}
            />
            <MetricCard
              icon={BarChart3}
              label="Overall Progress"
              value={`${summary.overall_progress_percent}%`}
              helper={`${summary.total_sessions_completed}/${summary.total_sessions} sessions complete`}
            />
            <MetricCard
              icon={ClipboardList}
              label="Quiz Average"
              value={`${summary.overall_average_score}%`}
              helper={`${summary.total_quizzes_completed}/${summary.total_quizzes} quizzes attempted`}
            />
            <MetricCard
              icon={Clock3}
              label="Study Time"
              value={`${summary.total_time_minutes} min`}
              helper="Tracked from session activity"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] md:p-6"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Course Rollup
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Session completion and quiz performance per enrolled course.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
                {summary.total_courses_enrolled} active courses
              </div>
            </div>

            <div className="space-y-4">
              {summary.courses.map((course) => (
                <div key={course.course_id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-white">{course.course_title}</p>
                      <p className="text-sm text-slate-400">
                        {course.teacher_name ?? "Assigned Teacher"} - {course.subject} - {course.grade}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                        course.status === "completed"
                          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                          : "border-cyan-500/30 bg-cyan-500/15 text-cyan-300",
                      )}
                    >
                      {course.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                      <span>Session progress</span>
                      <span className="font-semibold text-white">{course.progress_percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r",
                          course.status === "completed" ? "from-emerald-500 to-cyan-500" : "from-violet-500 to-blue-500",
                        )}
                        style={{ width: `${course.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-4">
                    <TinyMetric label="Sessions" value={`${course.sessions_completed}/${course.sessions_total}`} />
                    <TinyMetric label="Quizzes" value={`${course.quizzes_completed}/${course.quizzes_total}`} />
                    <TinyMetric label="Avg Score" value={`${Math.round(course.average_score)}%`} />
                    <TinyMetric label="Time" value={`${course.total_time_minutes} min`} />
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <InlineRow label="Last session" value={course.last_session_title ?? "Not started"} />
                    <InlineRow label="Next session" value={course.next_session_title ?? "All sessions complete"} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </DashPage>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: ElementType;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15">
        <Icon className="h-5 w-5 text-violet-400" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-[11px] text-slate-600">{helper}</p>
    </div>
  );
}

function TinyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
    </div>
  );
}

function InlineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm text-slate-200">{value}</p>
    </div>
  );
}
