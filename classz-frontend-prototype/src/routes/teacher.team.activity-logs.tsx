import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, Filter, Users, BookOpen, FileText, CreditCard,
  Settings, GraduationCap, Clock,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { activityLogs, teamMembers } from "@/lib/team-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/team/activity-logs")({
  component: ActivityLogsPage,
});

const actionTypeConfig: Record<string, { icon: typeof Users; color: string; bg: string }> = {
  member: { icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  content: { icon: FileText, color: "text-violet-500", bg: "bg-violet-500/10" },
  assessment: { icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  student: { icon: GraduationCap, color: "text-amber-500", bg: "bg-amber-500/10" },
  payment: { icon: CreditCard, color: "text-pink-500", bg: "bg-pink-500/10" },
  system: { icon: Settings, color: "text-slate-500", bg: "bg-slate-500/10" },
};

function ActivityLogsPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = activityLogs.filter((log) => {
    const matchSearch = log.memberName.toLowerCase().includes(search.toLowerCase()) || log.action.toLowerCase().includes(search.toLowerCase()) || log.details.toLowerCase().includes(search.toLowerCase());
    const matchMember = memberFilter === "all" || log.memberId === memberFilter;
    const matchType = typeFilter === "all" || log.actionType === typeFilter;
    return matchSearch && matchMember && matchType;
  });

  const actionTypes = [...new Set(activityLogs.map((l) => l.actionType))];
  const uniqueMembers = [...new Map(activityLogs.map((l) => [l.memberId, l])).values()];

  return (
    <DashPage role="teacher" title={t("team.activityLogs")} subtitle={`${activityLogs.length} activities`} icon={ROLES.teacher.icon}>
      <Card className="border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={`${t("common.search")}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9 rounded-xl bg-background" />
          </div>
          <Select value={memberFilter} onValueChange={setMemberFilter}>
            <SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder={t("team.filterByMember")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("team.all")}</SelectItem>
              {uniqueMembers.map((m) => (
                <SelectItem key={m.memberId} value={m.memberId}>{m.memberName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] rounded-xl"><SelectValue placeholder={t("team.filterByAction")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("team.all")}</SelectItem>
              {actionTypes.map((type) => (
                <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="divide-y">
          {filtered.map((log, i) => {
            const cfg = actionTypeConfig[log.actionType] || actionTypeConfig.system;
            const Icon = cfg.icon;
            const showDateHeader = i === 0 || log.timestamp.split(" ")[0] !== filtered[i - 1]?.timestamp.split(" ")[0];

            return (
              <div key={log.id}>
                {showDateHeader && (
                  <div className="bg-muted/30 px-4 py-2">
                    <span className="text-xs font-semibold text-muted-foreground">{log.timestamp.split(" ")[0]}</span>
                  </div>
                )}
                <div className="flex items-start gap-4 px-4 py-3.5 transition-colors hover:bg-accent/30">
                  <div className="relative mt-0.5">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {log.memberName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className={cn("absolute -bottom-1 -end-1 grid h-5 w-5 place-items-center rounded-full border-2 border-card", cfg.bg)}>
                      <Icon className={cn("h-3 w-3", cfg.color)} />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{log.memberName}</span>
                      <Badge variant="outline" className={cn("rounded-full text-[10px] px-1.5 py-0 border-0", cfg.bg, cfg.color)}>
                        {log.action}
                      </Badge>
                      {log.course && (
                        <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0">
                          <BookOpen className="me-1 h-2.5 w-2.5" /> {log.course}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{log.details}</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {log.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No activity logs found
            </div>
          )}
        </div>
      </Card>
    </DashPage>
  );
}
