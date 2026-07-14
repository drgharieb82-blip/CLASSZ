import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CreditCard,
  GraduationCap,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useState, type ElementType } from "react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import { getMyDashboardSummary, type StudentDashboardSummaryRead } from "@/lib/api/student";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/")({
  component: StudentHome,
});

function StudentHome() {
  const [summary, setSummary] = useState<StudentDashboardSummaryRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMyDashboardSummary()
      .then((response) => {
        if (!active) return;
        setSummary(response);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(extractDetail(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DashPage
      role="student"
      title={summary ? `Welcome back, ${summary.full_name}` : "My Dashboard"}
      subtitle="Everything important in one real student summary."
      icon={ROLES.student.icon}
    >
      {loading ? (
        <Card className="border bg-card p-8 text-sm text-muted-foreground">Loading dashboard...</Card>
      ) : summary ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            <MetricCard icon={BookOpen} label="Courses" value={summary.progress.total_courses_enrolled} helper={`${summary.progress.total_courses_completed} completed`} />
            <MetricCard icon={Sparkles} label="Progress" value={`${summary.progress.overall_progress_percent}%`} helper={`${summary.progress.total_sessions_completed}/${summary.progress.total_sessions} sessions`} />
            <MetricCard icon={Bell} label="Unread" value={summary.notifications.unread_count} helper={`${summary.notifications.total_count} notifications total`} />
            <MetricCard icon={Wallet} label="Balance" value={`$${summary.wallet_balance.toFixed(2)}`} helper="Ready for enrollment" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
            className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
          >
            <Card className="border bg-card p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Continue learning</p>
                  <h2 className="text-xl font-semibold">
                    {summary.featured_courses[0]?.course_title ?? "No enrolled courses yet"}
                  </h2>
                </div>
                <Badge className="rounded-full gradient-brand border-0 text-white">
                  {summary.progress.overall_progress_percent}% overall
                </Badge>
              </div>

              {summary.featured_courses[0] ? (
                <div className="space-y-3">
                  <ProgressBar percent={summary.featured_courses[0].progress_percent} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoPill label="Sessions" value={`${summary.featured_courses[0].sessions_completed}/${summary.featured_courses[0].sessions_total}`} />
                    <InfoPill label="Quizzes" value={`${summary.featured_courses[0].quizzes_completed}/${summary.featured_courses[0].quizzes_total}`} />
                    <InfoPill label="Average score" value={`${Math.round(summary.featured_courses[0].average_score)}%`} />
                    <InfoPill label="Last session" value={summary.featured_courses[0].last_session_title ?? "Not started"} />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Link to="/student/courses" className="inline-flex items-center gap-2 rounded-xl bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-200 hover:bg-violet-500/20">
                      <BookOpen className="h-4 w-4" /> Open courses
                    </Link>
                    <Link
                      to="/student/courses"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/[0.04]"
                    >
                      <ArrowRight className="h-4 w-4" /> Continue
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-400">
                  You do not have an active course yet.
                </div>
              )}
            </Card>

            <Card className="border bg-card p-6">
              <h3 className="font-semibold">Quick actions</h3>
              <div className="mt-4 grid gap-3">
                <QuickAction icon={Bell} label="Notifications" to="/student/notifications" />
                <QuickAction icon={Wallet} label="Wallet" to="/student/wallet" />
                <QuickAction icon={GraduationCap} label="Certificates" to="/student/certificates" />
                <QuickAction icon={CreditCard} label="Profile" to="/student/profile" />
                <QuickAction icon={Sparkles} label="Settings" to="/student/settings" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.4 }}
            className="grid gap-6 xl:grid-cols-2"
          >
            <Card className="border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Top courses</h3>
                <Link to="/student/progress" className="text-sm text-violet-300 hover:text-violet-200">
                  View progress
                </Link>
              </div>
              <div className="space-y-3">
                {summary.featured_courses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No course rollups available yet.</p>
                ) : (
                  summary.featured_courses.map((course) => <CourseRow key={course.course_id} course={course} />)
                )}
              </div>
            </Card>

            <Card className="border bg-card p-6">
              <h3 className="font-semibold">Recent notifications</h3>
              <div className="mt-4 space-y-3">
                {summary.recent_notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent notifications yet.</p>
                ) : (
                  summary.recent_notifications.map((notification) => (
                    <div key={notification.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-sm font-medium text-white">{notification.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{notification.body}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4 }}
          >
            <Card className="border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Certificates</h3>
                <span className="text-sm text-muted-foreground">{summary.recent_certificates.length} recent</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {summary.recent_certificates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No certificates issued yet.</p>
                ) : (
                  summary.recent_certificates.map((certificate) => (
                    <div key={certificate.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-sm font-semibold text-white">{certificate.course_title}</p>
                      <p className="mt-1 text-sm text-slate-400">{certificate.title}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </>
      ) : null}

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
  value: string | number;
  helper: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-lg">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15">
        <Icon className="h-5 w-5 text-violet-300" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-[11px] text-slate-600">{helper}</p>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  to,
}: {
  icon: ElementType;
  label: string;
  to: string;
}) {
  return (
    <Link
      to={to as never}
      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-200 hover:bg-white/[0.05]"
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-violet-300" />
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-slate-500" />
    </Link>
  );
}

function CourseRow({ course }: { course: StudentDashboardSummaryRead["featured_courses"][number] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{course.course_title}</p>
          <p className="text-sm text-slate-400">
            {course.subject} - {course.grade}
          </p>
        </div>
        <Badge className="rounded-full border-0 bg-white/10 text-white">{course.progress_percent}%</Badge>
      </div>
      <ProgressBar percent={course.progress_percent} />
      <p className="mt-2 text-xs text-slate-500">
        {course.sessions_completed}/{course.sessions_total} sessions - {course.quizzes_completed}/{course.quizzes_total} quizzes
      </p>
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" style={{ width: `${percent}%` }} />
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Unable to load dashboard.";
}
