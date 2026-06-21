import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Users, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { teacherStudents } from "@/lib/teacherMock";

export const Route = createFileRoute("/teacher/students")({
  component: StudentsPage,
});

const statusConfig = {
  active: { label: "Active", color: "border-emerald-300 text-emerald-600" },
  "at-risk": { label: "At Risk", color: "border-rose-300 text-rose-600" },
  inactive: { label: "Inactive", color: "border-slate-300 text-slate-500" },
  new: { label: "New", color: "border-blue-300 text-blue-600" },
};

function StudentsPage() {
  const [q, setQ] = useState("");
  const filtered = teacherStudents.filter(
    (s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.studentCode.includes(q),
  );

  const atRisk = teacherStudents.filter((s) => s.status === "at-risk").length;

  return (
    <DashPage role="teacher" title="Students" subtitle="Monitor your learners and their progress" icon={ROLES.teacher.icon}>
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <p className="text-lg font-bold">{teacherStudents.length}</p>
            <p className="text-xs text-muted-foreground">Total Students</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
          <div>
            <p className="text-lg font-bold">{atRisk}</p>
            <p className="text-xs text-muted-foreground">At Risk</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          <div>
            <p className="text-lg font-bold">{Math.round(teacherStudents.reduce((a, s) => a + s.score, 0) / teacherStudents.length)}%</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or code..." className="ps-9 rounded-xl" />
      </div>

      {/* Student List */}
      <div className="space-y-2">
        {filtered.map((student) => {
          const status = statusConfig[student.status];
          return (
            <Card key={student.studentCode} className="flex items-center gap-4 border bg-card px-5 py-4">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {student.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{student.name}</p>
                  <Badge variant="outline" className={cn("rounded-full text-xs", status.color)}>{status.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{student.studentCode} · {student.course}</p>
              </div>
              <div className="hidden items-center gap-6 sm:flex">
                <div className="text-center">
                  <p className="text-sm font-semibold">{student.progress}%</p>
                  <p className="text-xs text-muted-foreground">Progress</p>
                </div>
                <div className="text-center">
                  <p className={cn("text-sm font-semibold", student.score >= 80 ? "text-emerald-600" : student.score >= 60 ? "text-amber-600" : "text-rose-600")}>
                    {student.score > 0 ? `${student.score}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{student.lastActive}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </DashPage>
  );
}
