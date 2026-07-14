import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ShieldCheck, ShieldAlert, Search, Eye, CheckCircle2, XCircle,
  AlertTriangle, Monitor, Clock, ArrowUpRight, Globe, ClipboardPaste,
  Filter,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { integrityFlags } from "@/lib/assessment-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/assessment/academic-integrity")({
  component: AcademicIntegrityPage,
});

const severityColors: Record<string, string> = {
  high: "border-rose-300 text-rose-600 bg-rose-500/10",
  medium: "border-amber-300 text-amber-600 bg-amber-500/10",
  low: "border-blue-300 text-blue-600 bg-blue-500/10",
};

const statusColors: Record<string, string> = {
  pending: "border-amber-300 text-amber-600 bg-amber-500/10",
  reviewed: "border-blue-300 text-blue-600 bg-blue-500/10",
  cleared: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
  escalated: "border-rose-300 text-rose-600 bg-rose-500/10",
};

const flagTypeIcons: Record<string, typeof Monitor> = {
  multi_device: Monitor,
  tab_switch: ArrowUpRight,
  time_anomaly: Clock,
  ip_change: Globe,
  copy_paste: ClipboardPaste,
};

const flagTypeLabels: Record<string, string> = {
  multi_device: "Multi Device",
  tab_switch: "Tab Switch",
  time_anomaly: "Time Anomaly",
  ip_change: "IP Change",
  copy_paste: "Copy/Paste",
};

const flagTypeKeys: Record<string, string> = {
  multi_device: "assess.multiDevice",
  tab_switch: "assess.tabSwitch",
  time_anomaly: "assess.timeAnomalies",
  ip_change: "assess.ipChanges",
  copy_paste: "Copy/Paste Detection",
};

function AcademicIntegrityPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const filtered = useMemo(() => {
    let items = [...integrityFlags];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((i) =>
        i.studentName.toLowerCase().includes(q) ||
        i.assessment.toLowerCase().includes(q) ||
        i.course.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all") items = items.filter((i) => i.status === filterStatus);
    if (filterSeverity !== "all") items = items.filter((i) => i.severity === filterSeverity);
    return items;
  }, [search, filterStatus, filterSeverity]);

  const totalFlags = integrityFlags.length;
  const pendingCount = integrityFlags.filter((f) => f.status === "pending").length;
  const clearedCount = integrityFlags.filter((f) => f.status === "cleared").length;
  const escalatedCount = integrityFlags.filter((f) => f.status === "escalated").length;

  return (
    <DashPage role="teacher" title={t("assess.academicIntegrity")} subtitle="Monitor and review academic integrity flags" icon={ROLES.teacher.icon}>
      {/* Summary Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/10">
            <ShieldAlert className="h-5 w-5 text-violet-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{totalFlags}</p>
            <p className="text-xs text-muted-foreground">Total Flags</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10">
            <Clock className="h-5 w-5 text-amber-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{clearedCount}</p>
            <p className="text-xs text-muted-foreground">Cleared</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{escalatedCount}</p>
            <p className="text-xs text-muted-foreground">Escalated</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search student, assessment, course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border bg-background px-3 py-1.5 text-sm"
            >
              <option value="all">Status: {t("assess.all")}</option>
              <option value="pending">{t("assess.pending")}</option>
              <option value="reviewed">Reviewed</option>
              <option value="cleared">Cleared</option>
              <option value="escalated">Escalated</option>
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="rounded-xl border bg-background px-3 py-1.5 text-sm"
            >
              <option value="all">Severity: {t("assess.all")}</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <Badge variant="outline" className="rounded-full text-xs shrink-0">{filtered.length} flags</Badge>
        </div>
      </Card>

      {/* Table */}
      <Card className="border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">{t("assess.student")}</TableHead>
                <TableHead className="font-semibold">{t("assess.course")}</TableHead>
                <TableHead className="font-semibold">{t("assess.assessment")}</TableHead>
                <TableHead className="font-semibold">Flag Type</TableHead>
                <TableHead className="font-semibold">Severity</TableHead>
                <TableHead className="font-semibold">Details</TableHead>
                <TableHead className="font-semibold">Timestamp</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground border border-dashed rounded-xl p-8 mx-4">
                      <ShieldCheck className="h-8 w-8" />
                      <p className="text-sm">No integrity flags found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((flag) => {
                  const FlagIcon = flagTypeIcons[flag.flagType] || AlertTriangle;
                  return (
                    <TableRow key={flag.id} className={cn("hover:bg-accent/50", flag.severity === "high" && flag.status === "pending" && "bg-rose-500/5")}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{flag.studentName}</p>
                          <p className="text-xs text-muted-foreground">{flag.studentId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{flag.course}</TableCell>
                      <TableCell>
                        <p className="text-sm truncate max-w-[160px]">{flag.assessment}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full text-xs gap-1">
                          <FlagIcon className="h-3 w-3" />
                          {flagTypeLabels[flag.flagType]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("rounded-full text-xs", severityColors[flag.severity])}>
                          {flag.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-muted-foreground max-w-[220px] line-clamp-2">{flag.details}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{flag.timestamp}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("rounded-full text-xs", statusColors[flag.status])}>
                          {flag.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="outline" size="sm" className="rounded-lg text-xs h-7 gap-1" title={t("assess.reviewAction")}>
                            <Eye className="h-3 w-3" />
                            {t("assess.reviewAction")}
                          </Button>
                          {flag.status === "pending" && (
                            <>
                              <Button variant="outline" size="sm" className="rounded-lg text-xs h-7 text-emerald-600 border-emerald-300 hover:bg-emerald-500/10" title={t("assess.clearFlag")}>
                                <CheckCircle2 className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="rounded-lg text-xs h-7 text-rose-600 border-rose-300 hover:bg-rose-500/10" title="Escalate">
                                <AlertTriangle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashPage>
  );
}
