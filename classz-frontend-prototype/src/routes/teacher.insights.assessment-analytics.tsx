import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CheckCircle2, AlertTriangle, Brain, Trophy, XCircle } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/insights/assessment-analytics")({
  component: AssessmentAnalyticsPage,
});

const stats = [
  { label: "Average Score", icon: BarChart3, value: "76%", color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Pass Rate", icon: CheckCircle2, value: "82%", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Hard Questions", icon: AlertTriangle, value: "24", color: "text-amber-400", bg: "bg-amber-500/10" },
  { label: "Weak Concepts", icon: Brain, value: "8", color: "text-rose-400", bg: "bg-rose-500/10" },
];

const scoreDistribution = [
  { range: "0-20", pct: 5, color: "bg-rose-500" },
  { range: "20-40", pct: 8, color: "bg-orange-500" },
  { range: "40-60", pct: 15, color: "bg-amber-500" },
  { range: "60-80", pct: 35, color: "bg-blue-500" },
  { range: "80-100", pct: 37, color: "bg-emerald-500" },
];

const failedStudents = [
  { name: "Karim Adel", score: 32, course: "Advanced Mathematics" },
  { name: "Ali Shaker", score: 28, course: "Calculus Masterclass" },
  { name: "Sara Mahmoud", score: 38, course: "Statistics & Probability" },
  { name: "Youssef Nabil", score: 41, course: "Advanced Mathematics" },
  { name: "Mona Hassan", score: 35, course: "Linear Algebra" },
];

const topStudents = [
  { name: "Lina Fares", score: 98, course: "Advanced Mathematics" },
  { name: "Aya Mansour", score: 96, course: "Calculus Masterclass" },
  { name: "Omar Khaled", score: 95, course: "Advanced Mathematics" },
  { name: "Nour Ahmed", score: 94, course: "Statistics & Probability" },
  { name: "Tamer Gamal", score: 92, course: "Calculus Masterclass" },
];

function AssessmentAnalyticsPage() {
  const { t } = useApp();
  const maxPct = Math.max(...scoreDistribution.map((d) => d.pct));

  return (
    <DashPage role="teacher" title={t("ins.assessmentAnalytics")} subtitle="Assessment performance and score analysis" icon={ROLES.teacher.icon}>
      {/* Summary stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
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

      {/* Score distribution */}
      <Card className="border bg-card p-5">
        <h3 className="font-semibold mb-4">Score Distribution</h3>
        <div className="flex items-end gap-3 h-40">
          {scoreDistribution.map((d) => (
            <div key={d.range} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-sm font-bold">{d.pct}%</span>
              <div
                className={cn("w-full rounded-t-lg transition-all", d.color)}
                style={{ height: `${(d.pct / maxPct) * 100}%`, minHeight: 4 }}
              />
              <span className="text-[10px] text-muted-foreground font-medium mt-1">{d.range}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>Low scores</span>
          <span>High scores</span>
        </div>
      </Card>

      {/* Failed & Top Students */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Failed */}
        <Card className="border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="h-4 w-4 text-rose-500" />
            <h3 className="font-semibold">Failed Students</h3>
            <Badge variant="outline" className="ms-auto border-rose-300 text-rose-600 bg-rose-500/10 text-xs">5 students</Badge>
          </div>
          <div className="space-y-3">
            {failedStudents.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-rose-500/10 text-rose-600 text-xs font-bold">
                    {s.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.course}</p>
                </div>
                <div className="text-end">
                  <p className="text-sm font-bold text-rose-600">{s.score}%</p>
                  <Progress value={s.score} className="h-1.5 w-16 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top */}
        <Card className="border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold">Top Students</h3>
            <Badge variant="outline" className="ms-auto border-emerald-300 text-emerald-600 bg-emerald-500/10 text-xs">Top 5</Badge>
          </div>
          <div className="space-y-3">
            {topStudents.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold",
                  i === 0 ? "bg-amber-500/10 text-amber-600" : i === 1 ? "bg-slate-300/20 text-slate-500" : i === 2 ? "bg-orange-500/10 text-orange-600" : "bg-muted text-muted-foreground"
                )}>
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.course}</p>
                </div>
                <div className="text-end">
                  <p className="text-sm font-bold text-emerald-600">{s.score}%</p>
                  <Progress value={s.score} className="h-1.5 w-16 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashPage>
  );
}
