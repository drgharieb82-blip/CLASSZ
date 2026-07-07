import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users, Clock, Mail, ListChecks, AlertTriangle,
  ChevronRight, GraduationCap, BarChart3,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import {
  atStats, pods, gradingQueue, atMessages, followUpItems,
} from "@/lib/assistant-teacher-mock-data";

export const Route = createFileRoute("/assistant-teacher/")({ component: ATDashboard });

const statCards = [
  { key: "assigned", label: "at.assignedStudents", value: atStats.assignedStudents, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { key: "grading", label: "at.pendingGrading", value: atStats.pendingGrading, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { key: "messages", label: "at.unreadMessages", value: atStats.unreadMessages, icon: Mail, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { key: "tasks", label: "at.tasksDue", value: atStats.tasksDue, icon: ListChecks, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { key: "risk", label: "at.atRiskStudents", value: atStats.atRiskStudents, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
];

const severityColors: Record<string, string> = {
  low: "border-blue-400/40 text-blue-400 bg-blue-500/10",
  medium: "border-amber-400/40 text-amber-400 bg-amber-500/10",
  high: "border-rose-400/40 text-rose-400 bg-rose-500/10",
};

const priorityColors: Record<string, string> = {
  low: "border-slate-400/40 text-slate-400 bg-slate-500/10",
  medium: "border-amber-400/40 text-amber-400 bg-amber-500/10",
  high: "border-rose-400/40 text-rose-400 bg-rose-500/10",
};

const roleColors: Record<string, string> = {
  student: "border-blue-400/40 text-blue-400 bg-blue-500/10",
  parent: "border-emerald-400/40 text-emerald-400 bg-emerald-500/10",
  teacher: "border-violet-400/40 text-violet-400 bg-violet-500/10",
};

function ATDashboard() {
  const { t } = useApp();

  const topGrading = gradingQueue.filter((g) => g.status === "pending").slice(0, 3);
  const unreadMessages = atMessages.filter((m) => m.unread);
  const highAlerts = followUpItems.filter((f) => f.severity === "high" || f.severity === "medium");

  return (
    <DashPage role="assistant_teacher" title="at.dashboard" subtitle="at.dashboardSubtitle" icon={ROLES.assistant_teacher.icon}>
      {/* Stat cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((s) => (
          <Card key={s.key} className={cn("flex items-center gap-3 border p-4", s.border, "bg-card")}>
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-none">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground truncate">{t(s.label)}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Pod overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("at.podOverview")}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {pods.map((pod) => (
            <Card key={pod.name} className="border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{pod.name}</h3>
                <Badge variant="outline" className="rounded-full text-xs border-teal-400/40 text-teal-400 bg-teal-500/10">
                  <Users className="h-3 w-3 me-1" />{pod.students}
                </Badge>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t("at.avgCompletion")}</span>
                  <span className="font-semibold">{pod.avgCompletion}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${pod.avgCompletion}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("at.atRisk")}</span>
                <Badge variant="outline" className={cn("rounded-full text-xs", pod.atRisk > 2 ? "border-rose-400/40 text-rose-400 bg-rose-500/10" : "border-amber-400/40 text-amber-400 bg-amber-500/10")}>
                  {pod.atRisk}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom grid: Grading Queue + Messages + Follow-up */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Grading Queue Preview */}
        <Card className="border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{t("at.gradingQueue")}</h3>
            <Badge variant="outline" className="rounded-full text-xs border-amber-400/40 text-amber-400 bg-amber-500/10">
              {atStats.pendingGrading} {t("at.pending")}
            </Badge>
          </div>
          <div className="space-y-2">
            {topGrading.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.student}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.assessment}</p>
                </div>
                <Badge variant="outline" className={cn("rounded-full text-xs shrink-0 ms-2", priorityColors[item.priority])}>
                  {item.priority}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
            {t("at.viewAll")} <ChevronRight className="h-3.5 w-3.5 ms-1" />
          </Button>
        </Card>

        {/* Unread Messages Preview */}
        <Card className="border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{t("at.messages")}</h3>
            <Badge variant="outline" className="rounded-full text-xs border-violet-400/40 text-violet-400 bg-violet-500/10">
              {unreadMessages.length} {t("at.unread")}
            </Badge>
          </div>
          <div className="space-y-2">
            {unreadMessages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-2.5">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{msg.from}</p>
                    <Badge variant="outline" className={cn("rounded-full text-[10px] px-1.5 py-0", roleColors[msg.role])}>
                      {msg.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.preview}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{msg.time}</span>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
            {t("at.viewAll")} <ChevronRight className="h-3.5 w-3.5 ms-1" />
          </Button>
        </Card>

        {/* Follow-up Alerts */}
        <Card className="border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{t("at.followUpAlerts")}</h3>
            <Badge variant="outline" className="rounded-full text-xs border-rose-400/40 text-rose-400 bg-rose-500/10">
              {highAlerts.length} {t("at.alerts")}
            </Badge>
          </div>
          <div className="space-y-2">
            {highAlerts.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-2.5">
                <AlertTriangle className={cn("h-4 w-4 mt-0.5 shrink-0", item.severity === "high" ? "text-rose-500" : "text-amber-500")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.student}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{item.reason}</p>
                </div>
                <Badge variant="outline" className={cn("rounded-full text-xs shrink-0", severityColors[item.severity])}>
                  {item.severity}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
            {t("at.viewAll")} <ChevronRight className="h-3.5 w-3.5 ms-1" />
          </Button>
        </Card>
      </div>
    </DashPage>
  );
}
