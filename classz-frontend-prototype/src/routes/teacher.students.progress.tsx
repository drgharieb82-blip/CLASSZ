import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  TrendingUp, BookOpen, Clock, BarChart3, CheckCircle2, Activity,
  Calendar, Search,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { useTeacherStudentsStore, useLoadTeacherStudentsData, getMergedStudents, relativeTime, formatWatchTime } from "@/lib/teacher/teacher-students-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/students/progress")({
  component: ProgressDashboardPage,
});

function ProgressDashboardPage() {
  const { t } = useApp();
  useLoadTeacherStudentsData();
  const roster = useTeacherStudentsStore((s) => s.roster);
  const progressRows = useTeacherStudentsStore((s) => s.progress);
  const atRisk = useTeacherStudentsStore((s) => s.atRisk);
  const parents = useTeacherStudentsStore((s) => s.parents);
  const transactions = useTeacherStudentsStore((s) => s.transactions);
  const mockStudents = useMemo(() => getMergedStudents(), [roster, progressRows, atRisk, parents, transactions]);
  const [search, setSearch] = useState("");

  const filtered = search
    ? mockStudents.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : mockStudents;

  const count = mockStudents.length || 1;
  const avgProgress = Math.round(mockStudents.reduce((s, st) => s + st.progress, 0) / count);
  const avgQuiz = Math.round(mockStudents.reduce((s, st) => s + st.quizAvg, 0) / count);
  const avgHW = Math.round(mockStudents.reduce((s, st) => s + st.hwCompletion, 0) / count);
  const totalWatchMinutes = mockStudents.reduce((s, st) => s + st.watchTimeMinutes, 0);
  const sessionsCompleted = roster.reduce((s, r) => s + r.sessions_completed, 0);
  const sessionsTotal = roster.reduce((s, r) => s + r.sessions_total, 0);
  const sessionCompletionRate = sessionsTotal > 0 ? Math.round((sessionsCompleted / sessionsTotal) * 100) : 0;
  const mostRecentActivity = mockStudents.reduce<string | null>((latest, s) => {
    if (!s.lastActivityAt) return latest;
    if (!latest || new Date(s.lastActivityAt) > new Date(latest)) return s.lastActivityAt;
    return latest;
  }, null);

  const summaryCards = [
    { key: "Course Progress", icon: BookOpen, value: `${avgProgress}%`, color: "text-blue-400", bg: "bg-blue-500/10" },
    { key: "Session Completion", icon: CheckCircle2, value: `${sessionCompletionRate}%`, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { key: "Total Watch Time", icon: Clock, value: formatWatchTime(totalWatchMinutes), color: "text-violet-400", bg: "bg-violet-500/10" },
    { key: "Quiz Average", icon: BarChart3, value: `${avgQuiz}%`, color: "text-amber-400", bg: "bg-amber-500/10" },
    { key: "HW Completion", icon: Activity, value: `${avgHW}%`, color: "text-pink-400", bg: "bg-pink-500/10" },
    { key: "Last Activity", icon: Calendar, value: relativeTime(mostRecentActivity), color: "text-cyan-400", bg: "bg-cyan-500/10" },
  ];

  return (
    <DashPage role="teacher" title={t("stu.progress")} subtitle="Detailed progress tracking across all students" icon={ROLES.teacher.icon}>
      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((s) => (
          <Card key={s.key} className="flex items-center gap-3 border bg-card p-4">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="truncate text-xs text-muted-foreground">{s.key}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Progress Table */}
      <Card className="border bg-card overflow-hidden">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl"
            />
          </div>
          <Badge variant="outline" className="rounded-full">{filtered.length} students</Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Student</TableHead>
                <TableHead>Course Progress</TableHead>
                <TableHead>Quiz Avg</TableHead>
                <TableHead>HW Completion</TableHead>
                <TableHead>Watch Time</TableHead>
                <TableHead>{t("stu.lastLogin")}</TableHead>
                <TableHead>Overall</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => {
                const overall = Math.round((student.progress + student.quizAvg + student.hwCompletion) / 3);
                return (
                  <TableRow key={student.id} className="hover:bg-accent/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {student.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.grade || "—"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={student.progress} className="h-2 w-20" />
                        <span className="text-xs font-medium">{student.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={student.quizAvg} className="h-2 w-20" />
                        <span className={cn("text-xs font-medium",
                          student.quizAvg >= 80 ? "text-emerald-500" :
                            student.quizAvg >= 60 ? "text-amber-500" : "text-rose-500"
                        )}>
                          {student.quizAvg > 0 ? `${student.quizAvg}%` : "---"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={student.hwCompletion} className="h-2 w-20" />
                        <span className="text-xs font-medium">{student.hwCompletion}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatWatchTime(student.watchTimeMinutes)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{relativeTime(student.lastActivityAt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full text-xs font-semibold",
                        overall >= 80 ? "border-emerald-300 text-emerald-500 bg-emerald-500/10" :
                          overall >= 60 ? "border-amber-300 text-amber-500 bg-amber-500/10" :
                            "border-rose-300 text-rose-500 bg-rose-500/10"
                      )}>
                        {overall}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    No students yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashPage>
  );
}
