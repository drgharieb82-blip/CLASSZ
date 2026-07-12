import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, BookOpen, Layers, Wallet } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { ChildSwitcher } from "@/components/parent/ChildSwitcher";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import { getChildDashboard } from "@/lib/api/parents";
import type { StudentDashboardSummaryRead } from "@/lib/api/student";
import { useParentSelectedChildStore } from "@/lib/stores/parent-selected-child-store";

export const Route = createFileRoute("/parent/")({ component: Page });

function Page() {
  const selectedChildId = useParentSelectedChildStore((s) => s.selectedChildId);
  const [dashboard, setDashboard] = useState<StudentDashboardSummaryRead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedChildId) {
      setDashboard(null);
      return;
    }
    setLoading(true);
    setError("");
    getChildDashboard(selectedChildId)
      .then(setDashboard)
      .catch((err) => setError(extractDetail(err)))
      .finally(() => setLoading(false));
  }, [selectedChildId]);

  return (
    <DashPage
      role="parent"
      title="Parent Dashboard"
      subtitle="Follow your child's learning journey"
      icon={ROLES.parent.icon}
    >
      <ChildSwitcher />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
          Loading...
        </div>
      )}

      {!loading && dashboard && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={Layers}
              label="Courses enrolled"
              value={dashboard.progress.total_courses_enrolled}
            />
            <SummaryCard
              icon={BookOpen}
              label="Overall progress"
              value={`${dashboard.progress.overall_progress_percent.toFixed(0)}%`}
            />
            <SummaryCard icon={Wallet} label="Wallet balance" value={`$${dashboard.wallet_balance.toFixed(2)}`} />
            <SummaryCard
              icon={Award}
              label="Certificates"
              value={dashboard.recent_certificates.length}
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Courses</h2>
            {dashboard.featured_courses.length === 0 ? (
              <p className="text-sm text-slate-400">No enrolled courses yet.</p>
            ) : (
              <div className="space-y-2">
                {dashboard.featured_courses.map((course) => (
                  <div
                    key={course.course_id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{course.course_title}</p>
                      <p className="text-xs text-slate-500">
                        {course.sessions_completed}/{course.sessions_total} sessions ·{" "}
                        {course.quizzes_completed}/{course.quizzes_total} quizzes
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-violet-300">{course.progress_percent}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </DashPage>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15">
        <Icon className="h-5 w-5 text-violet-300" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
    </div>
  );
}

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Unable to load dashboard.";
}
