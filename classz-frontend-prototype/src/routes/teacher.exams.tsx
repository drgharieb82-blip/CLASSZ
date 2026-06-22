import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { BookOpen, Copy, Plus, Trash2, Upload } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { useTeacherExamStore } from "@/lib/teacher/teacher-exam-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";

export const Route = createFileRoute("/teacher/exams")({ component: ExamsPage });

const PAGE_SIZE = 10;
const typeLabels: Record<string, string> = { periodic: "Periodic", weekly: "Weekly", monthly: "Monthly", final: "Final", mock: "Mock", custom: "Custom" };

function ExamsPage() {
  const exams = useTeacherExamStore((s) => s.exams);
  const courses = useTeacherCourseStore((s) => s.courses);
  const deleteExam = useTeacherExamStore((s) => s.deleteExam);
  const publishExam = useTeacherExamStore((s) => s.publishExam);
  const [search, setSearch] = useState(""); const [filters, setFilters] = useState<Record<string, string>>({}); const [page, setPage] = useState(1);

  const filterOptions: FilterOption[] = [
    { key: "type", label: "Type", options: Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l })) },
    { key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }] },
    { key: "course", label: "Course", options: courses.map((c) => ({ value: c.id, label: c.title })) },
  ];

  const filtered = useMemo(() => {
    let r = [...exams];
    if (search) { const q = search.toLowerCase(); r = r.filter((e) => e.title.toLowerCase().includes(q) || e.publicCode.includes(q)); }
    if (filters.type) r = r.filter((e) => e.examType === filters.type);
    if (filters.status) r = r.filter((e) => e.status === filters.status);
    if (filters.course) r = r.filter((e) => e.courseId === filters.course);
    return r;
  }, [exams, search, filters]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <DashPage role="teacher" title="Exams" subtitle="Create and manage course exams" icon={ROLES.teacher.icon}>
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="rounded-full">{exams.length} exams</Badge>
        <Button asChild className="rounded-xl gradient-brand border-0 text-white" size="sm"><Link to="/teacher/exams/create"><Plus className="me-1.5 h-4 w-4" /> Create Exam</Link></Button>
      </div>
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} filters={filterOptions} activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }} onClearFilters={() => { setFilters({}); setPage(1); }} totalResults={total} placeholder="Search exams..." />
      {total === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center"><BookOpen className="h-12 w-12 text-muted-foreground" /><h2 className="text-lg font-semibold">{exams.length === 0 ? "No exams yet" : "No exams match"}</h2></Card>
      ) : (
        <div className="space-y-2">{paginated.map((exam) => (
          <Card key={exam.id} className="flex items-center gap-4 border bg-card px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><p className="font-semibold truncate">{exam.title}</p>
                <Badge variant="outline" className={cn("rounded-full text-xs", exam.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{exam.status}</Badge>
                <Badge variant="outline" className="rounded-full text-xs">{typeLabels[exam.examType]}</Badge></div>
              <p className="text-xs text-muted-foreground mt-0.5">{exam.publicCode} · {exam.questionIds.length} Q · {exam.durationMinutes}m · +{exam.examXpReward} XP</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button asChild variant="outline" size="sm" className="rounded-lg text-xs h-8"><Link to="/teacher/exams/$examId/edit" params={{ examId: exam.id }}>Edit</Link></Button>
              {exam.status === "draft" && exam.questionIds.length > 0 && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => publishExam(exam.id)}><Upload className="h-3.5 w-3.5 text-emerald-600" /></Button>}
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => deleteExam(exam.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </Card>
        ))}</div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </DashPage>
  );
}
