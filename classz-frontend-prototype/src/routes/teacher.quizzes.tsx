import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Clock, ClipboardList, Copy, HelpCircle, Plus, Sparkles, Trash2, Upload } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { useTeacherQuizStore, type TeacherQuiz } from "@/lib/teacher/teacher-quiz-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";

export const Route = createFileRoute("/teacher/quizzes")({
  component: QuizzesPage,
});

const PAGE_SIZE = 10;

const typeLabels: Record<string, string> = {
  practice: "Practice", session_quiz: "Session Quiz", revision: "Revision",
  homework_quiz: "Homework", checkpoint: "Checkpoint", exam_prep: "Exam Prep", standalone: "Standalone",
};

function QuizzesPage() {
  const quizzes = useTeacherQuizStore((s) => s.quizzes);
  const courses = useTeacherCourseStore((s) => s.courses);
  const deleteQuiz = useTeacherQuizStore((s) => s.deleteQuiz);
  const publishQuiz = useTeacherQuizStore((s) => s.publishQuiz);
  const duplicateQuiz = useTeacherQuizStore((s) => s.duplicateQuiz);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const filterOptions: FilterOption[] = [
    { key: "type", label: "Type", options: Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l })) },
    { key: "status", label: "Status", options: [
      { value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" },
    ]},
    { key: "course", label: "Course", options: courses.map((c) => ({ value: c.id, label: c.title })) },
  ];

  const filtered = useMemo(() => {
    let result = [...quizzes];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((qz) => qz.title.toLowerCase().includes(q) || qz.publicCode.includes(q));
    }
    if (filters.type) result = result.filter((q) => q.quizType === filters.type);
    if (filters.status) result = result.filter((q) => q.status === filters.status);
    if (filters.course) result = result.filter((q) => q.courseId === filters.course);
    return result;
  }, [quizzes, search, filters]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <DashPage role="teacher" title="Quizzes & Exams" subtitle="Create, manage, and attach quizzes to sessions" icon={ROLES.teacher.icon}>
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="rounded-full">{quizzes.length} quizzes</Badge>
        <Button asChild className="rounded-xl gradient-brand border-0 text-white" size="sm">
          <Link to="/teacher/quizzes/create"><Plus className="me-1.5 h-4 w-4" /> Create Quiz</Link>
        </Button>
      </div>

      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }}
        onClearFilters={() => { setFilters({}); setPage(1); }}
        totalResults={total}
        placeholder="Search quizzes..."
      />

      {total === 0 && quizzes.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No quizzes yet</h2>
          <p className="text-sm text-muted-foreground">Create quizzes from your question bank.</p>
          <Button asChild className="rounded-xl gradient-brand border-0 text-white">
            <Link to="/teacher/quizzes/create"><Plus className="me-1.5 h-4 w-4" /> Create Quiz</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {paginated.map((quiz) => (
            <Card key={quiz.id} className="flex items-center gap-4 border bg-card px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{quiz.title}</p>
                  <Badge variant="outline" className={cn("rounded-full text-xs", quiz.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{quiz.status}</Badge>
                  <Badge variant="outline" className="rounded-full text-xs">{typeLabels[quiz.quizType]}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {quiz.publicCode} · {quiz.questionIds.length} questions · {quiz.durationMinutes} min · +{quiz.xpReward} XP
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button asChild variant="outline" size="sm" className="rounded-lg text-xs h-8">
                  <Link to="/teacher/quizzes/$quizId/edit" params={{ quizId: quiz.id }}>Edit</Link>
                </Button>
                {quiz.status === "draft" && quiz.questionIds.length > 0 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => publishQuiz(quiz.id)}><Upload className="h-3.5 w-3.5 text-emerald-600" /></Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => duplicateQuiz(quiz.id)}><Copy className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => deleteQuiz(quiz.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </DashPage>
  );
}
