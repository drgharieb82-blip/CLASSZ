import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users, AlertTriangle, BookOpen, FileX, Shuffle, Hand,
  GripVertical, ChevronDown, ChevronRight,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { studentPods } from "@/lib/team-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/team/student-pods")({
  component: StudentPodsPage,
});

function StudentPodsPage() {
  const { t } = useApp();
  const [expandedPod, setExpandedPod] = useState<string | null>(studentPods[0]?.id ?? null);
  const [assignMode, setAssignMode] = useState<"auto" | "manual">("auto");

  const totalStudents = studentPods.reduce((s, p) => s + p.studentCount, 0);
  const totalRisk = studentPods.reduce((s, p) => s + p.riskCount, 0);
  const avgCompletion = Math.round(studentPods.reduce((s, p) => s + p.completionAvg, 0) / studentPods.length);

  return (
    <DashPage role="teacher" title={t("team.studentPods")} subtitle={`${studentPods.length} groups · ${totalStudents} students`} icon={ROLES.teacher.icon}>
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10">
            <Users className="h-5 w-5 text-blue-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{totalStudents}</p>
            <p className="text-xs text-muted-foreground">{t("team.studentCount")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/10">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{totalRisk}</p>
            <p className="text-xs text-muted-foreground">{t("team.riskSummary")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10">
            <BookOpen className="h-5 w-5 text-emerald-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{avgCompletion}%</p>
            <p className="text-xs text-muted-foreground">{t("team.completionAvg")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10">
            <FileX className="h-5 w-5 text-amber-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">{studentPods.reduce((s, p) => s + p.unsubmittedHW, 0)}</p>
            <p className="text-xs text-muted-foreground">{t("team.unsubmittedHW")}</p>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Button variant={assignMode === "auto" ? "default" : "outline"} size="sm" className="rounded-xl"
          onClick={() => setAssignMode("auto")}>
          <Shuffle className="me-1.5 h-3.5 w-3.5" /> {t("team.autoDistribute")}
        </Button>
        <Button variant={assignMode === "manual" ? "default" : "outline"} size="sm" className="rounded-xl"
          onClick={() => setAssignMode("manual")}>
          <Hand className="me-1.5 h-3.5 w-3.5" /> {t("team.manualAssign")}
        </Button>
        {assignMode === "manual" && (
          <Select>
            <SelectTrigger className="w-[200px] rounded-xl"><SelectValue placeholder="Select assistant..." /></SelectTrigger>
            <SelectContent>
              {studentPods.map((p) => (
                <SelectItem key={p.assistantId} value={p.assistantId}>{p.assistantName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-4">
        {studentPods.map((pod) => {
          const isExpanded = expandedPod === pod.id;
          return (
            <Card key={pod.id} className="border bg-card overflow-hidden">
              <button
                className="flex w-full items-center gap-4 p-4 text-start transition-colors hover:bg-accent/30"
                onClick={() => setExpandedPod(isExpanded ? null : pod.id)}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {pod.assistantName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{pod.name}</span>
                    <Badge variant="outline" className="rounded-full text-xs">{pod.assistantName}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {pod.studentCount} students</span>
                    <span className="flex items-center gap-1 text-rose-500"><AlertTriangle className="h-3 w-3" /> {pod.riskCount} at-risk</span>
                    <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {pod.completionAvg}% avg</span>
                    <span className="flex items-center gap-1"><FileX className="h-3 w-3" /> {pod.unsubmittedHW} unsubmitted</span>
                  </div>
                </div>
                <Progress value={pod.completionAvg} className="h-2 w-24 hidden sm:block" />
                {isExpanded ? <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <div className="border-t">
                  <div className="divide-y">
                    {pod.students.map((student) => (
                      <div key={student.id} className={cn("flex items-center gap-3 px-4 py-3 transition-colors", assignMode === "manual" && "cursor-grab hover:bg-accent/30")}>
                        {assignMode === "manual" && <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />}
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className={cn("text-xs font-bold", student.risk ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary")}>
                            {student.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{student.name}</span>
                            {student.risk && <Badge className="rounded-full bg-rose-500/10 text-rose-500 border-0 text-[10px] px-1.5 py-0">At Risk</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Progress value={student.progress} className={cn("h-1.5 w-20", student.risk && "[&>div]:bg-rose-500")} />
                          <span className={cn("text-xs font-medium w-8 text-end", student.risk ? "text-rose-500" : "text-muted-foreground")}>{student.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground text-center">
                    Showing {pod.students.length} of {pod.studentCount} students
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </DashPage>
  );
}
