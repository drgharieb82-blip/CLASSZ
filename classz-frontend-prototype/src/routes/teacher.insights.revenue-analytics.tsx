import { createFileRoute } from "@tanstack/react-router";
import {
  DollarSign, TrendingUp, Award, BarChart3, Users, ArrowDown,
  UserPlus, CreditCard, ShoppingCart,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { courseAnalytics } from "@/lib/insights-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/insights/revenue-analytics")({
  component: RevenueAnalyticsPage,
});

const revenueTrend = [
  { month: "Jan", value: 42000 },
  { month: "Feb", value: 48000 },
  { month: "Mar", value: 52000 },
  { month: "Apr", value: 55000 },
  { month: "May", value: 61000 },
  { month: "Jun", value: 68400 },
];

const conversionFunnel = [
  { stage: "Visitors", count: 12500, icon: Users, color: "bg-slate-500" },
  { stage: "Registered", count: 4800, icon: UserPlus, color: "bg-blue-500" },
  { stage: "Enrolled", count: 2100, icon: ShoppingCart, color: "bg-violet-500" },
  { stage: "Paid", count: 1240, icon: CreditCard, color: "bg-emerald-500" },
];

function RevenueAnalyticsPage() {
  const { t } = useApp();
  const maxRevenue = Math.max(...revenueTrend.map((r) => r.value));
  const topCourses = [...courseAnalytics].sort((a, b) => b.revenue - a.revenue);
  const funnelMax = conversionFunnel[0].count;

  const displayStats = [
    { label: "Total Revenue", icon: DollarSign, value: "$68,400", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Monthly Growth", icon: TrendingUp, value: "+12%", color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Top Course Revenue", icon: Award, value: "$38,600", color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: t("ins.roi"), icon: BarChart3, value: "340%", color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: t("ins.churn"), icon: ArrowDown, value: "4.2%", color: "text-rose-400", bg: "bg-rose-500/10" },
  ];

  return (
    <DashPage role="teacher" title={t("ins.revenueAnalytics")} subtitle="Revenue performance and business metrics" icon={ROLES.teacher.icon}>
      {/* Summary stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {displayStats.map((s) => (
          <Card key={s.label} className="flex items-center gap-3 border bg-card p-4">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="truncate text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card className="border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <h3 className="font-semibold">Revenue Trend</h3>
          </div>
          <div className="flex items-end gap-3 h-36">
            {revenueTrend.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-muted-foreground">${(d.value / 1000).toFixed(0)}k</span>
                <div
                  className="w-full rounded-t-lg bg-emerald-500 transition-all"
                  style={{ height: `${(d.value / (maxRevenue * 1.1)) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[10px] text-muted-foreground mt-1">{d.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Conversion Funnel */}
        <Card className="border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Conversion Funnel</h3>
          </div>
          <div className="space-y-4">
            {conversionFunnel.map((stage, i) => {
              const pct = Math.round((stage.count / funnelMax) * 100);
              const convRate = i > 0
                ? Math.round((stage.count / conversionFunnel[i - 1].count) * 100)
                : 100;
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <stage.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {stage.stage}
                    </span>
                    <span className="text-muted-foreground">
                      {stage.count.toLocaleString()}
                      {i > 0 && (
                        <Badge variant="outline" className="ms-2 text-[10px]">{convRate}%</Badge>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={cn("h-3 rounded-full transition-all", stage.color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top Courses by Revenue */}
      <Card className="border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-4 w-4 text-amber-500" />
          <h3 className="font-semibold">Top Courses by Revenue</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-end">Revenue</TableHead>
                <TableHead className="text-end">{t("ins.enrollment")}</TableHead>
                <TableHead className="text-end">Rev/Student</TableHead>
                <TableHead>{t("ins.completion")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCourses.map((c, i) => (
                <TableRow key={c.id} className="hover:bg-accent/50">
                  <TableCell>
                    <span className={cn(
                      "grid h-6 w-6 place-items-center rounded-md text-xs font-bold",
                      i === 0 ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"
                    )}>
                      {i + 1}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell className="text-end font-semibold text-emerald-600">${c.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-end">{c.enrollment.toLocaleString()}</TableCell>
                  <TableCell className="text-end">${Math.round(c.revenue / c.enrollment)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={c.completion} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-8 text-end">{c.completion}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashPage>
  );
}
