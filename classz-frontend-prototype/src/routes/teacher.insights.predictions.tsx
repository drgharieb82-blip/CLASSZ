import { createFileRoute } from "@tanstack/react-router";
import {
  Telescope, AlertTriangle, DollarSign, BarChart3, CheckCircle2,
  UserX, TrendingDown, TrendingUp,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { predictions } from "@/lib/insights-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/insights/predictions")({
  component: PredictionsPage,
});

const typeIcons: Record<string, typeof AlertTriangle> = {
  fail: AlertTriangle,
  churn: UserX,
  revenue: DollarSign,
  score: BarChart3,
  completion: CheckCircle2,
};

const typeColors: Record<string, { color: string; bg: string }> = {
  fail: { color: "text-rose-400", bg: "bg-rose-500/10" },
  churn: { color: "text-orange-400", bg: "bg-orange-500/10" },
  revenue: { color: "text-emerald-400", bg: "bg-emerald-500/10" },
  score: { color: "text-blue-400", bg: "bg-blue-500/10" },
  completion: { color: "text-violet-400", bg: "bg-violet-500/10" },
};

const typeGroups = ["fail", "churn", "revenue", "score", "completion"] as const;

const typeLabels: Record<string, string> = {
  fail: "Failure Risk",
  churn: "Churn Risk",
  revenue: "Revenue Forecast",
  score: "Score Predictions",
  completion: "Completion Forecast",
};

function PredictionsPage() {
  const { t } = useApp();

  const summaryStats = [
    { label: "Students at Risk", icon: AlertTriangle, value: "8", color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Revenue Forecast", icon: DollarSign, value: "$75K", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Predicted Avg Score", icon: BarChart3, value: "76%", color: "text-blue-400", bg: "bg-blue-500/10" },
  ];

  return (
    <DashPage role="teacher" title={t("ins.predictions")} subtitle="AI-powered predictions and forecasts" icon={ROLES.teacher.icon}>
      {/* Summary stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {summaryStats.map((s) => (
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

      {/* Predictions grouped by type */}
      {typeGroups.map((type) => {
        const items = predictions.filter((p) => p.type === type);
        if (items.length === 0) return null;
        const tc = typeColors[type];
        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className={cn("text-xs font-semibold", tc.bg, tc.color)}>
                {typeLabels[type]}
              </Badge>
              <span className="text-xs text-muted-foreground">{items.length} prediction{items.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((pred) => {
                const Icon = typeIcons[pred.type] ?? Telescope;
                const pc = typeColors[pred.type];
                return (
                  <Card key={pred.id} className="border bg-card p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", pc.bg)}>
                        <Icon className={cn("h-5 w-5", pc.color)} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm leading-tight">{pred.title}</h4>
                        <Badge variant="outline" className="mt-1 text-[10px]">{pred.id}</Badge>
                      </div>
                    </div>

                    <div className="text-center py-3">
                      <p className="text-3xl font-bold">{pred.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">Predicted Value</p>
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-semibold">{pred.confidence}%</span>
                      </div>
                      <Progress value={pred.confidence} className="h-2" />
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">{pred.details}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </DashPage>
  );
}
