import { createFileRoute } from "@tanstack/react-router";
import { BrainCog, AlertTriangle, Clock, Users, RefreshCw } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { memoryInsightsOverview } from "@/lib/insights-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/insights/memory-insights")({
  component: MemoryInsightsPage,
});

const forgettingCurve = [
  { label: "Day 1", retention: 100 },
  { label: "Day 3", retention: 72 },
  { label: "Day 7", retention: 55 },
  { label: "Day 14", retention: 40 },
  { label: "Day 30", retention: 28 },
  { label: "Day 60", retention: 18 },
];

const studentsNeedingIntervention = [
  { name: "Karim Adel", concept: "Integration", retention: 32, lastRevision: "14 days ago" },
  { name: "Ali Shaker", concept: "Series", retention: 28, lastRevision: "21 days ago" },
  { name: "Sara Mahmoud", concept: "Derivatives", retention: 35, lastRevision: "10 days ago" },
  { name: "Mona Hassan", concept: "Probability", retention: 38, lastRevision: "18 days ago" },
  { name: "Youssef Nabil", concept: "Integration", retention: 30, lastRevision: "20 days ago" },
];

const revisionTimes = [
  { concept: "Integration", nextRevision: "Today", urgency: "high" },
  { concept: "Series", nextRevision: "Today", urgency: "high" },
  { concept: "Probability", nextRevision: "Tomorrow", urgency: "medium" },
  { concept: "Derivatives", nextRevision: "In 3 days", urgency: "low" },
  { concept: "Limits", nextRevision: "In 5 days", urgency: "low" },
];

const urgencyColors: Record<string, string> = {
  high: "border-rose-300 text-rose-600 bg-rose-500/10",
  medium: "border-amber-300 text-amber-600 bg-amber-500/10",
  low: "border-blue-300 text-blue-600 bg-blue-500/10",
};

function MemoryInsightsPage() {
  const { t } = useApp();

  const totalBelow50 = memoryInsightsOverview.reduce((s, m) => s + m.studentsBelow50, 0);
  const avgRetention = Math.round(memoryInsightsOverview.reduce((s, m) => s + m.avgRetention, 0) / memoryInsightsOverview.length);
  const conceptsNeedingRevision = memoryInsightsOverview.filter((m) => m.revisionNeeded).length;

  return (
    <DashPage role="teacher" title={t("ins.memoryInsights")} subtitle="Spaced repetition and retention analysis" icon={ROLES.teacher.icon}>
      {/* Summary stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/10">
            <BrainCog className="h-5 w-5 text-violet-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{avgRetention}%</p>
            <p className="text-xs text-muted-foreground">Avg {t("ins.retention")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{totalBelow50}</p>
            <p className="text-xs text-muted-foreground">Students Below 50%</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10">
            <RefreshCw className="h-5 w-5 text-amber-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{conceptsNeedingRevision}</p>
            <p className="text-xs text-muted-foreground">Concepts Need Revision</p>
          </div>
        </Card>
      </div>

      {/* Memory Overview Table */}
      <Card className="border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BrainCog className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Memory Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concept</TableHead>
                <TableHead>Avg {t("ins.retention")}</TableHead>
                <TableHead className="text-end">Students Below 50%</TableHead>
                <TableHead>Revision Needed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memoryInsightsOverview.map((m) => (
                <TableRow key={m.concept} className="hover:bg-accent/50">
                  <TableCell className="font-medium">{m.concept}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={m.avgRetention} className="h-2 flex-1" />
                      <span className={cn(
                        "text-xs font-medium w-8 text-end",
                        m.avgRetention >= 70 ? "text-emerald-600" : m.avgRetention >= 50 ? "text-amber-600" : "text-rose-600"
                      )}>{m.avgRetention}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-end font-medium">{m.studentsBelow50}</TableCell>
                  <TableCell>
                    {m.revisionNeeded ? (
                      <Badge variant="outline" className="text-xs border-rose-300 text-rose-600 bg-rose-500/10">Needed</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-600 bg-emerald-500/10">OK</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Forgetting Curve */}
        <Card className="border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">{t("ins.forgettingCurve")}</h3>
          </div>
          <div className="flex items-end gap-3 h-36">
            {forgettingCurve.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold">{d.retention}%</span>
                <div
                  className={cn(
                    "w-full rounded-t-lg transition-all",
                    d.retention >= 70 ? "bg-emerald-500" : d.retention >= 40 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ height: `${d.retention}%`, minHeight: 4 }}
                />
                <span className="text-[10px] text-muted-foreground font-medium mt-1">{d.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Without spaced repetition, retention drops rapidly over time
          </p>
        </Card>

        {/* Recommended Revision Times */}
        <Card className="border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Recommended Revision Times</h3>
          </div>
          <div className="space-y-3">
            {revisionTimes.map((r) => (
              <div key={r.concept} className="flex items-center gap-3 rounded-xl border px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{r.concept}</p>
                  <p className="text-xs text-muted-foreground">Next: {r.nextRevision}</p>
                </div>
                <Badge variant="outline" className={cn("text-xs", urgencyColors[r.urgency])}>
                  {r.urgency}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Students Needing Intervention */}
      <Card className="border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-rose-500" />
          <h3 className="font-semibold">Students Needing Memory Intervention</h3>
          <Badge variant="outline" className="ms-auto border-rose-300 text-rose-600 bg-rose-500/10 text-xs">{studentsNeedingIntervention.length} students</Badge>
        </div>
        <div className="space-y-3">
          {studentsNeedingIntervention.map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-rose-500/10 text-rose-600 text-xs font-bold">
                  {s.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.concept} &middot; Last revision: {s.lastRevision}</p>
              </div>
              <div className="text-end">
                <p className={cn("text-sm font-bold", s.retention < 35 ? "text-rose-600" : "text-amber-600")}>{s.retention}%</p>
                <Progress value={s.retention} className="h-1.5 w-16 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashPage>
  );
}
