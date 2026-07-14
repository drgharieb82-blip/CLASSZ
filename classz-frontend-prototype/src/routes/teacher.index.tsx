import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen, CreditCard, FileText, MessageSquare, Plus,
  Users, ClipboardList, Bell, ArrowRight,
} from "lucide-react";
import { seedTeacherData } from "@/lib/teacher/seed-teacher-data";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  getTeacherDashboardSummary, getTeacherPendingTasks, getTeacherRecentActivity,
  type TeacherDashboardSummary, type TeacherPendingTask, type TeacherActivityItem,
} from "@/lib/api/teacher-dashboard";

export const Route = createFileRoute("/teacher/")({
  component: TeacherDashboard,
});

interface RecentActivityRow extends TeacherActivityItem {
  kind: "QUIZ" | "ASSIGNMENT";
}

export function TeacherDashboard() {
  const { t } = useApp();
  const user = useAuthStore((s) => s.user);
  useEffect(() => { seedTeacherData(); }, []);

  const [summary, setSummary] = useState<TeacherDashboardSummary | null>(null);
  const [pendingTasks, setPendingTasks] = useState<TeacherPendingTask[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivityRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [summaryRes, tasksRes, activityRes] = await Promise.all([
          getTeacherDashboardSummary(),
          getTeacherPendingTasks(),
          getTeacherRecentActivity(),
        ]);
        if (cancelled) return;
        setSummary(summaryRes);
        setPendingTasks(tasksRes.pending_tasks);
        const merged: RecentActivityRow[] = [
          ...activityRes.recent_quizzes.map((q) => ({ ...q, kind: "QUIZ" as const })),
          ...activityRes.recent_assignments.map((a) => ({ ...a, kind: "ASSIGNMENT" as const })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRecentActivity(merged.slice(0, 5));
      } catch {
        // Leave summary/pendingTasks/recentActivity at their empty defaults — the sections
        // below already render honest empty states rather than fabricated numbers.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const quickActions = [
    { label: t("teacher.createSession"), icon: Plus, to: "/teacher/content-studio" },
    { label: t("teacher.addQuiz"), icon: ClipboardList, to: "/teacher/quizzes" },
    { label: t("teacher.uploadMaterial"), icon: FileText, to: "/teacher/courses" },
    { label: t("teacher.addQuestions"), icon: BookOpen, to: "/teacher/questions" },
    { label: t("teacher.announcement"), icon: Bell, to: "/teacher/chat" },
    { label: t("teacher.viewRevenue"), icon: CreditCard, to: "/teacher/revenue" },
  ];

  const subtitle = user ? `${user.full_name} · ${user.publicCode}` : "";

  return (
    <DashPage role="teacher" title={t("teacher.workspaceTitle")} subtitle={subtitle} icon={ROLES.teacher.icon}>
      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label={t("stu.totalStudents")} value={isLoading ? "…" : (summary?.total_students ?? 0).toLocaleString()} color="text-violet-400" bg="bg-violet-500/10" />
        <StatCard icon={ClipboardList} label="Quizzes Created" value={isLoading ? "…" : (summary?.quizzes_count ?? 0).toLocaleString()} color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard icon={FileText} label="Assignments Created" value={isLoading ? "…" : (summary?.assignments_count ?? 0).toLocaleString()} color="text-emerald-400" bg="bg-emerald-500/10" />
        <ComingSoonStatCard icon={CreditCard} label={t("biz.monthlyRevenue")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="border bg-card p-5 lg:col-span-1">
          <h3 className="font-semibold">{t("team.quickActions")}</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors hover:bg-accent"
              >
                <action.icon className="h-3.5 w-3.5 text-primary" />
                {action.label}
              </Link>
            ))}
          </div>
        </Card>

        {/* Pending Grading Queue — real data from GET /api/teacher-dashboard/pending-tasks */}
        <Card className="border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t("teacher.essayGradingQueue")}</h3>
            <Badge variant="outline" className="rounded-full">{pendingTasks.length} {t("assess.pending")}</Badge>
          </div>
          <div className="mt-4 space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-3">Loading…</p>
            ) : pendingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-3">Nothing pending grading right now.</p>
            ) : (
              pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-xl border px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Student {task.student_id.slice(0, 8)} · Max {task.max_score} pts
                      {task.created_at ? ` · ${new Date(task.created_at).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <Badge variant="default" className="shrink-0 rounded-full text-xs">{task.task_type}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity — real data from GET /api/teacher-dashboard/recent-activity (quizzes + assignments).
          There is no payments/wallets backend yet, so this intentionally shows real content activity,
          not fabricated sales figures. */}
      <Card className="border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{t("teacher.recentSales") /* label kept; content is real recent activity, see comment above */}</h3>
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link to="/teacher/content-studio">{t("common.viewAll")} <ArrowRight className="ms-1 h-3.5 w-3.5 rtl:rotate-180" /></Link>
          </Button>
        </div>
        <div className="mt-4 overflow-x-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-3">Loading…</p>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3">No recent quizzes or assignments yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="pb-2 text-start font-medium">Type</th>
                  <th className="pb-2 text-start font-medium">{t("teacher.item")}</th>
                  <th className="pb-2 text-end font-medium">Details</th>
                  <th className="pb-2 text-end font-medium">{t("teacher.date")}</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-2.5">
                      <Badge variant="outline" className="rounded-full text-[10px]">{item.kind}</Badge>
                    </td>
                    <td className="py-2.5 font-medium">{item.title}</td>
                    <td className="py-2.5 text-end text-muted-foreground">
                      {item.kind === "QUIZ"
                        ? `${item.metadata.duration_minutes ?? "—"} min · Pass ${item.metadata.passing_score ?? "—"}%`
                        : `${item.metadata.max_points ?? "—"} pts`}
                    </td>
                    <td className="py-2.5 text-end text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Bottom Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniCard icon={BookOpen} label={t("teacher.activeCourses")} value={isLoading ? "…" : String(summary?.total_courses ?? 0)} to="/teacher/courses" />
        <MiniCard icon={MessageSquare} label={t("teacher.teamMessages")} value="" to="/teacher/chat" />
        <MiniCard icon={Users} label={t("teacher.activeSessions")} value={isLoading ? "…" : String(summary?.total_sessions ?? 0)} to="/teacher/content-studio" />
      </div>
    </DashPage>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: React.ElementType; label: string; value: string; color: string; bg: string }) {
  return (
    <Card className="border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

function ComingSoonStatCard({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <Card className="border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <Badge variant="outline" className="rounded-full text-[10px]">Coming Soon</Badge>
      </div>
      <p className="mt-3 text-2xl font-bold text-muted-foreground">—</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

function MiniCard({ icon: Icon, label, value, to }: { icon: React.ElementType; label: string; value: string; to: string }) {
  return (
    <Link to={to}>
      <Card className="flex items-center gap-3 border bg-card p-4 transition-colors hover:bg-accent">
        <Icon className="h-5 w-5 text-primary" />
        <div>
          {value && <p className="text-sm font-semibold">{value}</p>}
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </Card>
    </Link>
  );
}
