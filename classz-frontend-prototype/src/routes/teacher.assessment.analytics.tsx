import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3, TrendingUp, TrendingDown, Brain, Award, AlertTriangle,
  Users, HelpCircle, BookOpen, Target,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { gradebookData, submissionRecords } from "@/lib/assessment-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/assessment/analytics")({
  component: AnalyticsPage,
});

const difficultyDistribution = [
  { level: "Easy", count: 45, color: "bg-emerald-500", pct: 30 },
  { level: "Medium", count: 68, color: "bg-amber-500", pct: 45 },
  { level: "Hard", count: 32, color: "bg-rose-500", pct: 21 },
  { level: "Expert", count: 5, color: "bg-violet-500", pct: 4 },
];

const weakConcepts = [
  { concept: "Chain Rule Applications", wrongRate: 42, totalAttempts: 560, trend: "up" as const },
  { concept: "Integration by Substitution", wrongRate: 38, totalAttempts: 420, trend: "stable" as const },
  { concept: "Probability Distributions", wrongRate: 35, totalAttempts: 380, trend: "down" as const },
  { concept: "L'Hopital's Rule", wrongRate: 31, totalAttempts: 510, trend: "up" as const },
  { concept: "Implicit Differentiation", wrongRate: 28, totalAttempts: 290, trend: "down" as const },
];

const bestSessions = [
  { title: "Session 1: Foundations", avgScore: 89, students: 45, passRate: 96 },
  { title: "Session 2: Differentiation", avgScore: 82, students: 42, passRate: 88 },
  { title: "Session 3: Applications", avgScore: 78, students: 38, passRate: 82 },
  { title: "Session 4: Integration", avgScore: 74, students: 35, passRate: 76 },
  { title: "Session 5: Series", avgScore: 71, students: 30, passRate: 72 },
];

const studentsNeedingSupport = [
  { name: "Karim Adel", id: "STU-004", avg: 68, issues: ["Low quiz scores", "3 missed homework"], risk: "high" as const },
  { name: "Ali Shaker", id: "STU-010", avg: 58, issues: ["Failing exams", "Integrity flags"], risk: "high" as const },
  { name: "Nour Sami", id: "STU-005", avg: 74, issues: ["Declining trend", "Low completion"], risk: "medium" as const },
  { name: "Youssef Ahmed", id: "STU-012", avg: 71, issues: ["Low homework scores"], risk: "medium" as const },
  { name: "Sara Mahmoud", id: "STU-007", avg: 0, issues: ["No submissions", "Inactive"], risk: "high" as const },
];

// Mock trend data: assessment scores over time
const trendData = [
  { label: "Quiz 1", score: 72, color: "bg-blue-500" },
  { label: "Quiz 2", score: 68, color: "bg-blue-500" },
  { label: "HW 1", score: 80, color: "bg-emerald-500" },
  { label: "Quiz 3", score: 75, color: "bg-blue-500" },
  { label: "HW 2", score: 78, color: "bg-emerald-500" },
  { label: "Exam", score: 76, color: "bg-violet-500" },
  { label: "Quiz 4", score: 82, color: "bg-blue-500" },
  { label: "HW 3", score: 85, color: "bg-emerald-500" },
  { label: "Quiz 5", score: 79, color: "bg-blue-500" },
  { label: "Practice", score: 88, color: "bg-cyan-500" },
];

const riskColors: Record<string, string> = {
  high: "border-rose-300 text-rose-600 bg-rose-500/10",
  medium: "border-amber-300 text-amber-600 bg-amber-500/10",
  low: "border-blue-300 text-blue-600 bg-blue-500/10",
};

const trendIcons: Record<string, typeof TrendingUp> = {
  up: TrendingUp, down: TrendingDown, stable: Target,
};

function AnalyticsPage() {
  const { t } = useApp();

  const avgScore = gradebookData.length > 0
    ? Math.round(gradebookData.filter((s) => s.average > 0).reduce((a, s) => a + s.average, 0) / gradebookData.filter((s) => s.average > 0).length)
    : 0;
  const passRate = gradebookData.filter((s) => s.average > 0).length > 0
    ? Math.round((gradebookData.filter((s) => s.average >= 50).length / gradebookData.filter((s) => s.average > 0).length) * 100)
    : 0;

  return (
    <DashPage role="teacher" title={t("assess.analytics")} subtitle="Deep insights into assessment performance and patterns" icon={ROLES.teacher.icon}>
      {/* Top Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10">
            <BarChart3 className="h-5 w-5 text-emerald-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{avgScore}%</p>
            <p className="text-xs text-muted-foreground">{t("assess.avgScore")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-500/10">
            <TrendingUp className="h-5 w-5 text-green-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{passRate}%</p>
            <p className="text-xs text-muted-foreground">{t("assess.passRate")}</p>
          </div>
        </Card>
        <Card className="border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-2">{t("assess.questionDifficulty")}</p>
          <div className="flex gap-1 h-4 rounded-full overflow-hidden">
            {difficultyDistribution.map((d) => (
              <div key={d.level} className={cn("h-full transition-all", d.color)} style={{ width: `${d.pct}%` }} title={`${d.level}: ${d.count}`} />
            ))}
          </div>
          <div className="flex gap-3 mt-2 flex-wrap">
            {difficultyDistribution.map((d) => (
              <span key={d.level} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className={cn("h-2 w-2 rounded-full", d.color)} />
                {d.level} ({d.count})
              </span>
            ))}
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10">
            <Brain className="h-5 w-5 text-rose-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{weakConcepts.length}</p>
            <p className="text-xs text-muted-foreground">Weak Concepts Detected</p>
          </div>
        </Card>
      </div>

      {/* Score Trend Chart */}
      <Card className="border bg-card p-5">
        <h3 className="font-semibold mb-4">Assessment Score Trends</h3>
        <div className="flex items-end gap-2 h-48">
          {trendData.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold tabular-nums">{item.score}%</span>
              <div
                className={cn("w-full rounded-t-lg transition-all", item.color)}
                style={{ height: `${item.score}%` }}
              />
              <span className="text-[9px] text-muted-foreground whitespace-nowrap truncate w-full text-center">{item.label}</span>
            </div>
          ))}
        </div>
        <Separator className="my-3" />
        <div className="flex gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Quizzes</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Homework</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full bg-violet-500" /> Exams</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full bg-cyan-500" /> Practice</span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Best Performing Sessions */}
        <Card className="border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">{t("assess.bestSessions")}</h3>
          </div>
          <div className="space-y-2">
            {bestSessions.map((session, i) => (
              <div key={session.title} className="flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors hover:bg-accent/50">
                <span className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                  i === 0 ? "bg-amber-500/20 text-amber-600" : "bg-muted text-muted-foreground"
                )}>
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <p className="text-[10px] text-muted-foreground">{session.students} students — {session.passRate}% pass rate</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Progress value={session.avgScore} className="w-14 h-1.5 [&>div]:bg-emerald-500" />
                  <span className="text-sm font-bold tabular-nums text-emerald-500">{session.avgScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weak Concepts */}
        <Card className="border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-rose-500" />
            <h3 className="font-semibold">Weak Concepts</h3>
          </div>
          <div className="space-y-3">
            {weakConcepts.map((wc) => {
              const TrendIcon = trendIcons[wc.trend];
              return (
                <div key={wc.concept} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{wc.concept}</span>
                    <div className="flex items-center gap-1.5">
                      <TrendIcon className={cn("h-3 w-3", wc.trend === "up" ? "text-rose-500" : wc.trend === "down" ? "text-emerald-500" : "text-muted-foreground")} />
                      <span className="text-xs text-muted-foreground">{wc.totalAttempts} attempts</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={wc.wrongRate} className="h-1.5 flex-1 [&>div]:bg-rose-500" />
                    <span className="text-xs font-semibold text-rose-500 tabular-nums">{wc.wrongRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Students Needing Support */}
      <Card className="border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold">{t("assess.needSupport")}</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {studentsNeedingSupport.map((student) => (
            <div key={student.id} className="rounded-xl border p-3 transition-colors hover:bg-accent/50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">{student.name}</p>
                  <p className="text-[10px] text-muted-foreground">{student.id}</p>
                </div>
                <Badge variant="outline" className={cn("rounded-full text-[10px]", riskColors[student.risk])}>
                  {student.risk} risk
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Progress
                  value={student.avg}
                  className={cn("h-1.5 flex-1", student.avg < 50 ? "[&>div]:bg-rose-500" : student.avg < 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500")}
                />
                <span className={cn("text-xs font-bold tabular-nums", student.avg < 50 ? "text-rose-500" : student.avg < 70 ? "text-amber-500" : "text-emerald-500")}>
                  {student.avg > 0 ? `${student.avg}%` : "N/A"}
                </span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {student.issues.map((issue) => (
                  <Badge key={issue} variant="outline" className="rounded-full text-[10px] border-muted-foreground/20">{issue}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashPage>
  );
}
