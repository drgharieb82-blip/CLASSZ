import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users, UserCheck, BookOpen, DollarSign, HeadphonesIcon, Mail,
  Clock, Plus, Briefcase, FileCheck, UserPlus, ArrowRight,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { teamMembers, activityLogs } from "@/lib/team-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/team/")({
  component: TeamOverview,
});

const stats = [
  { key: "team.totalMembers", icon: Users, value: "8", color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "team.teachers", icon: UserCheck, value: "1", color: "text-violet-400", bg: "bg-violet-500/10" },
  { key: "team.assistantTeachers", icon: UserCheck, value: "3", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "team.contentManagers", icon: BookOpen, value: "2", color: "text-pink-400", bg: "bg-pink-500/10" },
  { key: "team.finance", icon: DollarSign, value: "1", color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "team.support", icon: HeadphonesIcon, value: "1", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { key: "team.pendingInvitations", icon: Mail, value: "3", color: "text-orange-400", bg: "bg-orange-500/10" },
];

const quickActions = [
  { key: "team.addMember", icon: UserPlus, to: "/teacher/team/members" },
  { key: "team.publishRecruitment", icon: Briefcase, to: "/teacher/team/recruitment" },
  { key: "team.reviewApplications", icon: FileCheck, to: "/teacher/team/applications" },
  { key: "team.assignStudents", icon: Users, to: "/teacher/team/student-pods" },
];

const actionTypeColors: Record<string, string> = {
  member: "bg-blue-500/10 text-blue-500",
  content: "bg-violet-500/10 text-violet-500",
  assessment: "bg-emerald-500/10 text-emerald-500",
  student: "bg-amber-500/10 text-amber-500",
  payment: "bg-pink-500/10 text-pink-500",
  system: "bg-slate-500/10 text-slate-500",
};

function TeamOverview() {
  const { t } = useApp();
  const recentLogs = activityLogs.slice(0, 6);

  return (
    <DashPage role="teacher" title={t("team.overview")} subtitle={t("team.subtitle")} icon={ROLES.teacher.icon}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border bg-card p-5 lg:col-span-1">
          <h3 className="font-semibold">{t("team.quickActions")}</h3>
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
            <h3 className="font-semibold">{t("team.recentActivity")}</h3>
            <Link to="/teacher/team/activity-logs" className="text-xs text-primary hover:underline">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <Avatar className="mt-0.5 h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {log.memberName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{log.memberName}</span>
                    <Badge variant="outline" className={cn("rounded-full text-[10px] px-1.5 py-0 border-0", actionTypeColors[log.actionType])}>
                      {log.action}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{log.details}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/70">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{t("team.members")}</h3>
          <Link to="/teacher/team/members">
            <Button variant="outline" size="sm" className="rounded-xl">
              {t("common.viewAll")} <ArrowRight className="ms-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {teamMembers.slice(0, 4).map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-xl border p-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                  {m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{m.name}</p>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0">{m.roles[0]}</Badge>
                  <span className={cn("h-2 w-2 rounded-full", m.online ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashPage>
  );
}
