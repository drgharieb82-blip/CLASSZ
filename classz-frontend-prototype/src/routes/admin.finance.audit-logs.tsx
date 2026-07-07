import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileClock, Search, ArrowDownToLine, RotateCcw, FileText, RefreshCw,
  SlidersHorizontal, ReceiptText, Scale,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { financialAuditLogs, type FinancialAuditLog } from "@/lib/platform-finance-mock-data";

export const Route = createFileRoute("/admin/finance/audit-logs")({
  component: FinancialAuditLogsPage,
});

const typeIcon: Record<string, typeof ArrowDownToLine> = {
  withdrawal: ArrowDownToLine,
  refund: RotateCcw,
  invoice: FileText,
  subscription: RefreshCw,
  adjustment: SlidersHorizontal,
  expense: ReceiptText,
  tax: Scale,
};

const typeColor: Record<string, string> = {
  withdrawal: "bg-amber-500/10 text-amber-600 border-amber-300",
  refund: "bg-rose-500/10 text-rose-600 border-rose-300",
  invoice: "bg-blue-500/10 text-blue-600 border-blue-300",
  subscription: "bg-violet-500/10 text-violet-600 border-violet-300",
  adjustment: "bg-cyan-500/10 text-cyan-600 border-cyan-300",
  expense: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  tax: "bg-orange-500/10 text-orange-600 border-orange-300",
};

function FinancialAuditLogsPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [adminFilter, setAdminFilter] = useState("all");

  const admins = [...new Set(financialAuditLogs.map((l) => l.admin))];

  const filtered = financialAuditLogs.filter((log) => {
    const matchSearch = !search ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.teacher.toLowerCase().includes(search.toLowerCase()) ||
      log.academy.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || log.actionType === typeFilter;
    const matchAdmin = adminFilter === "all" || log.admin === adminFilter;
    return matchSearch && matchType && matchAdmin;
  });

  return (
    <DashPage role="superadmin" title="pf.financialAuditLogs" subtitle="pf.financialAuditLogsSubtitle" icon={FileClock}>
      {/* Filters */}
      <Card className="border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("pf.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9 rounded-xl bg-background" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] rounded-xl"><SelectValue placeholder={t("pf.actionType")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("pf.all")}</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="tax">Tax</SelectItem>
            </SelectContent>
          </Select>
          <Select value={adminFilter} onValueChange={setAdminFilter}>
            <SelectTrigger className="w-[150px] rounded-xl"><SelectValue placeholder={t("pf.admin")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("pf.all")}</SelectItem>
              {admins.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Timeline */}
      <div className="space-y-3">
        {filtered.map((log) => {
          const Icon = typeIcon[log.actionType] ?? FileClock;
          return (
            <Card key={log.id} className="border bg-card p-4">
              <div className="flex items-start gap-4">
                <span className={cn("mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl", typeColor[log.actionType] ?? "bg-slate-500/10 text-slate-500")}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{log.action}</p>
                    <Badge variant="outline" className={cn("rounded-full text-xs capitalize", typeColor[log.actionType])}>{log.actionType}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{log.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <span>{t("pf.admin")}: <strong>{log.admin}</strong></span>
                    {log.teacher !== "-" && <span>{t("pf.teacher")}: <strong>{log.teacher}</strong></span>}
                    {log.academy !== "-" && <span>{t("pf.academy")}: <strong>{log.academy}</strong></span>}
                    <span>{log.date}</span>
                  </div>
                </div>
                {log.amount > 0 && <span className="text-sm font-bold shrink-0">${log.amount.toLocaleString()}</span>}
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="border bg-card p-8 text-center text-sm text-muted-foreground">{t("pf.noResults")}</Card>
        )}
      </div>
    </DashPage>
  );
}
