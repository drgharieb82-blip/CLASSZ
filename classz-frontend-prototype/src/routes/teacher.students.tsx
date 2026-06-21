import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AlertTriangle, Download, TrendingUp, Users } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { COUNTRIES } from "@/lib/i18n/countries";
import { teacherStudents } from "@/lib/teacherMock";

export const Route = createFileRoute("/teacher/students")({
  component: StudentsPage,
});

const PAGE_SIZE = 10;

const statusConfig = {
  active: { label: "Active", color: "border-emerald-300 text-emerald-600" },
  "at-risk": { label: "At Risk", color: "border-rose-300 text-rose-600" },
  inactive: { label: "Inactive", color: "border-slate-300 text-slate-500" },
  new: { label: "New", color: "border-blue-300 text-blue-600" },
};

const filterOptions: FilterOption[] = [
  { key: "country", label: "Country", options: COUNTRIES.map((c) => ({ value: c.code, label: c.name })) },
  { key: "status", label: "Status", options: [
    { value: "active", label: "Active" },
    { value: "at-risk", label: "At Risk" },
    { value: "inactive", label: "Inactive" },
    { value: "new", label: "New" },
  ]},
  { key: "course", label: "Course", options: [
    { value: "Advanced Mathematics", label: "Advanced Mathematics" },
    { value: "Calculus Masterclass", label: "Calculus Masterclass" },
    { value: "Statistics & Probability", label: "Statistics & Probability" },
  ]},
  { key: "segment", label: "Segment", options: [
    { value: "top-performers", label: "Top Performers" },
    { value: "new-students", label: "New Students" },
    { value: "at-risk", label: "At Risk" },
    { value: "inactive-7d", label: "Inactive 7 Days" },
  ]},
  { key: "grade", label: "Grade", options: [
    { value: "10", label: "Grade 10" },
    { value: "11", label: "Grade 11" },
    { value: "12", label: "Grade 12" },
  ]},
];

function StudentsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...teacherStudents];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.studentCode.includes(q));
    }
    if (filters.status) result = result.filter((s) => s.status === filters.status);
    if (filters.course) result = result.filter((s) => s.course === filters.course);
    return result;
  }, [search, filters]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const atRisk = teacherStudents.filter((s) => s.status === "at-risk").length;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  return (
    <DashPage role="teacher" title="Students" subtitle="Monitor, filter, and manage your learners at scale" icon={ROLES.teacher.icon}>
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <Users className="h-5 w-5 text-primary" />
          <div><p className="text-lg font-bold">1,240</p><p className="text-xs text-muted-foreground">Total Students</p></div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
          <div><p className="text-lg font-bold">{atRisk}</p><p className="text-xs text-muted-foreground">At Risk</p></div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          <div><p className="text-lg font-bold">78%</p><p className="text-xs text-muted-foreground">Avg Score</p></div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <Users className="h-5 w-5 text-blue-500" />
          <div><p className="text-lg font-bold">14</p><p className="text-xs text-muted-foreground">Countries</p></div>
        </Card>
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={() => { setFilters({}); setPage(1); }}
        totalResults={total}
        placeholder="Search by name or student code..."
      />

      {/* Bulk Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl">Send Announcement</Button>
        <Button variant="outline" size="sm" className="rounded-xl">Assign to Team</Button>
      </div>

      {/* Student Table */}
      <div className="space-y-2">
        {paginated.map((student) => {
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

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </DashPage>
  );
}
