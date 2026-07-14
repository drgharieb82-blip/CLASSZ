import { createFileRoute } from "@tanstack/react-router";
import {
  Users, GraduationCap, DollarSign, BookOpen, UserPlus, ArrowDownToLine,
  TrendingUp, Building2, Activity, TicketCheck, Clock,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/roles";
import {
  platformStats, dashboardRevenueTrend, academies,
  recentRegistrations, supportTickets, activityTimeline,
} from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/")({
  component: SuperAdminDashboard,
});

/* ── stat card config ── */
const statCards = [
  { key: "sa.totalTeachers", value: platformStats.totalTeachers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "sa.totalStudents", value: platformStats.totalStudents, icon: GraduationCap, color: "text-violet-500", bg: "bg-violet-500/10" },
  { key: "sa.totalRevenue", value: platformStats.totalRevenue, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", prefix: "$", fmt: true },
  { key: "sa.activeCourses", value: platformStats.activeCourses, icon: BookOpen, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { key: "sa.newRegistrations", value: platformStats.newRegistrations, icon: UserPlus, color: "text-amber-500", bg: "bg-amber-500/10" },
  { key: "sa.pendingWithdrawals", value: platformStats.pendingWithdrawals, icon: ArrowDownToLine, color: "text-rose-500", bg: "bg-rose-500/10", prefix: "$", fmt: true },
  { key: "sa.monthlyGrowth", value: platformStats.monthlyGrowth, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10", suffix: "%" },
  { key: "sa.activeAcademies", value: platformStats.activeAcademies, icon: Building2, color: "text-orange-500", bg: "bg-orange-500/10" },
];

function fmtNum(v: number, prefix?: string, suffix?: string, compact?: boolean) {
  let str: string;
  if (compact && v >= 1_000_000) str = `${(v / 1_000_000).toFixed(2)}M`;
  else if (compact && v >= 1_000) str = `${(v / 1_000).toFixed(1)}k`;
  else str = v.toLocaleString();
  return `${prefix ?? ""}${str}${suffix ?? ""}`;
}

const roleBadge: Record<string, { cls: string }> = {
  student: { cls: "bg-violet-500/10 text-violet-600 border-violet-300" },
  teacher: { cls: "bg-blue-500/10 text-blue-600 border-blue-300" },
  parent: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
};

const statusBadge: Record<string, { cls: string }> = {
  active: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
  pending: { cls: "bg-amber-500/10 text-amber-600 border-amber-300" },
  suspended: { cls: "bg-rose-500/10 text-rose-600 border-rose-300" },
};

const ticketStatusBadge: Record<string, { cls: string }> = {
  open: { cls: "bg-amber-500/10 text-amber-600 border-amber-300" },
  "in-progress": { cls: "bg-blue-500/10 text-blue-600 border-blue-300" },
  closed: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
};

const priorityBadge: Record<string, { cls: string }> = {
  low: { cls: "bg-slate-500/10 text-slate-600 border-slate-300" },
  medium: { cls: "bg-amber-500/10 text-amber-600 border-amber-300" },
  high: { cls: "bg-orange-500/10 text-orange-600 border-orange-300" },
  urgent: { cls: "bg-rose-500/10 text-rose-600 border-rose-300" },
};

function SuperAdminDashboard() {
  const { t } = useApp();
  const revenueMax = Math.max(...dashboardRevenueTrend.map((m) => m.revenue));
  const topAcademies = [...academies].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const latestTickets = supportTickets.slice(0, 3);

  return (
    <DashPage role="superadmin" title="sa.dashboard" subtitle="sa.dashboardSubtitle" icon={ROLES.superadmin.icon}>
      {/* ── Stat Cards ── */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.key} className="flex items-center gap-3 border bg-card p-4 transition-shadow hover:shadow-md">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold">{fmtNum(s.value, s.prefix, s.suffix, s.fmt)}</p>
              <p className="truncate text-xs text-muted-foreground">{t(s.key)}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Revenue Trend + Top Academies ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue Bar Chart */}
        <Card className="border bg-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4">{t("sa.revenueTrend")}</h3>
          <div className="flex items-end gap-2 h-48">
            {dashboardRevenueTrend.map((m) => {
              const pct = revenueMax > 0 ? (m.revenue / revenueMax) * 100 : 0;
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-muted-foreground">${(m.revenue / 1000).toFixed(0)}k</span>
                  <div className="w-full flex-1 flex flex-col justify-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-violet-400 transition-all"
                      style={{ height: `${pct}%`, minHeight: "4px" }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.month}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Academies */}
        <Card className="border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("sa.topAcademies")}</h3>
          <div className="space-y-3">
            {topAcademies.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs font-bold">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.teacher}</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600">${a.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Recent Registrations + Latest Support Tickets ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Registrations */}
        <Card className="border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("sa.recentRegistrations")}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-start text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pe-4 text-start font-medium">{t("sa.name")}</th>
                  <th className="py-2 pe-4 text-start font-medium">{t("sa.role")}</th>
                  <th className="py-2 pe-4 text-start font-medium">{t("sa.academy")}</th>
                  <th className="py-2 pe-4 text-start font-medium">{t("sa.date")}</th>
                  <th className="py-2 text-start font-medium">{t("sa.status")}</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                    <td className="py-2.5 pe-4 font-medium">{r.name}</td>
                    <td className="py-2.5 pe-4">
                      <Badge variant="outline" className={cn("text-xs rounded-full capitalize", roleBadge[r.role]?.cls)}>{r.role}</Badge>
                    </td>
                    <td className="py-2.5 pe-4 text-muted-foreground">{r.academy}</td>
                    <td className="py-2.5 pe-4 text-muted-foreground text-xs">{r.date}</td>
                    <td className="py-2.5">
                      <Badge variant="outline" className={cn("text-xs rounded-full capitalize", statusBadge[r.status]?.cls)}>{r.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Latest Support Tickets */}
        <Card className="border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TicketCheck className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">{t("sa.latestTickets")}</h3>
          </div>
          <div className="space-y-3">
            {latestTickets.map((tk) => (
              <div key={tk.id} className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/40">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{tk.id}</span>
                    <Badge variant="outline" className={cn("text-[10px] rounded-full capitalize", priorityBadge[tk.priority]?.cls)}>{tk.priority}</Badge>
                  </div>
                  <p className="text-sm font-medium truncate">{tk.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tk.user} &middot; {tk.category}</p>
                </div>
                <Badge variant="outline" className={cn("text-xs rounded-full capitalize shrink-0", ticketStatusBadge[tk.status]?.cls)}>
                  {tk.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Activity Timeline ── */}
      <Card className="border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{t("sa.activityTimeline")}</h3>
        </div>
        <div className="relative ps-6">
          <div className="absolute start-2.5 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {activityTimeline.map((item) => (
              <div key={item.id} className="relative flex items-start gap-3">
                <span className="absolute start-[-14px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{item.action}</span>
                    <span className="text-xs text-muted-foreground">&middot; {item.user}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </DashPage>
  );
}
