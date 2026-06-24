import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles, BookOpen, Users, Play, Target, ClipboardList, FileText,
  AlertTriangle, CheckCircle2,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { aiRecommendations } from "@/lib/insights-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/insights/ai-insights")({
  component: AiInsightsPage,
});

const typeIcons: Record<string, typeof BookOpen> = {
  chapter: BookOpen,
  student: Users,
  session: Play,
  concept: Target,
  homework: ClipboardList,
  exam: FileText,
};

const priorityColors: Record<string, string> = {
  high: "border-rose-300 text-rose-600 bg-rose-500/10",
  medium: "border-amber-300 text-amber-600 bg-amber-500/10",
  low: "border-blue-300 text-blue-600 bg-blue-500/10",
};

const priorityOrder = ["high", "medium", "low"] as const;

function AiInsightsPage() {
  const { t } = useApp();

  const highCount = aiRecommendations.filter((r) => r.priority === "high").length;
  const total = aiRecommendations.length;
  const actionsTaken = 2; // mock counter

  const summaryStats = [
    { label: "Total Recommendations", icon: Sparkles, value: total.toString(), color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "High Priority", icon: AlertTriangle, value: highCount.toString(), color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Actions Taken", icon: CheckCircle2, value: actionsTaken.toString(), color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <DashPage role="teacher" title={t("ins.aiInsights")} subtitle="AI-powered recommendations for your courses" icon={ROLES.teacher.icon}>
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

      {/* Grouped by priority */}
      {priorityOrder.map((priority) => {
        const items = aiRecommendations.filter((r) => r.priority === priority);
        if (items.length === 0) return null;
        return (
          <div key={priority}>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className={cn("text-xs font-semibold capitalize", priorityColors[priority])}>
                {priority} priority
              </Badge>
              <span className="text-xs text-muted-foreground">{items.length} recommendations</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((rec) => {
                const Icon = typeIcons[rec.type] ?? Sparkles;
                return (
                  <Card key={rec.id} className="border bg-card p-5 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", priorityColors[rec.priority].split(" ").slice(2).join(" "))}>
                        <Icon className={cn("h-5 w-5", priorityColors[rec.priority].split(" ")[1])} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm leading-tight">{rec.title}</h4>
                        <Badge variant="outline" className={cn("mt-1 text-[10px]", priorityColors[rec.priority])}>
                          {rec.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex-1 mb-4">{rec.description}</p>
                    <Button variant="outline" size="sm" className="rounded-xl w-full gap-1.5">
                      <Icon className="h-3.5 w-3.5" />
                      {rec.actionLabel}
                    </Button>
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
