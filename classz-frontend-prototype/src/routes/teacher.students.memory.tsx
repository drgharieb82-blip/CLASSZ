import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BrainCircuit, Lightbulb, AlertTriangle, Clock, Eye,
  CheckCircle2, ChevronRight, Sparkles, BarChart3,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { memoryInsights, mockStudents } from "@/lib/students-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/students/memory")({
  component: MemoryPage,
});

function MemoryPage() {
  const { t } = useApp();
  const [selectedId, setSelectedId] = useState(memoryInsights[0]?.studentId || "");

  const insight = memoryInsights.find((m) => m.studentId === selectedId);
  const student = mockStudents.find((s) => s.id === selectedId);

  return (
    <DashPage role="teacher" title={t("stu.memory")} subtitle="AI-driven insights into student learning patterns and memory retention" icon={ROLES.teacher.icon}>
      {/* Student Selector */}
      <Card className="border bg-card p-4">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium">Select Student</p>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-[260px] rounded-xl">
              <SelectValue placeholder="Choose a student..." />
            </SelectTrigger>
            <SelectContent>
              {memoryInsights.map((m) => (
                <SelectItem key={m.studentId} value={m.studentId}>
                  {m.studentName} ({m.studentId})
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
          <p className="text-lg font-medium">No insights available</p>
          <p className="text-sm text-muted-foreground mt-1">Select a student to view memory and weakness analysis</p>
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
                  <p className="text-sm text-muted-foreground">{student.grade} &middot; {student.courses.join(", ")}</p>
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
                {insight.weakConcepts.map((wc) => (
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
                {insight.weakConcepts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No weak concepts identified</p>
                )}
              </div>
            </Card>

            {/* Forgetting Curve */}
            <Card className="border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-violet-500" />
                <h3 className="font-semibold">{t("stu.forgettingCurve")}</h3>
              </div>
              <div className="space-y-4">
                {insight.forgettingCurve.map((fc) => (
                  <div key={fc.concept} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{fc.concept}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0">
                          {fc.daysSince}d ago
                        </Badge>
                        <span className={cn("font-semibold",
                          fc.retention >= 60 ? "text-emerald-500" :
                            fc.retention >= 40 ? "text-amber-500" : "text-rose-500"
                        )}>
                          {fc.retention}%
                        </span>
                      </div>
                    </div>
                    <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("absolute inset-y-0 start-0 rounded-full transition-all",
                          fc.retention >= 60 ? "bg-emerald-500" :
                            fc.retention >= 40 ? "bg-amber-500" : "bg-rose-500"
                        )}
                        style={{ width: `${fc.retention}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Retention after {fc.daysSince} days since last review
                    </p>
                  </div>
                ))}
                {insight.forgettingCurve.length === 0 && (
                  <p className="text-sm text-muted-foreground">No forgetting curve data available</p>
                )}
              </div>
            </Card>

            {/* Attention Pattern + Recommendations */}
            <Card className="border bg-card p-5">
              <div className="space-y-4">
                {/* Attention Pattern */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-5 w-5 text-cyan-500" />
                    <h3 className="font-semibold">{t("stu.attentionPattern")}</h3>
                  </div>
                  <Card className="border bg-accent/30 p-3">
                    <p className="text-sm">{insight.attentionPattern}</p>
                  </Card>
                </div>

                <Separator />

                {/* Recommendations */}
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
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Other Students Quick Nav */}
          <Card className="border bg-card p-5">
            <h3 className="font-semibold mb-3">{t("stu.longTermInsights")} - All Students</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {memoryInsights.map((m) => {
                const s = mockStudents.find((st) => st.id === m.studentId);
                return (
                  <button
                    key={m.studentId}
                    onClick={() => setSelectedId(m.studentId)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-start transition-colors hover:bg-accent",
                      selectedId === m.studentId && "border-primary bg-primary/5"
                    )}
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {m.studentName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{m.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.weakConcepts.length} weak &middot; {m.strengths.length} strengths
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </DashPage>
  );
}
