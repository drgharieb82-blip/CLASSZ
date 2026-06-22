import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Calendar, ClipboardList, Plus, Trash2, Upload } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { useTeacherHomeworkStore } from "@/lib/teacher/teacher-homework-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";

export const Route = createFileRoute("/teacher/homework")({ component: HomeworkPage });

const PAGE_SIZE = 10;
const typeLabels: Record<string, string> = { worksheet: "Worksheet", essay: "Essay", file_upload: "File Upload", mixed: "Mixed" };

function HomeworkPage() {
  const items = useTeacherHomeworkStore((s) => s.items);
  const courses = useTeacherCourseStore((s) => s.courses);
  const deleteHomework = useTeacherHomeworkStore((s) => s.deleteHomework);
  const publishHomework = useTeacherHomeworkStore((s) => s.publishHomework);
  const [search, setSearch] = useState(""); const [filters, setFilters] = useState<Record<string, string>>({}); const [page, setPage] = useState(1);

  const filterOptions: FilterOption[] = [
    { key: "type", label: "Type", options: Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l })) },
    { key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }] },
    { key: "course", label: "Course", options: courses.map((c) => ({ value: c.id, label: c.title })) },
  ];

  const filtered = useMemo(() => {
    let r = [...items];
    if (search) { const q = search.toLowerCase(); r = r.filter((h) => h.title.toLowerCase().includes(q)); }
    if (filters.type) r = r.filter((h) => h.homeworkType === filters.type);
    if (filters.status) r = r.filter((h) => h.status === filters.status);
    if (filters.course) r = r.filter((h) => h.courseId === filters.course);
    return r;
  }, [items, search, filters]);
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <DashPage role="teacher" title="Homework" subtitle="Create and manage student homework" icon={ROLES.teacher.icon}>
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="rounded-full">{items.length} homework</Badge>
        <Button asChild className="rounded-xl gradient-brand border-0 text-white" size="sm"><Link to="/teacher/homework/create"><Plus className="me-1.5 h-4 w-4" /> Create Homework</Link></Button>
      </div>
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} filters={filterOptions} activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }} onClearFilters={() => { setFilters({}); setPage(1); }} totalResults={total} placeholder="Search homework..." />
      {total === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center"><ClipboardList className="h-12 w-12 text-muted-foreground" /><h2 className="text-lg font-semibold">{items.length === 0 ? "No homework yet" : "No match"}</h2></Card>
      ) : (
        <div className="space-y-2">{paginated.map((hw) => (
          <Card key={hw.id} className="flex items-center gap-4 border bg-card px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><p className="font-semibold truncate">{hw.title}</p>
                <Badge variant="outline" className={cn("rounded-full text-xs", hw.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{hw.status}</Badge>
                <Badge variant="outline" className="rounded-full text-xs">{typeLabels[hw.homeworkType]}</Badge></div>
              <p className="text-xs text-muted-foreground mt-0.5">{hw.publicCode}{hw.dueDate ? ` · Due ${hw.dueDate}` : ""}{hw.xpReward ? ` · +${hw.xpReward} XP` : ""}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {hw.status === "draft" && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => publishHomework(hw.id)}><Upload className="h-3.5 w-3.5 text-emerald-600" /></Button>}
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => deleteHomework(hw.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </Card>
        ))}</div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </DashPage>
  );
}
