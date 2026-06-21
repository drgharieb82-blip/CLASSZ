import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { BookOpen, Copy, HelpCircle, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { useTeacherQuestionStore, type TeacherQuestion } from "@/lib/teacher/teacher-question-store";
import { listChapters } from "@/lib/teacher/teacher-chapter-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";

export const Route = createFileRoute("/teacher/questions")({
  component: QuestionBankPage,
});

const PAGE_SIZE = 15;

const typeColors: Record<string, string> = {
  mcq: "bg-blue-500/10 text-blue-600 border-blue-300",
  essay: "bg-violet-500/10 text-violet-600 border-violet-300",
  calculation: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
};

const diffColors: Record<string, string> = {
  easy: "text-emerald-600",
  medium: "text-amber-600",
  hard: "text-rose-600",
};

function QuestionBankPage() {
  const questions = useTeacherQuestionStore((s) => s.questions);
  const courses = useTeacherCourseStore((s) => s.courses);
  const deleteQuestion = useTeacherQuestionStore((s) => s.deleteQuestion);
  const publishQuestion = useTeacherQuestionStore((s) => s.publishQuestion);
  const duplicateQuestion = useTeacherQuestionStore((s) => s.duplicateQuestion);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const filterOptions: FilterOption[] = [
    { key: "type", label: "Type", options: [
      { value: "mcq", label: "MCQ" },
      { value: "essay", label: "Essay" },
      { value: "calculation", label: "Calculation" },
    ]},
    { key: "difficulty", label: "Difficulty", options: [
      { value: "easy", label: "Easy" },
      { value: "medium", label: "Medium" },
      { value: "hard", label: "Hard" },
    ]},
    { key: "status", label: "Status", options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
      { value: "archived", label: "Archived" },
    ]},
    { key: "course", label: "Course", options: courses.map((c) => ({ value: c.id, label: c.title })) },
  ];

  const filtered = useMemo(() => {
    let result = [...questions];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((qn) => qn.text.toLowerCase().includes(q) || qn.publicCode.includes(q) || qn.concept.toLowerCase().includes(q));
    }
    if (filters.type) result = result.filter((q) => q.type === filters.type);
    if (filters.difficulty) result = result.filter((q) => q.difficulty === filters.difficulty);
    if (filters.status) result = result.filter((q) => q.status === filters.status);
    if (filters.course) result = result.filter((q) => q.courseId === filters.course);
    return result;
  }, [questions, search, filters]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <DashPage role="teacher" title="Question Bank" subtitle="Create and manage questions for quizzes and exams" icon={ROLES.teacher.icon}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="rounded-full">{questions.length} questions</Badge>
          <Badge variant="outline" className="rounded-full text-blue-600 border-blue-300">{questions.filter((q) => q.type === "mcq").length} MCQ</Badge>
          <Badge variant="outline" className="rounded-full text-violet-600 border-violet-300">{questions.filter((q) => q.type === "essay").length} Essay</Badge>
          <Badge variant="outline" className="rounded-full text-emerald-600 border-emerald-300">{questions.filter((q) => q.type === "calculation").length} Calc</Badge>
        </div>
        <Button asChild className="rounded-xl gradient-brand border-0 text-white" size="sm">
          <Link to="/teacher/questions/create"><Plus className="me-1.5 h-4 w-4" /> Create Question</Link>
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
        placeholder="Search by text, concept, or code..."
      />

      {total === 0 && questions.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No questions yet</h2>
          <p className="text-sm text-muted-foreground">Build your question bank for quizzes and exams.</p>
          <Button asChild className="rounded-xl gradient-brand border-0 text-white">
            <Link to="/teacher/questions/create"><Plus className="me-1.5 h-4 w-4" /> Create Question</Link>
          </Button>
        </Card>
      ) : total === 0 ? (
        <Card className="border bg-card p-8 text-center">
          <p className="text-muted-foreground">No questions match your filters.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {paginated.map((q) => (
            <Card key={q.id} className="flex items-start gap-3 border bg-card px-5 py-4">
              <Badge variant="outline" className={cn("mt-0.5 rounded-full text-xs shrink-0", typeColors[q.type])}>{q.type.toUpperCase()}</Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium line-clamp-2">{q.text}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className={cn("font-medium", diffColors[q.difficulty])}>{q.difficulty}</span>
                  {q.concept && <span>· {q.concept}</span>}
                  <span>· {q.publicCode}</span>
                  {q.tags.length > 0 && <span>· {q.tags.slice(0, 3).join(", ")}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Badge variant="outline" className={cn("rounded-full text-xs", q.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{q.status}</Badge>
                {q.status === "draft" && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => publishQuestion(q.id)}><Upload className="h-3.5 w-3.5 text-emerald-600" /></Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => duplicateQuestion(q.id)}><Copy className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => deleteQuestion(q.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </DashPage>
  );
}
