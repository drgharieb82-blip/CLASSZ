import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { revenueBySource, revenueTrend, platformFeeDistribution, platformFinanceStats } from "@/lib/platform-finance-mock-data";

export const Route = createFileRoute("/admin/finance/platform-revenue")({
  component: PlatformRevenuePage,
});

const sourceColors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-slate-400"];

function PlatformRevenuePage() {
  const { t } = useApp();
  const revenueMax = Math.max(...revenueTrend.map((m) => m.platformRevenue));
  const feeMax = Math.max(...revenueTrend.map((m) => m.platformRevenue));

  return (
    <DashPage role="superadmin" title="pf.platformRevenue" subtitle="pf.platformRevenueSubtitle" icon={TrendingUp}>
      {/* Revenue source cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {revenueBySource.map((src, i) => (
          <Card key={src.source} className="flex flex-col gap-2 border bg-card p-4">
            <div className="flex items-center gap-2">
              <span className={cn("h-3 w-3 rounded-full", sourceColors[i])} />
              <span className="text-xs text-muted-foreground">{t(`pf.${["platformFees", "teacherSubscriptions", "adsRevenue", "affiliateRevenue", "enterprisePlans"][i]}`)}</span>
            </div>
            <p className="text-xl font-bold">${src.amount.toLocaleString()}</p>
            <Badge variant="secondary" className="w-fit rounded-full text-xs">{src.pct}%</Badge>
          </Card>
        ))}
      </div>

      {/* Monthly platform revenue chart */}
      <Card className="border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">{t("pf.monthlyPlatformRevenue")}</h3>
        <div className="flex items-end gap-3 h-52">
          {revenueTrend.map((m) => {
            const pct = revenueMax > 0 ? (m.platformRevenue / revenueMax) * 100 : 0;
            return (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-muted-foreground">${(m.platformRevenue / 1000).toFixed(0)}k</span>
                <div className="w-full flex-1 flex flex-col justify-end">
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-violet-400 transition-all" style={{ height: `${pct}%`, minHeight: "4px" }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{m.month}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue by Source breakdown */}
        <Card className="border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("pf.revenueBySource")}</h3>
          <div className="space-y-3">
            {revenueBySource.map((src, i) => (
              <div key={src.source} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{src.source}</span>
                  <span className="font-semibold">${src.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full transition-all", sourceColors[i])} style={{ width: `${src.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Platform fee trends */}
        <Card className="border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("pf.platformFeeTrends")}</h3>
          <div className="flex items-end gap-3 h-48">
            {revenueTrend.map((m) => {
              const feePct = feeMax > 0 ? (m.platformRevenue / feeMax) * 100 : 0;
              const expPct = feeMax > 0 ? (m.expenses / feeMax) * 100 : 0;
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full flex-1 flex items-end gap-0.5">
                    <div className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400" style={{ height: `${feePct}%`, minHeight: "4px" }} />
                    <div className="flex-1 rounded-t-md bg-gradient-to-t from-rose-600 to-rose-400" style={{ height: `${expPct}%`, minHeight: "4px" }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />{t("pf.revenue")}</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />{t("pf.expenses2")}</span>
          </div>
        </Card>
      </div>
    </DashPage>
  );
}
