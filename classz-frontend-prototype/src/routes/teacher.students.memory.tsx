import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BrainCircuit, Lightbulb, AlertTriangle, Clock, Activity,
  CheckCircle2, ChevronRight, Sparkles,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { useTeacherStudentsStore, useLoadTeacherStudentsData, getMergedStudents, relativeTime } from "@/lib/teacher/teacher-students-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/students/memory")({
  component: MemoryPage,
});

function MemoryPage() {
  const { t } = useApp();
  useLoadTeacherStudentsData();
  const memoryInsights = useTeacherStudentsStore((s) => s.memory);
  const roster = useTeacherStudentsStore((s) => s.roster);
  const progress = useTeacherStudentsStore((s) => s.progress);
  const atRisk = useTeacherStudentsStore((s) => s.atRisk);
  const parents = useTeacherStudentsStore((s) => s.parents);
  const transactions = useTeacherStudentsStore((s) => s.transactions);
  const mockStudents = useMemo(() => getMergedStudents(), [roster, progress, atRisk, parents, transactions]);

  const [selectedId, setSelectedId] = useState(memoryInsights[0]?.student_id || "");

  const insight = memoryInsights.find((m) => m.student_id === selectedId) ?? memoryInsights[0];
  const student = mockStudents.find((s) => s.id === (insight?.student_id ?? selectedId));

  return (
    <DashPage role="teacher" title={t("stu.memory")} subtitle="Concept-level mastery and retention insights derived from quiz results" icon={ROLES.teacher.icon}>
      {/* Student Selector */}
      <Card className="border bg-card p-4">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium">Select Student</p>
          <Select value={insight?.student_id ?? selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-[260px] rounded-xl">
              <SelectValue placeholder="Choose a student..." />
            </SelectTrigger>
            <SelectContent>
              {memoryInsights.map((m) => (
                <SelectItem key={m.student_id} value={m.student_id}>
                  {m.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="rounded-full ms-auto text-xs">
            {memoryInsights.length} students with insights
          </Badge>
        </div>
      </Card>

      {!insight ? (
        <Card className="border border-dashed bg-card p-12 text-center">
          <BrainCircuit className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-medium">No insights available yet</p>
          <p className="text-sm text-muted-foreground mt-1">Insights appear once students have quiz attempts to analyze</p>
        </Card>
      ) : (
        <>
          {/* Student Header */}
          {student && (
            <Card className="border bg-card p-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {student.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{student.name}</h3>
                  <p className="text-sm text-muted-foreground">{student.grade || "—"} &middot; {student.courses.join(", ")}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-bold">{student.avgScore}%</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{student.progress}%</p>
                    <p className="text-xs text-muted-foreground">Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{student.quizAvg}%</p>
                    <p className="text-xs text-muted-foreground">Quiz Avg</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Strengths */}
            <Card className="border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold">{t("stu.strengths")}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {insight.strengths.map((s) => (
                  <Badge key={s} variant="outline" className="rounded-full border-emerald-300 text-emerald-500 bg-emerald-500/10 px-3 py-1">
                    <CheckCircle2 className="h-3 w-3 me-1.5" /> {s}
                  </Badge>
                ))}
              </div>
              {insight.strengths.length === 0 && (
                <p className="text-sm text-muted-foreground">No strengths identified yet</p>
              )}
            </Card>

            {/* Weak Concepts */}
            <Card className="border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold">{t("stu.weakConcepts")}</h3>
              </div>
              <div className="space-y-3">
                {insight.weak_concepts.map((wc) => (
                  <div key={wc.concept} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{wc.concept}</span>
                      <span className={cn("font-semibold",
                        wc.score >= 50 ? "text-amber-500" : "text-rose-500"
                      )}>
                        {wc.score}%
                      </span>
                    </div>
                    <Progress value={wc.score} className="h-2" />
                  </div>
                ))}
                {insight.weak_concepts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No weak concepts identified</p>
                )}
              </div>
            </Card>

            {/* Last Practiced (retention proxy) */}
            <Card className="border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-violet-500" />
                <h3 className="font-semibold">Last Practiced</h3>
              </div>
              <div className="space-y-4">
                {insight.weak_concepts.map((wc) => (
                  <div key={wc.concept} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{wc.concept}</span>
                      <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0">
                        {relativeTime(wc.last_practiced_at)}
                      </Badge>
                    </div>
                  </div>
                ))}
                {insight.weak_concepts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No practice history available</p>
                )}
              </div>
            </Card>

            {/* Activity + Recommendations */}
            <Card className="border bg-card p-5">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-5 w-5 text-cyan-500" />
                    <h3 className="font-semibold">Recent Activity</h3>
                  </div>
                  <Card className="border bg-accent/30 p-3">
                    <p className="text-sm">
                      {student ? `Last active ${relativeTime(student.lastActivityAt)} · ${student.progress}% course progress` : "No activity recorded"}
                    </p>
                  </Card>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold">{t("stu.recommendations")}</h3>
                  </div>
                  <div className="space-y-2">
                    {insight.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 rounded-xl border px-3 py-2.5">
                        <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                    {insight.recommendations.length === 0 && (
                      <p className="text-sm text-muted-foreground">No recommendations yet</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Other Students Quick Nav */}
          <Card className="border bg-card p-5">
            <h3 className="font-semibold mb-3">{t("stu.longTermInsights")} - All Students</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {memoryInsights.map((m) => (
                <button
                  key={m.student_id}
                  onClick={() => setSelectedId(m.student_id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-start transition-colors hover:bg-accent",
                    (insight?.student_id ?? selectedId) === m.student_id && "border-primary bg-primary/5"
                  )}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {m.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{m.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.weak_concepts.length} weak &middot; {m.strengths.length} strengths
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </Card>
        </>
      )}
    </DashPage>
  );
}
