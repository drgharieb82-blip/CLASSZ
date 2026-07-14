import { createFileRoute } from "@tanstack/react-router";
import {
  DollarSign, Wallet, TrendingUp, CreditCard, ArrowDownToLine, RotateCcw, PiggyBank,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { revenueStats } from "@/lib/business-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/business/")({
  component: RevenueWalletPage,
});

const stats = [
  { key: "biz.todayRevenue", value: revenueStats.todayRevenue, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "biz.monthlyRevenue", value: revenueStats.monthlyRevenue, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "biz.pendingRevenue", value: revenueStats.pendingRevenue, icon: CreditCard, color: "text-amber-500", bg: "bg-amber-500/10" },
  { key: "biz.availableBalance", value: revenueStats.availableBalance, icon: Wallet, color: "text-violet-500", bg: "bg-violet-500/10" },
  { key: "biz.withdrawable", value: revenueStats.withdrawable, icon: ArrowDownToLine, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { key: "biz.refunds", value: revenueStats.refunds, icon: RotateCcw, color: "text-rose-500", bg: "bg-rose-500/10" },
  { key: "biz.netProfit", value: revenueStats.netProfit, icon: PiggyBank, color: "text-green-500", bg: "bg-green-500/10" },
];

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const paymentMethods = [
  { label: "Visa", pct: 45, color: "bg-blue-500" },
  { label: "Wallet", pct: 25, color: "bg-violet-500" },
  { label: "Vodafone Cash", pct: 15, color: "bg-rose-500" },
  { label: "InstaPay", pct: 10, color: "bg-amber-500" },
  { label: "Other", pct: 5, color: "bg-slate-400" },
];

function RevenueWalletPage() {
  const { t } = useApp();
  const dailyMax = Math.max(...revenueStats.dailyRevenue);
  const monthlyMax = Math.max(...revenueStats.monthlyTrend.map((m) => m.revenue));

  return (
    <DashPage role="teacher" title={t("biz.revenueWallet")} subtitle="Financial overview" icon={ROLES.teacher.icon}>
      {/* ── Stat cards ── */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {stats.map((s) => (
          <Card key={s.key} className="flex items-center gap-3 border bg-card p-4">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold">${s.value.toLocaleString()}</p>
              <p className="truncate text-xs text-muted-foreground">{t(s.key)}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Daily revenue bar chart */}
        <Card className="border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Daily Revenue (This Week)</h3>
          <div className="flex items-end gap-2 h-40">
            {revenueStats.dailyRevenue.map((val, i) => {
              const pct = dailyMax > 0 ? (val / dailyMax) * 100 : 0;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-muted-foreground">${val.toLocaleString()}</span>
                  <div className="w-full flex-1 flex flex-col justify-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all"
                      style={{ height: `${pct}%`, minHeight: "4px" }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{dayLabels[i]}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Monthly trend bar chart */}
        <Card className="border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Monthly Trend (6 Months)</h3>
          <div className="flex items-end gap-2 h-40">
            {revenueStats.monthlyTrend.map((m, i) => {
              const pct = monthlyMax > 0 ? (m.revenue / monthlyMax) * 100 : 0;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-muted-foreground">${(m.revenue / 1000).toFixed(0)}k</span>
                  <div className="w-full flex-1 flex flex-col justify-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all"
                      style={{ height: `${pct}%`, minHeight: "4px" }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.month}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Payment methods ── */}
      <Card className="border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Payment Methods Breakdown</h3>
        <div className="space-y-4">
          {/* Stacked bar */}
          <div className="flex h-6 w-full overflow-hidden rounded-xl">
            {paymentMethods.map((pm) => (
              <div
                key={pm.label}
                className={cn("h-full transition-all", pm.color)}
                style={{ width: `${pm.pct}%` }}
                title={`${pm.label}: ${pm.pct}%`}
              />
            ))}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {paymentMethods.map((pm) => (
              <div key={pm.label} className="flex items-center gap-2 text-sm">
                <span className={cn("inline-block h-3 w-3 rounded-full", pm.color)} />
                <span className="text-muted-foreground">{pm.label}</span>
                <span className="font-semibold">{pm.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </DashPage>
  );
}
