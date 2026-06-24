import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Trophy, TrendingUp, BarChart3, Download, Award, AlertTriangle,
  FileSpreadsheet, FileText, Users,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { submissionRecords, gradebookData } from "@/lib/assessment-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/assessment/results")({
  component: ResultsPage,
});

// Score distribution buckets
const getDistribution = (scores: number[]) => {
  const buckets = [
    { label: "0-20%", min: 0, max: 20, count: 0, color: "bg-rose-500" },
    { label: "21-40%", min: 21, max: 40, count: 0, color: "bg-orange-500" },
    { label: "41-60%", min: 41, max: 60, count: 0, color: "bg-amber-500" },
    { label: "61-80%", min: 61, max: 80, count: 0, color: "bg-blue-500" },
    { label: "81-100%", min: 81, max: 100, count: 0, color: "bg-emerald-500" },
  ];
  scores.forEach((s) => {
    const b = buckets.find((bk) => s >= bk.min && s <= bk.max);
    if (b) b.count++;
  });
  return buckets;
};

function ResultsPage() {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState("quiz");

  const quizResults = submissionRecords.filter((s) => s.type === "quiz");
  const examResults = submissionRecords.filter((s) => s.type === "exam");
  const hwResults = submissionRecords.filter((s) => s.type === "homework");

  const currentResults = useMemo(() => {
    if (activeTab === "quiz") return quizResults;
    if (activeTab === "exam") return examResults;
    return hwResults;
  }, [activeTab, quizResults, examResults, hwResults]);

  const totalGraded = currentResults.filter((r) => r.status === "graded").length;
  const avgScore = currentResults.length > 0
    ? Math.round(currentResults.reduce((acc, r) => acc + (r.score / r.maxScore) * 100, 0) / currentResults.length)
    : 0;
  const passRate = currentResults.length > 0
    ? Math.round((currentResults.filter((r) => (r.score / r.maxScore) >= 0.5).length / currentResults.length) * 100)
    : 0;
  const topScore = currentResults.length > 0
    ? Math.max(...currentResults.map((r) => Math.round((r.score / r.maxScore) * 100)))
    : 0;

  const allScores = currentResults.map((r) => Math.round((r.score / r.maxScore) * 100));
  const distribution = getDistribution(allScores);
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  // Top and failed students from gradebook
  const topStudents = [...gradebookData].sort((a, b) => b.average - a.average).slice(0, 5);
  const failedStudents = [...gradebookData].filter((s) => s.average > 0 && s.average < 60).sort((a, b) => a.average - b.average).slice(0, 5);

  return (
    <DashPage role="teacher" title={t("assess.results")} subtitle="Comprehensive view of assessment results and performance" icon={ROLES.teacher.icon}>
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="quiz">{t("assess.quizResults")}</TabsTrigger>
            <TabsTrigger value="exam">{t("assess.examResults")}</TabsTrigger>
            <TabsTrigger value="homework">{t("assess.hwResults")}</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              {t("assess.exportExcel")}
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              {t("assess.exportPDF")}
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab}>
          {/* Summary Stats */}
          <div className="grid gap-3 sm:grid-cols-4 mt-4">
            <Card className="flex items-center gap-3 border bg-card p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </span>
              <div>
                <p className="text-2xl font-bold">{totalGraded}</p>
                <p className="text-xs text-muted-foreground">Total Graded</p>
              </div>
            </Card>
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
            <Card className="flex items-center gap-3 border bg-card p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10">
                <Trophy className="h-5 w-5 text-amber-500" />
              </span>
              <div>
                <p className="text-2xl font-bold">{topScore}%</p>
                <p className="text-xs text-muted-foreground">Top Score</p>
              </div>
            </Card>
          </div>

          {/* Score Distribution */}
          <Card className="border bg-card p-5 mt-4">
            <h3 className="font-semibold mb-4">Score Distribution</h3>
            <div className="flex items-end gap-2 h-40">
              {distribution.map((bucket) => (
                <div key={bucket.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold tabular-nums">{bucket.count}</span>
                  <div
                    className={cn("w-full rounded-t-lg transition-all", bucket.color)}
                    style={{ height: `${maxCount > 0 ? (bucket.count / maxCount) * 100 : 0}%`, minHeight: bucket.count > 0 ? "8px" : "2px" }}
                  />
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{bucket.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Students */}
        <Card className="border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">{t("assess.topStudents")}</h3>
          </div>
          <div className="space-y-2">
            {topStudents.map((student, i) => (
              <div key={student.studentId} className="flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors hover:bg-accent/50">
                <span className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                  i === 0 ? "bg-amber-500/20 text-amber-600" : i === 1 ? "bg-slate-300/20 text-slate-500" : i === 2 ? "bg-orange-500/20 text-orange-600" : "bg-muted text-muted-foreground"
                )}>
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{student.studentName}</p>
                  <p className="text-[10px] text-muted-foreground">{student.studentId}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Progress value={student.average} className="w-16 h-1.5 [&>div]:bg-emerald-500" />
                  <span className="text-sm font-bold tabular-nums text-emerald-500">{student.average}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Failed Students */}
        <Card className="border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            <h3 className="font-semibold">{t("assess.failedStudents")}</h3>
          </div>
          {failedStudents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground border border-dashed rounded-xl">
              <AlertTriangle className="h-8 w-8" />
              <p className="text-sm">No failed students</p>
            </div>
          ) : (
            <div className="space-y-2">
              {failedStudents.map((student) => (
                <div key={student.studentId} className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-500/20 text-xs font-bold text-rose-600">
                    !
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{student.studentName}</p>
                    <p className="text-[10px] text-muted-foreground">{student.studentId} — Completion: {student.completion}%</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Progress value={student.average} className="w-16 h-1.5 [&>div]:bg-rose-500" />
                    <span className="text-sm font-bold tabular-nums text-rose-500">{student.average}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashPage>
  );
}
