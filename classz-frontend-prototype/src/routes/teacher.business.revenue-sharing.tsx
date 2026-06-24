import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  PieChart, DollarSign, CheckCircle, Clock, Search,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { revenueShares } from "@/lib/business-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/business/revenue-sharing")({
  component: RevenueSharesPage,
});

const shareTypeConfig: Record<string, { label: string; color: string }> = {
  percentage: { label: "Percentage", color: "bg-blue-500/10 text-blue-600 border-blue-300" },
  fixed: { label: "Fixed", color: "bg-violet-500/10 text-violet-600 border-violet-300" },
};

function RevenueSharesPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");

  const totalShared = revenueShares.reduce((s, r) => s + r.earned, 0);
  const totalPaid = revenueShares.reduce((s, r) => s + r.paid, 0);
  const totalPending = revenueShares.reduce((s, r) => s + r.pending, 0);

  const filtered = revenueShares.filter(
    (r) => r.memberName.toLowerCase().includes(search.toLowerCase()) || r.role.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashPage role="teacher" title={t("biz.revenueSharing")} subtitle="Shared revenue breakdown" icon={ROLES.teacher.icon}>
      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10">
            <PieChart className="h-5 w-5 text-blue-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">${totalShared.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Shared</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">${totalPaid.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Paid</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10">
            <Clock className="h-5 w-5 text-amber-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">${totalPending.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="border bg-card">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9 rounded-xl bg-background" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Share Type</TableHead>
                <TableHead>Share Value</TableHead>
                <TableHead>Earned</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead className="min-w-[160px]">Pending</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => {
                const cfg = shareTypeConfig[row.shareType];
                const paidPct = row.earned > 0 ? Math.round((row.paid / row.earned) * 100) : 0;
                return (
                  <TableRow key={row.id} className="hover:bg-accent/50">
                    <TableCell>
                      <span className="font-medium text-sm">{row.memberName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full text-xs">{row.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full border text-xs", cfg.color)}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-sm">
                        {row.shareType === "percentage" ? `${row.shareValue}%` : `$${row.shareValue.toLocaleString()}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">${row.earned.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-emerald-600">${row.paid.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={cn("text-sm font-medium", row.pending > 0 ? "text-amber-600" : "text-muted-foreground")}>
                            ${row.pending.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{paidPct}%</span>
                        </div>
                        <Progress value={paidPct} className="h-1.5" />
                      </div>
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
