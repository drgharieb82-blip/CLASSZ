import { createFileRoute } from "@tanstack/react-router";
import {
  DollarSign, Wallet, TrendingUp, CreditCard, ArrowDownToLine, RotateCcw,
  PiggyBank, ReceiptText, Landmark, Eye,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import {
  platformFinanceStats, revenueTrend, platformFeeDistribution,
  topEarningTeachers, platformWithdrawals, financialAuditLogs,
} from "@/lib/platform-finance-mock-data";

export const Route = createFileRoute("/admin/finance/")({
  component: PlatformFinanceOverview,
});

const statCards = [
  { key: "pf.gmv", value: platformFinanceStats.gmv, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", prefix: "$" },
  { key: "pf.platformRevenueCard", value: platformFinanceStats.platformRevenue, icon: Landmark, color: "text-blue-500", bg: "bg-blue-500/10", prefix: "$" },
  { key: "pf.pendingWithdrawals", value: platformFinanceStats.pendingWithdrawals, icon: ArrowDownToLine, color: "text-amber-500", bg: "bg-amber-500/10", prefix: "$" },
  { key: "pf.monthlyGrowth", value: platformFinanceStats.monthlyGrowth, icon: TrendingUp, color: "text-cyan-500", bg: "bg-cyan-500/10", suffix: "%" },
  { key: "pf.activeSubscriptions", value: platformFinanceStats.activeSubscriptions, icon: CreditCard, color: "text-violet-500", bg: "bg-violet-500/10" },
  { key: "pf.refunds", value: platformFinanceStats.refunds, icon: RotateCcw, color: "text-rose-500", bg: "bg-rose-500/10", prefix: "$" },
  { key: "pf.expenses2", value: platformFinanceStats.expenses, icon: ReceiptText, color: "text-orange-500", bg: "bg-orange-500/10", prefix: "$" },
  { key: "pf.netProfit", value: platformFinanceStats.netProfit, icon: PiggyBank, color: "text-green-500", bg: "bg-green-500/10", prefix: "$" },
];

function formatVal(v: number, prefix?: string, suffix?: string) {
  const formatted = v >= 1000 ? v.toLocaleString() : String(v);
  return `${prefix ?? ""}${formatted}${suffix ?? ""}`;
}

function PlatformFinanceOverview() {
  const { t } = useApp();
  const revenueMax = Math.max(...revenueTrend.map((m) => m.gmv));
  const pendingWd = platformWithdrawals.filter((w) => w.status === "pending" || w.status === "approved");
  const recentLogs = financialAuditLogs.slice(0, 5);

  return (
    <DashPage role="superadmin" title="pf.overview" subtitle="pf.overviewSubtitle" icon={Eye}>
      {/* Stat cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.key} className="flex items-center gap-3 border bg-card p-4">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold">{formatVal(s.value, s.prefix, s.suffix)}</p>
              <p className="truncate text-xs text-muted-foreground">{t(s.key)}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue trend chart */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border bg-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4">{t("pf.revenueTrend")}</h3>
          <div className="flex items-end gap-2 h-48">
            {revenueTrend.map((m) => {
              const pct = revenueMax > 0 ? (m.gmv / revenueMax) * 100 : 0;
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-muted-foreground">${(m.gmv / 1000).toFixed(0)}k</span>
                  <div className="w-full flex-1 flex flex-col justify-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all"
                      style={{ height: `${pct}%`, minHeight: "4px" }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.month}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Platform fee distribution */}
        <Card className="border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("pf.platformFeeDistribution")}</h3>
          <div className="flex h-5 w-full overflow-hidden rounded-xl mb-4">
            {platformFeeDistribution.map((d) => (
              <div key={d.source} className={cn("h-full", d.color)} style={{ width: `${d.pct}%` }} title={`${d.source}: ${d.pct}%`} />
            ))}
          </div>
          <div className="space-y-2">
            {platformFeeDistribution.map((d) => (
              <div key={d.source} className="flex items-center gap-2 text-sm">
                <span className={cn("inline-block h-3 w-3 rounded-full", d.color)} />
                <span className="text-muted-foreground flex-1">{d.source}</span>
                <span className="font-semibold">{d.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top earning teachers */}
      <Card className="border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">{t("pf.topEarningTeachers")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-start text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 pe-4 text-start font-medium">{t("pf.teacher")}</th>
                <th className="py-2.5 pe-4 text-start font-medium">{t("pf.academy")}</th>
                <th className="py-2.5 pe-4 text-start font-medium">{t("pf.revenue")}</th>
                <th className="py-2.5 pe-4 text-start font-medium">{t("pf.fee")}</th>
              </tr>
            </thead>
            <tbody>
              {topEarningTeachers.map((row) => (
                <tr key={row.name} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                  <td className="py-3 pe-4 font-medium">{row.name}</td>
                  <td className="py-3 pe-4 text-muted-foreground">{row.academy}</td>
                  <td className="py-3 pe-4 font-semibold text-emerald-600">${row.revenue.toLocaleString()}</td>
                  <td className="py-3 pe-4 text-muted-foreground">${row.fee.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom grid: Pending Withdrawals + Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("pf.pendingWithdrawalPreview")}</h3>
          <div className="space-y-3">
            {pendingWd.length === 0 && <p className="text-sm text-muted-foreground">{t("pf.noResults")}</p>}
            {pendingWd.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{w.teacher}</p>
                  <p className="text-xs text-muted-foreground">{w.academy} &middot; {w.requestedAt}</p>
                </div>
                <div className="text-end shrink-0">
                  <p className="text-sm font-bold">${w.amount.toLocaleString()}</p>
                  <Badge variant="outline" className={cn(
                    "text-xs rounded-full",
                    w.status === "pending" ? "bg-amber-500/10 text-amber-600 border-amber-300" : "bg-blue-500/10 text-blue-600 border-blue-300",
                  )}>{t(`pf.${w.status}`)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("pf.recentFinancialActivity")}</h3>
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 rounded-lg border p-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Wallet className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{log.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{log.date}</p>
                </div>
                {log.amount > 0 && <span className="text-sm font-semibold shrink-0">${log.amount.toLocaleString()}</span>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashPage>
  );
}
