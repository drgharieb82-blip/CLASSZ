import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  AlertTriangle, Bell, BookOpen, TrendingDown,
  MessageSquare, Clock, Users,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { useTeacherStudentsStore, useLoadTeacherStudentsData, getMergedStudents, relativeTime, formatWatchTime } from "@/lib/teacher/teacher-students-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/students/at-risk")({
  component: AtRiskPage,
});

const riskColorMap: Record<string, string> = {
  high: "border-rose-300 text-rose-600 bg-rose-500/10",
  medium: "border-amber-300 text-amber-600 bg-amber-500/10",
  low: "border-blue-300 text-blue-600 bg-blue-500/10",
};

const riskReasonIcons: Record<string, typeof AlertTriangle> = {
  "Falling grades": TrendingDown,
  "Missing homework": BookOpen,
  "Low completion": Clock,
  "No login": Users,
  "Failed quizzes": AlertTriangle,
};

function AtRiskPage() {
  const { t } = useApp();
  useLoadTeacherStudentsData();
  const roster = useTeacherStudentsStore((s) => s.roster);
  const progress = useTeacherStudentsStore((s) => s.progress);
  const atRisk = useTeacherStudentsStore((s) => s.atRisk);
  const parents = useTeacherStudentsStore((s) => s.parents);
  const transactions = useTeacherStudentsStore((s) => s.transactions);
  const mockStudents = useMemo(() => getMergedStudents(), [roster, progress, atRisk, parents, transactions]);

  const atRiskStudents = useMemo(
    () => mockStudents.filter((s) => s.riskLevel !== "none"),
    [mockStudents]
  );

  const highCount = atRiskStudents.filter((s) => s.riskLevel === "high").length;
  const mediumCount = atRiskStudents.filter((s) => s.riskLevel === "medium").length;
  const lowCount = atRiskStudents.filter((s) => s.riskLevel === "low").length;

  return (
    <DashPage role="teacher" title={t("stu.atRisk")} subtitle="Students who need immediate attention and intervention" icon={ROLES.teacher.icon}>
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{atRiskStudents.length}</p>
            <p className="text-xs text-muted-foreground">Total At-Risk</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4 border-rose-500/20">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </span>
          <div>
            <p className="text-2xl font-bold text-rose-500">{highCount}</p>
            <p className="text-xs text-muted-foreground">{t("stu.high")} Risk</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4 border-amber-500/20">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </span>
          <div>
            <p className="text-2xl font-bold text-amber-500">{mediumCount}</p>
            <p className="text-xs text-muted-foreground">{t("stu.medium")} Risk</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4 border-blue-500/20">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10">
            <AlertTriangle className="h-5 w-5 text-blue-500" />
          </span>
          <div>
            <p className="text-2xl font-bold text-blue-500">{lowCount}</p>
            <p className="text-xs text-muted-foreground">{t("stu.low")} Risk</p>
          </div>
        </Card>
      </div>

      {/* Student Cards */}
      <div className="space-y-4">
        {atRiskStudents
          .sort((a, b) => {
            const order: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 };
            return order[a.riskLevel] - order[b.riskLevel];
          })
          .map((student) => (
            <Card key={student.id} className={cn("border bg-card p-5",
              student.riskLevel === "high" && "border-rose-500/30",
              student.riskLevel === "medium" && "border-amber-500/30"
            )}>
              {/* Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarFallback className={cn("text-lg font-bold",
                    student.riskLevel === "high" ? "bg-rose-500/10 text-rose-500" :
                      student.riskLevel === "medium" ? "bg-amber-500/10 text-amber-500" :
                        "bg-blue-500/10 text-blue-500"
                  )}>
                    {student.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{student.name}</h3>
                    <Badge variant="outline" className={cn("rounded-full text-xs", riskColorMap[student.riskLevel])}>
                      {t(`stu.${student.riskLevel}`)} Risk
                    </Badge>
                    <Badge variant="outline" className="rounded-full text-xs">{student.grade || "—"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {student.id.slice(0, 8)} &middot; {student.courses.join(", ")}
                  </p>
                </div>
                <div className="text-end shrink-0">
                  <p className="text-xs text-muted-foreground">{t("stu.lastLogin")}</p>
                  <p className="text-sm font-medium">{relativeTime(student.lastActivityAt)}</p>
                </div>
              </div>

              {/* Risk Reasons */}
              <div className="flex flex-wrap gap-2 mt-4">
                {student.riskReasons.map((reason) => {
                  const ReasonIcon = riskReasonIcons[reason] || AlertTriangle;
                  return (
                    <Badge key={reason} variant="outline" className={cn("rounded-full gap-1",
                      student.riskLevel === "high" ? "border-rose-200 text-rose-500 bg-rose-500/5" :
                        student.riskLevel === "medium" ? "border-amber-200 text-amber-500 bg-amber-500/5" :
                          "border-blue-200 text-blue-500 bg-blue-500/5"
                    )}>
                      <ReasonIcon className="h-3 w-3" />
                      {reason}
                    </Badge>
                  );
                })}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Progress</p>
                  <div className="flex items-center gap-2">
                    <Progress value={student.progress} className="h-2 flex-1" />
                    <span className="text-sm font-semibold">{student.progress}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                  <p className={cn("text-lg font-bold",
                    student.avgScore >= 80 ? "text-emerald-500" :
                      student.avgScore >= 60 ? "text-amber-500" : "text-rose-500"
                  )}>
                    {student.avgScore > 0 ? `${student.avgScore}%` : "---"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">HW Completion</p>
                  <p className="text-lg font-bold">{student.hwCompletion}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Quiz Avg</p>
                  <p className="text-lg font-bold">{student.quizAvg > 0 ? `${student.quizAvg}%` : "---"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Watch Time</p>
                  <p className="text-lg font-bold">{formatWatchTime(student.watchTimeMinutes)}</p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" /> Contact Student
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
                  <Bell className="h-3.5 w-3.5" /> {t("stu.notifyParent")}
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> {t("stu.createRevisionPlan")}
                </Button>
              </div>
            </Card>
          ))}
      </div>

      {/* Empty State */}
      {atRiskStudents.length === 0 && (
        <Card className="border border-dashed bg-card p-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-medium">No at-risk students</p>
          <p className="text-sm text-muted-foreground mt-1">All students are performing within expected ranges</p>
        </Card>
      )}
    </DashPage>
  );
}
