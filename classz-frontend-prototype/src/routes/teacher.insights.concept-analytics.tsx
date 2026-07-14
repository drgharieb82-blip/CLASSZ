import { createFileRoute } from "@tanstack/react-router";
import { Target, Brain, RefreshCw, BarChart3 } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { conceptAnalytics } from "@/lib/insights-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/insights/concept-analytics")({
  component: ConceptAnalyticsPage,
});

function ConceptAnalyticsPage() {
  const { t } = useApp();

  const totalConcepts = conceptAnalytics.length;
  const avgMastery = Math.round(conceptAnalytics.reduce((s, c) => s + c.mastery, 0) / totalConcepts);
  const avgRetention = Math.round(conceptAnalytics.reduce((s, c) => s + c.retention, 0) / totalConcepts);

  const summaryStats = [
    { label: "Total Concepts", icon: Target, value: totalConcepts.toString(), color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: t("ins.mastery"), icon: Brain, value: `${avgMastery}%`, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: t("ins.retention"), icon: RefreshCw, value: `${avgRetention}%`, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  function progressColor(value: number, invert = false) {
    const v = invert ? 100 - value : value;
    if (v >= 70) return "text-emerald-600";
    if (v >= 50) return "text-amber-600";
    return "text-rose-600";
  }

  return (
    <DashPage role="teacher" title={t("ins.conceptAnalytics")} subtitle="Concept mastery, difficulty, and retention metrics" icon={ROLES.teacher.icon}>
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

      {/* Concept Table */}
      <Card className="border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Concept Performance</h3>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concept</TableHead>
                <TableHead className="text-end">Atomic Concepts</TableHead>
                <TableHead>{t("ins.coverage")}</TableHead>
                <TableHead>{t("ins.mastery")}</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>{t("ins.retention")}</TableHead>
                <TableHead>Weak Atomics</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conceptAnalytics.map((c) => (
                <TableRow key={c.concept} className="hover:bg-accent/50">
                  <TableCell className="font-medium">{c.concept}</TableCell>
                  <TableCell className="text-end">{c.atomicConcepts}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={c.coverage} className="h-2 flex-1" />
                      <span className={cn("text-xs font-medium w-8 text-end", progressColor(c.coverage))}>{c.coverage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={c.mastery} className="h-2 flex-1" />
                      <span className={cn("text-xs font-medium w-8 text-end", progressColor(c.mastery))}>{c.mastery}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={c.difficulty} className="h-2 flex-1" />
                      <span className={cn("text-xs font-medium w-8 text-end", progressColor(c.difficulty, true))}>{c.difficulty}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={c.retention} className="h-2 flex-1" />
                      <span className={cn("text-xs font-medium w-8 text-end", progressColor(c.retention))}>{c.retention}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {c.weakAtomics.map((wa) => (
                        <Badge key={wa} variant="outline" className="text-[10px] border-rose-300 text-rose-600 bg-rose-500/10">{wa}</Badge>
                      ))}
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
