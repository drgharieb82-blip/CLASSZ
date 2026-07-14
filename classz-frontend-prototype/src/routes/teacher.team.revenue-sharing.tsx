import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  DollarSign, TrendingUp, CheckCircle2, Clock, Search,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { revenueEntries } from "@/lib/team-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/team/revenue-sharing")({
  component: RevenueSharingPage,
});

const compTypeLabels: Record<string, { key: string; color: string }> = {
  fixed: { key: "team.fixedSalary", color: "bg-blue-500/10 text-blue-600" },
  percentage: { key: "team.percentageShare", color: "bg-violet-500/10 text-violet-600" },
  "per-task": { key: "team.perTask", color: "bg-amber-500/10 text-amber-600" },
  "per-graded": { key: "team.perGraded", color: "bg-emerald-500/10 text-emerald-600" },
};

function RevenueSharingPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");

  const totalEarned = revenueEntries.reduce((s, e) => s + e.totalEarned, 0);
  const totalPaid = revenueEntries.reduce((s, e) => s + e.paid, 0);
  const totalPending = revenueEntries.reduce((s, e) => s + e.pending, 0);

  const filtered = revenueEntries.filter(
    (e) => e.memberName.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashPage role="teacher" title={t("team.revenueSharing")} subtitle={`${revenueEntries.length} members`} icon={ROLES.teacher.icon}>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10">
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">EGP {totalEarned.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t("team.totalEarned")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">EGP {totalPaid.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t("team.paid")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10">
            <Clock className="h-5 w-5 text-amber-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">EGP {totalPending.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t("team.pending")}</p>
          </div>
        </Card>
      </div>

      <Card className="border bg-card">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={`${t("common.search")}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9 rounded-xl bg-background" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">{t("team.members")}</TableHead>
                <TableHead>{t("team.role")}</TableHead>
                <TableHead>{t("team.compensationType")}</TableHead>
                <TableHead>{t("team.amount")}</TableHead>
                <TableHead>{t("team.totalEarned")}</TableHead>
                <TableHead>{t("team.paid")}</TableHead>
                <TableHead>{t("team.pending")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => {
                const cfg = compTypeLabels[entry.compensationType];
                const paidPercent = entry.totalEarned > 0 ? Math.round((entry.paid / entry.totalEarned) * 100) : 0;
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {entry.memberName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{entry.memberName}</p>
                          <p className="text-xs text-muted-foreground">{entry.memberId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full text-xs">{entry.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-full border-0 text-xs", cfg.color)}>{t(cfg.key)}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-sm">
                        {entry.compensationType === "percentage" ? `${entry.amount}%` : `EGP ${entry.amount.toLocaleString()}`}
                        {entry.compensationType === "per-task" && "/task"}
                        {entry.compensationType === "per-graded" && "/graded"}
                        {entry.compensationType === "fixed" && "/mo"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span className="text-sm font-medium">EGP {entry.totalEarned.toLocaleString()}</span>
                        <Progress value={paidPercent} className="h-1 w-20" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-emerald-600 font-medium">EGP {entry.paid.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-sm font-medium", entry.pending > 0 ? "text-amber-600" : "text-muted-foreground")}>
                        EGP {entry.pending.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashPage>
  );
}
