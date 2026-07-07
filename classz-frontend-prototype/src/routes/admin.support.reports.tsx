import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Headphones, Search, Bug, AlertTriangle, CreditCard, FileText } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { reports } from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/support/reports")({
  component: ReportsPage,
});

/* ── Tab navigation ── */
const supportTabs = [
  { label: "sup.tickets", to: "/admin/support/tickets" },
  { label: "sup.conversations", to: "/admin/support/conversations" },
  { label: "sup.reports", to: "/admin/support/reports" },
  { label: "sup.faq", to: "/admin/support/faq" },
];

const typeIcon: Record<string, { icon: typeof Bug; cls: string }> = {
  bug: { icon: Bug, cls: "bg-orange-500/10 text-orange-600 border-orange-300" },
  abuse: { icon: AlertTriangle, cls: "bg-rose-500/10 text-rose-600 border-rose-300" },
  payment: { icon: CreditCard, cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
  content: { icon: FileText, cls: "bg-blue-500/10 text-blue-600 border-blue-300" },
};

const statusStyles: Record<string, { cls: string; label: string }> = {
  open: { cls: "bg-amber-500/10 text-amber-600 border-amber-300", label: "Open" },
  investigating: { cls: "bg-blue-500/10 text-blue-600 border-blue-300", label: "Investigating" },
  resolved: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300", label: "Resolved" },
};

const priorityStyles: Record<string, { cls: string }> = {
  low: { cls: "bg-slate-500/10 text-slate-600 border-slate-300" },
  medium: { cls: "bg-amber-500/10 text-amber-600 border-amber-300" },
  high: { cls: "bg-rose-500/10 text-rose-600 border-rose-300" },
};

function ReportsPage() {
  const { t } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = reports.filter((r) => {
    const matchSearch =
      r.reporter.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || r.type === typeFilter;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const openCount = reports.filter((r) => r.status === "open").length;
  const investigatingCount = reports.filter((r) => r.status === "investigating").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  return (
    <DashPage role="superadmin" title="sa.supportCenter" subtitle="sa.supportCenterSubtitle" icon={Headphones}>
      {/* Tab navigation */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {supportTabs.map((tab) => {
          const active = pathname.includes(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(tab.label)}
            </Link>
          );
        })}
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 grid-cols-3">
        <Card className="border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{openCount}</p>
          <p className="text-xs text-muted-foreground">{t("sup.openReports")}</p>
        </Card>
        <Card className="border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{investigatingCount}</p>
          <p className="text-xs text-muted-foreground">{t("sup.investigating")}</p>
        </Card>
        <Card className="border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{resolvedCount}</p>
          <p className="text-xs text-muted-foreground">{t("sup.resolved")}</p>
        </Card>
      </div>

      {/* Filters + Table */}
      <Card className="border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap mb-5">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("sup.searchReports")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("sup.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("sup.allTypes")}</SelectItem>
              <SelectItem value="bug">{t("sup.bug")}</SelectItem>
              <SelectItem value="abuse">{t("sup.abuse")}</SelectItem>
              <SelectItem value="payment">{t("sup.payment")}</SelectItem>
              <SelectItem value="content">{t("sup.content")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("sup.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("sup.allStatuses")}</SelectItem>
              <SelectItem value="open">{t("sup.open")}</SelectItem>
              <SelectItem value="investigating">{t("sup.investigating")}</SelectItem>
              <SelectItem value="resolved">{t("sup.resolved")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase tracking-wider">
                <TableHead className="font-medium">{t("sup.reporter")}</TableHead>
                <TableHead className="font-medium">{t("sup.type")}</TableHead>
                <TableHead className="font-medium">{t("sup.description")}</TableHead>
                <TableHead className="font-medium">{t("sup.priority")}</TableHead>
                <TableHead className="font-medium">{t("sup.status")}</TableHead>
                <TableHead className="font-medium">{t("sup.date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t("sup.noReports")}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => {
                  const ti = typeIcon[r.type];
                  const TypeIcon = ti?.icon ?? Bug;
                  return (
                    <TableRow key={r.id} className="transition-colors hover:bg-accent/40">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold">
                            {r.reporter.charAt(0)}
                          </span>
                          <span className="text-sm font-medium">{r.reporter}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs rounded-full capitalize gap-1", ti?.cls)}>
                          <TypeIcon className="h-3 w-3" />
                          {r.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[260px] truncate">{r.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs rounded-full capitalize", priorityStyles[r.priority]?.cls)}>
                          {r.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs rounded-full capitalize", statusStyles[r.status]?.cls)}>
                          {statusStyles[r.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.createdAt}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
          <span>{t("sa.showing")} {filtered.length} {t("sa.of")} {reports.length}</span>
        </div>
      </Card>
    </DashPage>
  );
}
