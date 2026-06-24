import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users, UserPlus, TrendingUp, AlertTriangle, BarChart3, CheckCircle2,
  DollarSign, Bell, ArrowRight, Eye, UsersRound, CreditCard, FileBarChart,
  Activity, BookOpen, Clock, Star,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { mockStudents } from "@/lib/students-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/students/")({
  component: StudentsOverview,
});

const stats = [
  { key: "stu.totalStudents", icon: Users, value: "12", color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "stu.activeThisWeek", icon: Activity, value: "9", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "stu.newEnrollments", icon: UserPlus, value: "3", color: "text-violet-400", bg: "bg-violet-500/10" },
  { key: "stu.atRisk", icon: AlertTriangle, value: "3", color: "text-rose-400", bg: "bg-rose-500/10" },
  { key: "stu.avgScore", icon: BarChart3, value: "79%", color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "stu.completionRate", icon: CheckCircle2, value: "72%", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { key: "stu.totalRevenue", icon: DollarSign, value: "$2,380", color: "text-green-400", bg: "bg-green-500/10" },
  { key: "stu.parentAlerts", icon: Bell, value: "2", color: "text-orange-400", bg: "bg-orange-500/10" },
];

const quickActions = [
  { key: "stu.allStudents", icon: Users, to: "/teacher/students/all" },
  { key: "stu.pods", icon: UsersRound, to: "/teacher/students/pods" },
  { key: "stu.payments", icon: CreditCard, to: "/teacher/students/payments" },
  { key: "stu.reports", icon: FileBarChart, to: "/teacher/students/reports" },
];

const recentActivity = [
  { id: 1, student: "Aya Mansour", action: "Completed Session 14", time: "2 hours ago", type: "progress" },
  { id: 2, student: "Karim Adel", action: "Failed Quiz: Derivatives", time: "3 hours ago", type: "risk" },
  { id: 3, student: "Tamer Gamal", action: "Submitted Homework Ch.7", time: "5 hours ago", type: "homework" },
  { id: 4, student: "Ali Shaker", action: "Missed 3rd consecutive session", time: "1 day ago", type: "risk" },
  { id: 5, student: "Lina Fares", action: "Scored 98% on Mid-term", time: "1 day ago", type: "progress" },
];

const activityTypeColors: Record<string, string> = {
  progress: "bg-emerald-500/10 text-emerald-500",
  risk: "bg-rose-500/10 text-rose-500",
  homework: "bg-blue-500/10 text-blue-500",
};

const riskColorMap: Record<string, string> = {
  high: "border-rose-300 text-rose-600 bg-rose-500/10",
  medium: "border-amber-300 text-amber-600 bg-amber-500/10",
  low: "border-blue-300 text-blue-600 bg-blue-500/10",
  none: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
};

function StudentsOverview() {
  const { t } = useApp();
  const topStudents = [...mockStudents].sort((a, b) => b.progress - a.progress).slice(0, 3);
  const atRiskStudents = mockStudents.filter((s) => s.riskLevel !== "none").slice(0, 3);

  return (
    <DashPage
      role="teacher"
      title={t("stu.overview")}
      subtitle="Monitor, filter, and manage your learners at scale"
      icon={ROLES.teacher.icon}
      actions={
        <Link to="/teacher/students/all">
          <Button className="rounded-xl gradient-brand text-white gap-1.5">
            <UserPlus className="h-4 w-4" /> {t("stu.addStudent")}
          </Button>
        </Link>
      }
    >
      {/* Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {stats.map((s) => (
          <Card key={s.key} className="flex items-center gap-3 border bg-card p-4">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="truncate text-xs text-muted-foreground">{t(s.key)}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border bg-card p-5 lg:col-span-1">
          <h3 className="font-semibold">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            {quickActions.map((a) => (
              <Link key={a.key} to={a.to}
                className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
                <a.icon className="h-4 w-4 text-primary" />
                <span className="flex-1">{t(a.key)}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t("stu.recentActivity")}</h3>
          </div>
          <div className="mt-4 space-y-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <Avatar className="mt-0.5 h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {item.student.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.student}</span>
                    <Badge variant="outline" className={cn("rounded-full text-[10px] px-1.5 py-0 border-0", activityTypeColors[item.type])}>
                      {item.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.action}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                    <Clock className="inline h-3 w-3 me-0.5" />{item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Progress + At Risk */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Progress */}
        <Card className="border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t("stu.topProgress")}</h3>
            <Link to="/teacher/students/progress">
              <Button variant="outline" size="sm" className="rounded-xl">
                {t("common.viewAll")} <ArrowRight className="ms-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {topStudents.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  {idx === 0 ? <Star className="h-4 w-4 text-amber-500" /> :
                    <span className="text-sm font-bold text-primary">{idx + 1}</span>}
                </div>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {s.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.grade} &middot; {s.courses[0]}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Progress value={s.progress} className="h-2 w-20" />
                  <span className="text-sm font-bold text-emerald-500">{s.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* At-Risk Preview */}
        <Card className="border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t("stu.atRisk")}</h3>
            <Link to="/teacher/students/at-risk">
              <Button variant="outline" size="sm" className="rounded-xl">
                {t("common.viewAll")} <ArrowRight className="ms-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {atRiskStudents.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-rose-500/20 p-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-rose-500/10 text-rose-500 text-sm">
                    {s.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{s.name}</p>
                    <Badge variant="outline" className={cn("rounded-full text-xs", riskColorMap[s.riskLevel])}>
                      {t(`stu.${s.riskLevel}`)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.riskReasons.map((r) => (
                      <Badge key={r} variant="outline" className="rounded-full text-[10px] px-1.5 py-0 border-rose-200 text-rose-500">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-end shrink-0">
                  <p className="text-sm font-bold text-rose-500">{s.avgScore}%</p>
                  <p className="text-[10px] text-muted-foreground">{s.lastLogin}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashPage>
  );
}
