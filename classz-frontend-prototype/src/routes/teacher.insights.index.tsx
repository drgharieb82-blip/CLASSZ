import { createFileRoute } from "@tanstack/react-router";
import {
  Users, DollarSign, TrendingUp, AlertTriangle, BarChart3, Activity,
  CheckCircle2, Lightbulb,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { overviewStats } from "@/lib/insights-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/insights/")({
  component: InsightsOverview,
});

const stats = [
  { key: "ins.totalStudents", icon: Users, value: "1,240", color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "Revenue", icon: DollarSign, value: "$68,400", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "ins.completion", icon: CheckCircle2, value: "72%", color: "text-violet-400", bg: "bg-violet-500/10" },
  { key: "At-Risk", icon: AlertTriangle, value: "3", color: "text-rose-400", bg: "bg-rose-500/10" },
  { key: "Avg Score", icon: BarChart3, value: "79%", color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "Active Students", icon: Activity, value: "980", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { key: "ins.growthRate", icon: TrendingUp, value: "+18%", color: "text-green-400", bg: "bg-green-500/10" },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function BarChart({ data, maxVal, color }: { data: number[]; maxVal: number; color: string }) {
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] font-medium text-muted-foreground">{v.toLocaleString()}</span>
          <div
            className={cn("w-full rounded-t-md transition-all", color)}
            style={{ height: `${(v / maxVal) * 100}%`, minHeight: 4 }}
          />
          <span className="text-[10px] text-muted-foreground">{months[i]}</span>
        </div>
      ))}
    </div>
  );
}

function InsightsOverview() {
  const { t } = useApp();

  return (
    <DashPage role="teacher" title={t("ins.overview")} subtitle="Executive dashboard with key metrics" icon={ROLES.teacher.icon}>
      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {stats.map((s) => (
          <Card key={s.key} className="flex items-center gap-3 border bg-card p-4">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="truncate text-xs text-muted-foreground">{t(s.key)}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Growth Trend */}
        <Card className="border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Student Growth</h3>
          </div>
          <BarChart
            data={overviewStats.growthTrend}
            maxVal={Math.max(...overviewStats.growthTrend) * 1.1}
            color="bg-blue-500"
          />
        </Card>

        {/* Revenue Trend */}
        <Card className="border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <h3 className="font-semibold">Revenue Trend</h3>
          </div>
          <BarChart
            data={overviewStats.revenueTrend}
            maxVal={Math.max(...overviewStats.revenueTrend) * 1.1}
            color="bg-emerald-500"
          />
        </Card>

        {/* Performance Trend */}
        <Card className="border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-violet-500" />
            <h3 className="font-semibold">Performance Trend</h3>
          </div>
          <BarChart
            data={overviewStats.performanceTrend}
            maxVal={100}
            color="bg-violet-500"
          />
        </Card>

        {/* Risk Trend */}
        <Card className="border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <h3 className="font-semibold">At-Risk Students (Declining = Good)</h3>
          </div>
          <BarChart
            data={overviewStats.riskTrend}
            maxVal={Math.max(...overviewStats.riskTrend) * 1.2}
            color="bg-rose-500"
          />
        </Card>
      </div>
    </DashPage>
  );
}
