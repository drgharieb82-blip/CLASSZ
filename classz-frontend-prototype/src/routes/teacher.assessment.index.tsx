import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ClipboardCheck, FileText, BookOpen, Upload, BarChart3, ShieldCheck,
  TrendingUp, CheckCircle2, AlertTriangle, ArrowRight, Clock,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { gradingQueue, submissionRecords } from "@/lib/assessment-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/assessment/")({
  component: AssessmentOverviewPage,
});

const stats = [
  { key: "assess.pendingSubs", icon: Clock, value: "7", color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "assess.essaysToGrade", icon: FileText, value: "3", color: "text-violet-400", bg: "bg-violet-500/10" },
  { key: "assess.hwToReview", icon: BookOpen, value: "3", color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "assess.fileUploads", icon: Upload, value: "2", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { key: "assess.avgScore", icon: BarChart3, value: "76%", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "assess.passRate", icon: TrendingUp, value: "82%", color: "text-green-400", bg: "bg-green-500/10" },
  { key: "assess.suspiciousAttempts", icon: AlertTriangle, value: "4", color: "text-rose-400", bg: "bg-rose-500/10" },
  { key: "assess.gradedToday", icon: CheckCircle2, value: "15", color: "text-teal-400", bg: "bg-teal-500/10" },
];

const weakConcepts = [
  { concept: "Chain Rule Applications", wrongRate: 42, studentCount: 18 },
  { concept: "Integration by Substitution", wrongRate: 38, studentCount: 14 },
  { concept: "Probability Distributions", wrongRate: 35, studentCount: 11 },
  { concept: "L'Hopital's Rule", wrongRate: 31, studentCount: 9 },
];

const quickActions = [
  { key: "assess.gradingQueue", icon: ClipboardCheck, to: "/teacher/assessment/grading-queue", desc: "Review pending submissions" },
  { key: "assess.gradebook", icon: BarChart3, to: "/teacher/assessment/gradebook", desc: "View student grades" },
  { key: "assess.academicIntegrity", icon: ShieldCheck, to: "/teacher/assessment/academic-integrity", desc: "Review flagged attempts" },
  { key: "assess.analytics", icon: TrendingUp, to: "/teacher/assessment/analytics", desc: "Performance insights" },
];

const priorityColors: Record<string, string> = {
  high: "border-rose-300 text-rose-600 bg-rose-500/10",
  medium: "border-amber-300 text-amber-600 bg-amber-500/10",
  low: "border-blue-300 text-blue-600 bg-blue-500/10",
};

const statusColors: Record<string, string> = {
  pending: "border-amber-300 text-amber-600 bg-amber-500/10",
  in_progress: "border-blue-300 text-blue-600 bg-blue-500/10",
  graded: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
  returned: "border-slate-300 text-slate-500 bg-slate-500/10",
};

const typeLabels: Record<string, string> = {
  essay: "Essay", homework: "Homework", file_upload: "File Upload",
  manual_review: "Manual Review", quiz: "Quiz", exam: "Exam", practice: "Practice",
};

function AssessmentOverviewPage() {
  const { t } = useApp();
  const pendingQueue = gradingQueue.filter((g) => g.status === "pending" || g.status === "in_progress").slice(0, 5);
  const recentSubmissions = submissionRecords.slice(0, 5);

  return (
    <DashPage role="teacher" title={t("assess.overview")} subtitle="Assessment center — grading, results, and integrity" icon={ROLES.teacher.icon}>
      {/* Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
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

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Pending Queue Preview */}
        <Card className="border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t("assess.gradingQueue")}</h3>
            <Link to="/teacher/assessment/grading-queue" className="text-xs text-primary hover:underline">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {pendingQueue.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors hover:bg-accent/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.studentName}</span>
                    <Badge variant="outline" className={cn("rounded-full text-[10px] px-1.5 py-0", priorityColors[item.priority])}>
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{item.assessment} — {item.course}</p>
                </div>
                <Badge variant="outline" className="rounded-full text-xs">{typeLabels[item.type]}</Badge>
                <Badge variant="outline" className={cn("rounded-full text-xs", statusColors[item.status])}>
                  {item.status === "in_progress" ? "In Progress" : t("assess.pending")}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="border bg-card p-5">
          <h3 className="font-semibold">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            {quickActions.map((a) => (
              <Link key={a.key} to={a.to}
                className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
                <a.icon className="h-4 w-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <span className="block">{t(a.key)}</span>
                  <span className="text-[10px] text-muted-foreground">{a.desc}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Results */}
        <Card className="border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t("assess.results")}</h3>
            <Link to="/teacher/assessment/submissions" className="text-xs text-primary hover:underline">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {recentSubmissions.map((sub) => {
              const pct = Math.round((sub.score / sub.maxScore) * 100);
              return (
                <div key={sub.id} className="flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors hover:bg-accent/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{sub.studentName}</span>
                      <Badge variant="outline" className="rounded-full text-[10px]">{typeLabels[sub.type]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{sub.assessment}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16">
                      <Progress value={pct} className={cn("h-1.5", pct < 50 ? "[&>div]:bg-rose-500" : pct < 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500")} />
                    </div>
                    <span className={cn("text-sm font-semibold tabular-nums", pct < 50 ? "text-rose-500" : pct < 70 ? "text-amber-500" : "text-emerald-500")}>
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Weak Concepts */}
        <Card className="border bg-card p-5">
          <h3 className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Weak Concepts Detected
          </h3>
          <div className="mt-4 space-y-3">
            {weakConcepts.map((wc) => (
              <div key={wc.concept} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{wc.concept}</span>
                  <span className="text-xs text-muted-foreground">{wc.studentCount} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={wc.wrongRate} className="h-1.5 flex-1 [&>div]:bg-rose-500" />
                  <span className="text-xs font-semibold text-rose-500 tabular-nums">{wc.wrongRate}% wrong</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashPage>
  );
}
