import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ScrollText, Search, UserX, UserCog, Settings, UserPlus,
  Sparkles, ShieldAlert, Database, Lock, Activity,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { systemAuditLogs } from "@/lib/admin-mock-data";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/admin/audit-logs")({
  component: AuditLogsPage,
});

const actionMeta: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  "User Suspended": { icon: UserX, color: "text-rose-500", bg: "bg-rose-500/10" },
  "Role Changed": { icon: UserCog, color: "text-blue-500", bg: "bg-blue-500/10" },
  "Settings Updated": { icon: Settings, color: "text-amber-500", bg: "bg-amber-500/10" },
  "User Created": { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  "Feature Toggle": { icon: Sparkles, color: "text-violet-500", bg: "bg-violet-500/10" },
  "Security Alert": { icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
  "Backup Created": { icon: Database, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  "Password Reset": { icon: Lock, color: "text-orange-500", bg: "bg-orange-500/10" },
};

const allAdmins = [...new Set(systemAuditLogs.map((l) => l.admin))];

function AuditLogsPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [adminFilter, setAdminFilter] = useState("all");

  const filtered = systemAuditLogs.filter((log) => {
    const matchSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchAdmin = adminFilter === "all" || log.admin === adminFilter;
    return matchSearch && matchAdmin;
  });

  return (
    <DashPage role="superadmin" title="sa.auditLogs" subtitle="sa.auditLogsSubtitle" icon={ScrollText}>
      {/* Summary */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="border bg-card p-4">
          <p className="text-2xl font-bold">{systemAuditLogs.length}</p>
          <p className="text-xs text-muted-foreground">{t("aud.totalLogs")}</p>
        </Card>
        <Card className="border bg-card p-4">
          <p className="text-2xl font-bold">{allAdmins.length}</p>
          <p className="text-xs text-muted-foreground">{t("aud.adminsInvolved")}</p>
        </Card>
        <Card className="border bg-card p-4">
          <p className="text-2xl font-bold text-rose-600">
            {systemAuditLogs.filter((l) => l.action === "Security Alert").length}
          </p>
          <p className="text-xs text-muted-foreground">{t("aud.securityAlerts")}</p>
        </Card>
        <Card className="border bg-card p-4">
          <p className="text-2xl font-bold text-emerald-600">
            {systemAuditLogs.filter((l) => l.admin === "System").length}
          </p>
          <p className="text-xs text-muted-foreground">{t("aud.systemEvents")}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("aud.searchLogs")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={adminFilter} onValueChange={setAdminFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("aud.allAdmins")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("aud.allAdmins")}</SelectItem>
            {allAdmins.map((admin) => (
              <SelectItem key={admin} value={admin}>{admin}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <Card className="border bg-card p-8 text-center">
          <Activity className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{t("aud.noLogs")}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((log) => {
            const meta = actionMeta[log.action] ?? { icon: Activity, color: "text-muted-foreground", bg: "bg-muted" };
            const LogIcon = meta.icon;
            return (
              <Card key={log.id} className="border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", meta.bg)}>
                    <LogIcon className={cn("h-5 w-5", meta.color)} />
                  </span>
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold">{log.action}</span>
                      <Badge variant="outline" className="text-[10px] rounded-full bg-muted">
                        {log.admin}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      <span className="font-medium text-foreground">{t("aud.target")}:</span> {log.target}
                    </p>
                    <p className="text-xs text-muted-foreground">{log.details}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span>{log.date}</span>
                      <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
                      <span>IP: {log.ip}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-muted-foreground text-center">
        {t("sa.showing")} {filtered.length} {t("sa.of")} {systemAuditLogs.length} {t("aud.entries")}
      </div>
    </DashPage>
  );
}
