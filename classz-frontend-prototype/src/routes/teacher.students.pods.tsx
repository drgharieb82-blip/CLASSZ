import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  UsersRound, Users, ChevronDown, ChevronUp, TrendingUp, AlertTriangle,
  BookOpen, Shuffle, Hand, BarChart3,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { mockStudents } from "@/lib/students-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/students/pods")({
  component: StudentPodsPage,
});

const assistantGroups = [
  {
    id: "AT-001",
    name: "Mr. Tarek Nabil",
    groupName: "Alpha Group",
    studentIds: ["STU-001", "STU-002", "STU-004", "STU-007", "STU-010", "STU-012"],
  },
  {
    id: "AT-002",
    name: "Dina Youssef",
    groupName: "Beta Group",
    studentIds: ["STU-003", "STU-006", "STU-009"],
  },
  {
    id: "AT-003",
    name: "Ahmed Kamal",
    groupName: "Gamma Group",
    studentIds: ["STU-005", "STU-008", "STU-011"],
  },
];

const riskColorMap: Record<string, string> = {
  high: "border-rose-300 text-rose-600 bg-rose-500/10",
  medium: "border-amber-300 text-amber-600 bg-amber-500/10",
  low: "border-blue-300 text-blue-600 bg-blue-500/10",
  none: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
};

function StudentPodsPage() {
  const { t } = useApp();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const groupData = assistantGroups.map((group) => {
    const students = group.studentIds
      .map((id) => mockStudents.find((s) => s.id === id))
      .filter(Boolean) as typeof mockStudents;
    const avgProgress = Math.round(
      students.reduce((sum, s) => sum + s.progress, 0) / students.length
    );
    const riskCount = students.filter((s) => s.riskLevel !== "none").length;
    const missingHW = students.filter((s) => s.hwCompletion < 50).length;
    return { ...group, students, avgProgress, riskCount, missingHW };
  });

  const totalStudents = mockStudents.length;
  const totalAssigned = groupData.reduce((s, g) => s + g.students.length, 0);

  return (
    <DashPage
      role="teacher"
      title={t("stu.pods")}
      subtitle="Manage assistant teacher groups and student distribution"
      icon={ROLES.teacher.icon}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl gap-1.5">
            <Shuffle className="h-4 w-4" /> {t("team.autoDistribute")}
          </Button>
          <Button variant="outline" className="rounded-xl gap-1.5">
            <Hand className="h-4 w-4" /> {t("team.manualAssign")}
          </Button>
        </div>
      }
    >
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10">
            <UsersRound className="h-5 w-5 text-blue-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{assistantGroups.length}</p>
            <p className="text-xs text-muted-foreground">Assistant Teachers</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10">
            <Users className="h-5 w-5 text-emerald-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{totalAssigned}/{totalStudents}</p>
            <p className="text-xs text-muted-foreground">Students Assigned</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10">
            <BarChart3 className="h-5 w-5 text-amber-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">
              {Math.round(groupData.reduce((s, g) => s + g.avgProgress, 0) / groupData.length)}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Group Progress</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">
              {groupData.reduce((s, g) => s + g.riskCount, 0)}
            </p>
            <p className="text-xs text-muted-foreground">At-Risk Students</p>
          </div>
        </Card>
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {groupData.map((group) => (
          <Card key={group.id} className="border bg-card overflow-hidden">
            {/* Group Header */}
            <button
              className="flex w-full items-center gap-4 p-5 text-start transition-colors hover:bg-accent/30"
              onClick={() => toggle(group.id)}
            >
              <Avatar className="h-11 w-11 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {group.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{group.name}</p>
                  <Badge variant="outline" className="rounded-full text-xs">{group.groupName}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {group.students.length} students
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {group.avgProgress}% avg progress
                  </span>
                  {group.riskCount > 0 && (
                    <span className="flex items-center gap-1 text-rose-500">
                      <AlertTriangle className="h-3 w-3" /> {group.riskCount} at-risk
                    </span>
                  )}
                  {group.missingHW > 0 && (
                    <span className="flex items-center gap-1 text-amber-500">
                      <BookOpen className="h-3 w-3" /> {group.missingHW} {t("stu.missingHW")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex items-center gap-2">
                  <Progress value={group.avgProgress} className="h-2 w-24" />
                  <span className="text-sm font-semibold">{group.avgProgress}%</span>
                </div>
                {expanded[group.id] ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Expanded Students */}
            {expanded[group.id] && (
              <div className="border-t">
                <div className="divide-y">
                  {group.students.map((student) => (
                    <div key={student.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {student.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{student.name}</p>
                          <Badge variant="outline" className={cn("rounded-full text-[10px] px-1.5 py-0", riskColorMap[student.riskLevel])}>
                            {t(`stu.${student.riskLevel}`)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{student.grade} &middot; {student.courses.join(", ")}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-6 shrink-0">
                        <div className="flex items-center gap-2">
                          <Progress value={student.progress} className="h-2 w-16" />
                          <span className="text-xs font-medium w-8 text-end">{student.progress}%</span>
                        </div>
                        <div className="text-center w-14">
                          <p className={cn("text-sm font-semibold",
                            student.avgScore >= 80 ? "text-emerald-500" :
                              student.avgScore >= 60 ? "text-amber-500" : "text-rose-500"
                          )}>
                            {student.avgScore > 0 ? `${student.avgScore}%` : "---"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Score</p>
                        </div>
                        <div className="text-center w-14">
                          <p className="text-sm font-semibold">{student.hwCompletion}%</p>
                          <p className="text-[10px] text-muted-foreground">HW</p>
                        </div>
                        <p className="text-xs text-muted-foreground w-16 text-end">{student.lastLogin}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </DashPage>
  );
}
