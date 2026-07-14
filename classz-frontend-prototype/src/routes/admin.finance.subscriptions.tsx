import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, Search, TrendingUp, TrendingDown, CreditCard, Users, ArrowUp, ArrowDown } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { platformSubscriptions, subscriptionMetrics } from "@/lib/platform-finance-mock-data";

export const Route = createFileRoute("/admin/finance/subscriptions")({
  component: SubscriptionsPage,
});

const statusColor: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  expired: "bg-slate-500/10 text-slate-600 border-slate-300",
  cancelled: "bg-red-500/10 text-red-600 border-red-300",
  trial: "bg-blue-500/10 text-blue-600 border-blue-300",
};

const payColor: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  overdue: "bg-red-500/10 text-red-600 border-red-300",
  pending: "bg-amber-500/10 text-amber-600 border-amber-300",
};

const planColor: Record<string, string> = {
  Free: "bg-slate-500/10 text-slate-600 border-slate-300",
  Pro: "bg-blue-500/10 text-blue-600 border-blue-300",
  Premium: "bg-violet-500/10 text-violet-600 border-violet-300",
  Enterprise: "bg-amber-500/10 text-amber-600 border-amber-300",
};

const metricCards = [
  { key: "pf.activeSubscriptions", value: subscriptionMetrics.active, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "pf.expired", value: subscriptionMetrics.expired, icon: RefreshCw, color: "text-slate-500", bg: "bg-slate-500/10" },
  { key: "pf.churn", value: subscriptionMetrics.churn, icon: TrendingDown, color: "text-rose-500", bg: "bg-rose-500/10", suffix: "%" },
  { key: "pf.mrr", value: subscriptionMetrics.mrr, icon: CreditCard, color: "text-blue-500", bg: "bg-blue-500/10", prefix: "$" },
  { key: "pf.arr", value: subscriptionMetrics.arr, icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10", prefix: "$" },
  { key: "pf.upgrades", value: subscriptionMetrics.upgrades, icon: ArrowUp, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { key: "pf.downgrades", value: subscriptionMetrics.downgrades, icon: ArrowDown, color: "text-amber-500", bg: "bg-amber-500/10" },
];

function SubscriptionsPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = platformSubscriptions.filter((s) => {
    const matchSearch = !search || s.teacher.toLowerCase().includes(search.toLowerCase()) || s.academy.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "all" || s.plan === planFilter;
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  return (
    <DashPage role="superadmin" title="pf.subscriptions" subtitle="pf.subscriptionsSubtitle" icon={RefreshCw}>
      {/* Metric cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {metricCards.map((m) => (
          <Card key={m.key} className="flex items-center gap-3 border bg-card p-4">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", m.bg)}>
              <m.icon className={cn("h-5 w-5", m.color)} />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold">{m.prefix ?? ""}{m.value.toLocaleString()}{m.suffix ?? ""}</p>
              <p className="truncate text-xs text-muted-foreground">{t(m.key)}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("pf.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9 rounded-xl bg-background" />
          </div>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[140px] rounded-xl"><SelectValue placeholder={t("pf.plan")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("pf.all")}</SelectItem>
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="Pro">Pro</SelectItem>
              <SelectItem value="Premium">Premium</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] rounded-xl"><SelectValue placeholder={t("pf.status")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("pf.all")}</SelectItem>
              <SelectItem value="active">{t("pf.active")}</SelectItem>
              <SelectItem value="expired">{t("pf.expired")}</SelectItem>
              <SelectItem value="cancelled">{t("pf.cancelled")}</SelectItem>
              <SelectItem value="trial">{t("pf.trial")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">{t("pf.teacher")}</TableHead>
                <TableHead className="min-w-[150px]">{t("pf.academy")}</TableHead>
                <TableHead>{t("pf.plan")}</TableHead>
                <TableHead>{t("pf.monthlyFee")}</TableHead>
                <TableHead>{t("pf.status")}</TableHead>
                <TableHead>{t("pf.renewalDate")}</TableHead>
                <TableHead>{t("pf.paymentStatus")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className="hover:bg-accent/50">
                  <TableCell className="font-medium">{s.teacher}</TableCell>
                  <TableCell className="text-muted-foreground">{s.academy}</TableCell>
                  <TableCell><Badge variant="outline" className={cn("rounded-full text-xs", planColor[s.plan])}>{s.plan}</Badge></TableCell>
                  <TableCell className="font-semibold">{s.monthlyFee > 0 ? `$${s.monthlyFee}` : "Free"}</TableCell>
                  <TableCell><Badge variant="outline" className={cn("rounded-full text-xs", statusColor[s.status])}>{t(`pf.${s.status}`)}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.renewalDate}</TableCell>
                  <TableCell><Badge variant="outline" className={cn("rounded-full text-xs", payColor[s.paymentStatus])}>{t(`pf.${s.paymentStatus}`)}</Badge></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">{t("pf.noResults")}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashPage>
  );
}
