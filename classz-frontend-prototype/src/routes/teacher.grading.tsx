import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { CheckCircle2, Clock, Eye, RotateCcw, Users } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { DataTable, type DataColumn } from "@/components/filters/DataTable";
import { COUNTRIES } from "@/lib/i18n/countries";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";

export const Route = createFileRoute("/teacher/grading")({ component: GradingPage });

const PAGE_SIZE = 20;

interface GradingItem {
  id: string;
  studentCode: string;
  studentName: string;
  country: string;
  type: "essay" | "homework" | "assignment" | "exam_essay";
  itemTitle: string;
  courseTitle: string;
  sessionTitle: string;
  submittedAt: string;
  status: "pending" | "reviewing" | "graded" | "returned";
  assignedTo: string;
  score?: number;
  maxScore: number;
}

const mockQueue: GradingItem[] = [
  { id: "g1", studentCode: "CLS-26-000001", studentName: "Aya Mansour", country: "EG", type: "essay", itemTitle: "Proof: Intermediate Value Theorem", courseTitle: "Advanced Mathematics", sessionTitle: "Session 2: Differentiation", submittedAt: "2026-06-21T14:00:00Z", status: "pending", assignedTo: "", maxScore: 100 },
  { id: "g2", studentCode: "CLS-26-000002", studentName: "Omar Tarek", country: "EG", type: "homework", itemTitle: "Derivatives Worksheet", courseTitle: "Advanced Mathematics", sessionTitle: "Session 1: Foundations", submittedAt: "2026-06-21T12:30:00Z", status: "pending", assignedTo: "", maxScore: 50 },
  { id: "g3", studentCode: "CLS-26-000003", studentName: "Lina Fares", country: "SA", type: "assignment", itemTitle: "Research: Calculus History", courseTitle: "Calculus Masterclass", sessionTitle: "Session 3: Applications", submittedAt: "2026-06-20T18:00:00Z", status: "reviewing", assignedTo: "AST-26-0001", maxScore: 100 },
  { id: "g4", studentCode: "CLS-26-000004", studentName: "Karim Adel", country: "EG", type: "exam_essay", itemTitle: "Weekly Exam Q3 (Essay)", courseTitle: "Advanced Mathematics", sessionTitle: "Weekly Exam", submittedAt: "2026-06-20T10:00:00Z", status: "pending", assignedTo: "", maxScore: 20 },
  { id: "g5", studentCode: "CLS-26-000005", studentName: "Nour Sami", country: "AE", type: "homework", itemTitle: "Integration Practice Set", courseTitle: "Advanced Mathematics", sessionTitle: "Session 4: Integration", submittedAt: "2026-06-19T16:00:00Z", status: "graded", assignedTo: "AST-26-0002", score: 42, maxScore: 50 },
  { id: "g6", studentCode: "CLS-26-000006", studentName: "Hadi Wael", country: "EG", type: "essay", itemTitle: "L'Hôpital Rule Applications", courseTitle: "Calculus Masterclass", sessionTitle: "Session 2: Limits", submittedAt: "2026-06-19T14:00:00Z", status: "graded", assignedTo: "TCH-26-0001", score: 88, maxScore: 100 },
  { id: "g7", studentCode: "CLS-26-000023", studentName: "Ahmed Youssef", country: "KW", type: "assignment", itemTitle: "Presentation: Infinite Series", courseTitle: "Advanced Mathematics", sessionTitle: "Session 5: Series", submittedAt: "2026-06-18T09:00:00Z", status: "returned", assignedTo: "TCH-26-0001", score: 75, maxScore: 100 },
  { id: "g8", studentCode: "CLS-26-000145", studentName: "Sara Mahmoud", country: "SA", type: "essay", itemTitle: "Continuity and Differentiability", courseTitle: "Advanced Mathematics", sessionTitle: "Session 1: Foundations", submittedAt: "2026-06-17T11:00:00Z", status: "graded", assignedTo: "AST-26-0001", score: 92, maxScore: 100 },
  { id: "g9", studentCode: "CLS-26-000087", studentName: "Nour Hassan", country: "EG", type: "homework", itemTitle: "Trigonometric Identities", courseTitle: "Advanced Mathematics", sessionTitle: "Session 3: Trig", submittedAt: "2026-06-16T15:00:00Z", status: "returned", assignedTo: "AST-26-0002", score: 38, maxScore: 50 },
  { id: "g10", studentCode: "CLS-26-000056", studentName: "Lina Karim", country: "JO", type: "exam_essay", itemTitle: "Monthly Exam Q5 (Proof)", courseTitle: "Calculus Masterclass", sessionTitle: "Monthly Exam", submittedAt: "2026-06-15T10:00:00Z", status: "pending", assignedTo: "", maxScore: 30 },
];

const statusColors: Record<string, string> = {
  pending: "border-amber-300 text-amber-600 bg-amber-500/10",
  reviewing: "border-blue-300 text-blue-600 bg-blue-500/10",
  graded: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
  returned: "border-slate-300 text-slate-500 bg-slate-500/10",
};

const typeLabels: Record<string, string> = { essay: "Essay", homework: "Homework", assignment: "Assignment", exam_essay: "Exam Essay" };

const columns: DataColumn<GradingItem>[] = [
  { key: "studentName", label: "Student", sortable: true, render: (r) => (
    <div><p className="font-medium text-sm">{r.studentName}</p><p className="text-xs text-muted-foreground">{r.studentCode}</p></div>
  ), exportValue: (r) => `${r.studentName} (${r.studentCode})` },
  { key: "country", label: "Country", sortable: true, hideOnMobile: true, render: (r) => {
    const c = COUNTRIES.find((x) => x.code === r.country);
    return <span className="text-xs">{c?.name ?? r.country}</span>;
  }, exportValue: (r) => COUNTRIES.find((x) => x.code === r.country)?.name ?? r.country },
  { key: "type", label: "Type", sortable: true, render: (r) => <Badge variant="outline" className="rounded-full text-xs">{typeLabels[r.type]}</Badge>, exportValue: (r) => typeLabels[r.type] },
  { key: "itemTitle", label: "Item", sortable: true, render: (r) => (
    <div><p className="text-sm truncate max-w-[200px]">{r.itemTitle}</p><p className="text-xs text-muted-foreground truncate max-w-[200px]">{r.courseTitle}</p></div>
  ), exportValue: (r) => `${r.itemTitle} — ${r.courseTitle}` },
  { key: "sessionTitle", label: "Session", sortable: true, hideOnMobile: true, exportValue: (r) => r.sessionTitle },
  { key: "submittedAt", label: "Submitted", sortable: true, align: "end", hideOnMobile: true, render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.submittedAt).toLocaleDateString()}</span>, exportValue: (r) => new Date(r.submittedAt).toLocaleDateString() },
  { key: "status", label: "Status", sortable: true, align: "center", render: (r) => <Badge variant="outline" className={cn("rounded-full text-xs", statusColors[r.status])}>{r.status}</Badge>, exportValue: (r) => r.status },
  { key: "score", label: "Score", sortable: true, align: "end", render: (r) => r.score !== undefined ? <span className="text-sm font-semibold">{r.score}/{r.maxScore}</span> : <span className="text-xs text-muted-foreground">—</span>, exportValue: (r) => r.score !== undefined ? `${r.score}/${r.maxScore}` : "" },
  { key: "assignedTo", label: "Assigned", sortable: true, hideOnMobile: true, render: (r) => r.assignedTo ? <span className="text-xs font-mono">{r.assignedTo}</span> : <span className="text-xs text-muted-foreground">Unassigned</span>, exportValue: (r) => r.assignedTo || "Unassigned" },
];

function GradingPage() {
  const courses = useTeacherCourseStore((s) => s.courses);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("submittedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const filterOptions: FilterOption[] = [
    { key: "status", label: "Status", options: [
      { value: "pending", label: "Pending" }, { value: "reviewing", label: "Reviewing" },
      { value: "graded", label: "Graded" }, { value: "returned", label: "Returned" },
    ]},
    { key: "type", label: "Type", options: [
      { value: "essay", label: "Essay" }, { value: "homework", label: "Homework" },
      { value: "assignment", label: "Assignment" }, { value: "exam_essay", label: "Exam Essay" },
    ]},
    { key: "country", label: "Country", options: COUNTRIES.map((c) => ({ value: c.code, label: c.name })) },
    { key: "course", label: "Course", options: [
      { value: "Advanced Mathematics", label: "Advanced Mathematics" },
      { value: "Calculus Masterclass", label: "Calculus Masterclass" },
      ...courses.map((c) => ({ value: c.title, label: c.title })),
    ]},
    { key: "assigned", label: "Assigned To", options: [
      { value: "unassigned", label: "Unassigned" },
      { value: "TCH-26-0001", label: "Teacher" },
      { value: "AST-26-0001", label: "Assistant 1" },
      { value: "AST-26-0002", label: "Assistant 2" },
    ]},
  ];

  const filtered = useMemo(() => {
    let r = [...mockQueue];
    if (search) { const q = search.toLowerCase(); r = r.filter((g) => g.studentName.toLowerCase().includes(q) || g.studentCode.includes(q) || g.itemTitle.toLowerCase().includes(q)); }
    if (filters.status) r = r.filter((g) => g.status === filters.status);
    if (filters.type) r = r.filter((g) => g.type === filters.type);
    if (filters.country) r = r.filter((g) => g.country === filters.country);
    if (filters.course) r = r.filter((g) => g.courseTitle === filters.course);
    if (filters.assigned === "unassigned") r = r.filter((g) => !g.assignedTo);
    else if (filters.assigned) r = r.filter((g) => g.assignedTo === filters.assigned);

    r.sort((a, b) => {
      const aVal = (a as any)[sortBy] ?? "";
      const bVal = (b as any)[sortBy] ?? "";
      const cmp = typeof aVal === "number" ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal));
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return r;
  }, [search, filters, sortBy, sortOrder]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pendingCount = mockQueue.filter((g) => g.status === "pending").length;

  const handleSort = useCallback((col: string) => {
    if (sortBy === col) setSortOrder((o) => o === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortOrder("asc"); }
    setPage(1);
  }, [sortBy]);

  const toggleRow = useCallback((key: string) => {
    setSelectedRows((prev) => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedRows((prev) => {
      if (paginated.every((r) => prev.has(r.id))) return new Set();
      return new Set(paginated.map((r) => r.id));
    });
  }, [paginated]);

  return (
    <DashPage role="teacher" title="Grading Queue" subtitle="Review and grade student submissions at scale" icon={ROLES.teacher.icon}>
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-3"><Clock className="h-5 w-5 text-amber-500" /><div><p className="text-lg font-bold">{pendingCount}</p><p className="text-xs text-muted-foreground">Pending</p></div></Card>
        <Card className="flex items-center gap-3 border bg-card p-3"><Eye className="h-5 w-5 text-blue-500" /><div><p className="text-lg font-bold">{mockQueue.filter((g) => g.status === "reviewing").length}</p><p className="text-xs text-muted-foreground">Reviewing</p></div></Card>
        <Card className="flex items-center gap-3 border bg-card p-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /><div><p className="text-lg font-bold">{mockQueue.filter((g) => g.status === "graded").length}</p><p className="text-xs text-muted-foreground">Graded</p></div></Card>
        <Card className="flex items-center gap-3 border bg-card p-3"><RotateCcw className="h-5 w-5 text-slate-500" /><div><p className="text-lg font-bold">{mockQueue.filter((g) => g.status === "returned").length}</p><p className="text-xs text-muted-foreground">Returned</p></div></Card>
      </div>

      {/* Filters */}
      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }}
        onClearFilters={() => { setFilters({}); setPage(1); }}
        totalResults={total}
        placeholder="Search by student name, code, or item title..."
      />

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={paginated}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        rowKey={(r) => r.id}
        title="Grading Queue"
        selectedRows={selectedRows}
        onSelectRow={toggleRow}
        onSelectAll={toggleAll}
        bulkActions={
          selectedRows.size > 0 ? (
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">Assign to Assistant</Button>
              <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">Bulk Grade</Button>
              <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">Mark Reviewed</Button>
            </div>
          ) : undefined
        }
      />
    </DashPage>
  );
}
