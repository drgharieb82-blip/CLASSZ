import { createFileRoute } from "@tanstack/react-router";
import { Clock, ClipboardList, Plus, Users, BarChart3 } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/teacher/quizzes")({
  component: QuizzesPage,
});

const mockQuizzes = [
  { id: "QZ-26-0001", title: "Derivatives Quick Quiz", type: "quick" as const, questions: 10, duration: "10 min", attempts: 456, avgScore: 78, status: "active" as const },
  { id: "QZ-26-0002", title: "Calculus Mid-term Exam", type: "exam" as const, questions: 40, duration: "90 min", attempts: 320, avgScore: 72, status: "active" as const },
  { id: "QZ-26-0003", title: "Integration Practice", type: "quick" as const, questions: 15, duration: "15 min", attempts: 280, avgScore: 65, status: "active" as const },
  { id: "QZ-26-0004", title: "Calculus Final Exam 2026", type: "exam" as const, questions: 60, duration: "120 min", attempts: 0, avgScore: 0, status: "scheduled" as const },
];

function QuizzesPage() {
  return (
    <DashPage role="teacher" title="Quizzes & Exams" subtitle="Create, manage, and analyze assessments" icon={ROLES.teacher.icon}>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge variant="outline" className="rounded-full">{mockQuizzes.filter((q) => q.type === "quick").length} Quick Quizzes</Badge>
          <Badge variant="outline" className="rounded-full">{mockQuizzes.filter((q) => q.type === "exam").length} Exams</Badge>
        </div>
        <Button className="rounded-xl gradient-brand border-0 text-white" size="sm">
          <Plus className="me-1.5 h-4 w-4" /> Create Assessment
        </Button>
      </div>

      <div className="space-y-3">
        {mockQuizzes.map((quiz) => (
          <Card key={quiz.id} className="border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{quiz.title}</h3>
                  <Badge variant="outline" className={`rounded-full text-xs ${quiz.type === "exam" ? "border-violet-300 text-violet-600" : "border-blue-300 text-blue-600"}`}>
                    {quiz.type === "exam" ? "Full Exam" : "Quick Quiz"}
                  </Badge>
                  <Badge variant="outline" className={`rounded-full text-xs ${quiz.status === "active" ? "border-emerald-300 text-emerald-600" : "text-muted-foreground"}`}>
                    {quiz.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{quiz.id}</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">
                <BarChart3 className="me-1.5 h-3.5 w-3.5" /> Analytics
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> {quiz.questions} questions</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {quiz.duration}</span>
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {quiz.attempts} attempts</span>
              {quiz.avgScore > 0 && <span className="flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Avg: {quiz.avgScore}%</span>}
            </div>
          </Card>
        ))}
      </div>
    </DashPage>
  );
}
