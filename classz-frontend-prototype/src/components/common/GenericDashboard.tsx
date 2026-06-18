import { type ReactNode } from "react";
import { type LucideIcon, Users, BookOpen, TrendingUp, Activity, Star, Clock, Award, Zap } from "lucide-react";
import { AnimatedStats, type AnimatedStat } from "@/components/premium/AnimatedStats";
import { PremiumChartCard } from "@/components/premium/PremiumChartCard";
import { GlowCard } from "@/components/premium/GlowCard";
import { AreaTrend, BarTrend, DonutChart, RadarScores } from "@/components/common/charts";
import { StatusBadge } from "@/components/common/primitives";
import { Badge } from "@/components/ui/badge";
import {
  weeklyProgress,
  subjectScores,
  usersByRole,
  revenueData,
  students,
} from "@/lib/mock";

const gradients = ["from-violet-500 to-blue-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500"];
const icons: LucideIcon[] = [Users, BookOpen, TrendingUp, Activity, Star, Clock, Award, Zap];

export interface TableColumn {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => ReactNode;
  className?: string;
}

export interface TableConfig {
  title: string;
  columns: TableColumn[];
  rows: Record<string, unknown>[];
}

/** Reusable, premium data table for dashboard pages. */
export function DataTable({ title, columns, rows }: TableConfig) {
  return (
    <GlowCard>
      <div className="p-5">
        <h3 className="mb-4 font-semibold">{title}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-start text-xs uppercase tracking-wider text-muted-foreground">
                {columns.map((c) => (
                  <th key={c.key} className="py-2.5 pe-4 text-start font-medium">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                  {columns.map((c) => (
                    <td key={c.key} className={c.className ?? "py-3 pe-4"}>
                      {c.render ? c.render(row) : (row[c.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GlowCard>
  );
}

const studentsTable: TableConfig = {
  title: "Recent students",
  columns: [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name as string}</span> },
    { key: "grade", label: "Grade", className: "py-3 pe-4 text-muted-foreground" },
    { key: "courses", label: "Courses", render: (r) => <Badge variant="secondary" className="rounded-full">{r.courses as number}</Badge> },
    {
      key: "progress", label: "Progress", render: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
            <div className="h-full gradient-brand" style={{ width: `${r.progress}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{r.progress as number}%</span>
        </div>
      ),
    },
    { key: "lastActive", label: "Last active", className: "py-3 pe-4 text-muted-foreground" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status as string} /> },
  ],
  rows: students as unknown as Record<string, unknown>[],
};

/**
 * Reusable rich dashboard body for any role/section.
 * Pass custom stats and a custom table, otherwise sensible defaults are shown.
 */
export function GenericDashboard({
  stats,
  chartA = "area",
  chartB = "donut",
  chartATitle = "Activity overview",
  chartATitleSub = "Last 7 days",
  chartBTitle = "Distribution",
  showTable = true,
  table,
  children,
}: {
  stats?: AnimatedStat[];
  chartA?: "area" | "bar";
  chartB?: "donut" | "radar";
  chartATitle?: string;
  chartATitleSub?: string;
  chartBTitle?: string;
  showTable?: boolean;
  table?: TableConfig;
  children?: ReactNode;
}) {
  const defaultStats: AnimatedStat[] = [
    { label: "Total", value: 8420, icon: icons[0], gradient: gradients[0], delta: "+12.4% this month" },
    { label: "Active now", value: 1240, icon: icons[3], gradient: gradients[1], delta: "+4.1%" },
    { label: "Completion", value: 87, suffix: "%", icon: icons[2], gradient: gradients[2], delta: "+2.3%" },
    { label: "Avg. rating", value: 4.8, decimals: 1, icon: icons[4], gradient: gradients[3], delta: "+0.2" },
  ];

  return (
    <>
      <AnimatedStats stats={stats ?? defaultStats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <PremiumChartCard className="lg:col-span-2" title={chartATitle} subtitle={chartATitleSub} icon={TrendingUp}>
          {chartA === "area" ? (
            <AreaTrend data={weeklyProgress} x="day" y="xp" />
          ) : (
            <BarTrend data={revenueData} x="month" y="revenue" />
          )}
        </PremiumChartCard>

        <PremiumChartCard title={chartBTitle} icon={Activity}>
          {chartB === "donut" ? <DonutChart data={usersByRole} /> : <RadarScores data={subjectScores} />}
        </PremiumChartCard>
      </div>

      {children}

      {showTable && <DataTable {...(table ?? studentsTable)} />}
    </>
  );
}
