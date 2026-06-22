import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { CheckCircle2, Clock, Download, Eye, RotateCcw } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { COUNTRIES } from "@/lib/i18n/countries";

export const Route = createFileRoute("/teacher/grading")({ component: GradingPage });

const PAGE_SIZE = 15;

interface GradingItem {
  id: string;
  studentCode: string;
  studentName: string;
  type: "essay" | "homework" | "assignment" | "exam_essay";
  itemTitle: string;
  courseTitle: string;
  submittedAt: string;
  status: "pending" | "reviewing" | "graded" | "returned";
  score?: number;
  maxScore: number;
}

const mockQueue: GradingItem[] = [
  { id: "g1", studentCode: "CLS-26-000001", studentName: "Aya Mansour", type: "essay", itemTitle: "Proof: IVT", courseTitle: "Advanced Mathematics", submittedAt: "2026-06-21T14:00:00Z", status: "pending", maxScore: 100 },
  { id: "g2", studentCode: "CLS-26-000002", studentName: "Omar Tarek", type: "homework", itemTitle: "Derivatives Worksheet", courseTitle: "Advanced Mathematics", submittedAt: "2026-06-21T12:30:00Z", status: "pending", maxScore: 50 },
  { id: "g3", studentCode: "CLS-26-000003", studentName: "Lina Fares", type: "assignment", itemTitle: "Research: Calculus History", courseTitle: "Calculus Masterclass", submittedAt: "2026-06-20T18:00:00Z", status: "reviewing", maxScore: 100 },
  { id: "g4", studentCode: "CLS-26-000004", studentName: "Karim Adel", type: "exam_essay", itemTitle: "Weekly Exam Q3 (Essay)", courseTitle: "Advanced Mathematics", submittedAt: "2026-06-20T10:00:00Z", status: "pending", maxScore: 20 },
  { id: "g5", studentCode: "CLS-26-000005", studentName: "Nour Sami", type: "homework", itemTitle: "Integration Practice", courseTitle: "Advanced Mathematics", submittedAt: "2026-06-19T16:00:00Z", status: "graded", score: 42, maxScore: 50 },
  { id: "g6", studentCode: "CLS-26-000006", studentName: "Hadi Wael", type: "essay", itemTitle: "L'Hôpital Applications", courseTitle: "Calculus Masterclass", submittedAt: "2026-06-19T14:00:00Z", status: "graded", score: 88, maxScore: 100 },
  { id: "g7", studentCode: "CLS-26-000023", studentName: "Ahmed Youssef", type: "assignment", itemTitle: "Presentation: Series", courseTitle: "Advanced Mathematics", submittedAt: "2026-06-18T09:00:00Z", status: "returned", score: 75, maxScore: 100 },
];

const statusColors: Record<string, string> = {
  pending: "border-amber-300 text-amber-600",
  reviewing: "border-blue-300 text-blue-600",
  graded: "border-emerald-300 text-emerald-600",
  returned: "border-slate-300 text-slate-500",
};

const typeLabels: Record<string, string> = {
  essay: "Essay", homework: "Homework", assignment: "Assignment", exam_essay: "Exam Essay",
};

function GradingPage() {
  const [search, setSearch] = useState(""); const [filters, setFilters] = useState<Record<string, string>>({}); const [page, setPage] = useState(1);

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
  ];

  const filtered = useMemo(() => {
    let r = [...mockQueue];
    if (search) { const q = search.toLowerCase(); r = r.filter((g) => g.studentName.toLowerCase().includes(q) || g.studentCode.includes(q) || g.itemTitle.toLowerCase().includes(q)); }
    if (filters.status) r = r.filter((g) => g.status === filters.status);
    if (filters.type) r = r.filter((g) => g.type === filters.type);
    return r;
  }, [search, filters]);
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pendingCount = mockQueue.filter((g) => g.status === "pending").length;

  return (
    <DashPage role="teacher" title="Grading Queue" subtitle="Review and grade student submissions at scale" icon={ROLES.teacher.icon}>
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-4"><Clock className="h-5 w-5 text-amber-500" /><div><p className="text-lg font-bold">{pendingCount}</p><p className="text-xs text-muted-foreground">Pending</p></div></Card>
        <Card className="flex items-center gap-3 border bg-card p-4"><Eye className="h-5 w-5 text-blue-500" /><div><p className="text-lg font-bold">{mockQueue.filter((g) => g.status === "reviewing").length}</p><p className="text-xs text-muted-foreground">Reviewing</p></div></Card>
        <Card className="flex items-center gap-3 border bg-card p-4"><CheckCircle2 className="h-5 w-5 text-emerald-500" /><div><p className="text-lg font-bold">{mockQueue.filter((g) => g.status === "graded").length}</p><p className="text-xs text-muted-foreground">Graded</p></div></Card>
        <Card className="flex items-center gap-3 border bg-card p-4"><RotateCcw className="h-5 w-5 text-slate-500" /><div><p className="text-lg font-bold">{mockQueue.filter((g) => g.status === "returned").length}</p><p className="text-xs text-muted-foreground">Returned</p></div></Card>
      </div>

      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} filters={filterOptions} activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }} onClearFilters={() => { setFilters({}); setPage(1); }} totalResults={total} placeholder="Search by student, code, or title..." />

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>
        <Button variant="outline" size="sm" className="rounded-xl">Bulk Grade</Button>
        <Button variant="outline" size="sm" className="rounded-xl">Assign to Assistant</Button>
      </div>

      <div className="space-y-2">
        {paginated.map((item) => (
          <Card key={item.id} className="flex items-center gap-4 border bg-card px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate">{item.itemTitle}</p>
                <Badge variant="outline" className={cn("rounded-full text-xs", statusColors[item.status])}>{item.status}</Badge>
                <Badge variant="outline" className="rounded-full text-xs">{typeLabels[item.type]}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.studentName} · {item.studentCode} · {item.courseTitle} · {new Date(item.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {item.score !== undefined && <span className="text-sm font-semibold">{item.score}/{item.maxScore}</span>}
              {item.status === "pending" && <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">Review</Button>}
              {item.status === "reviewing" && <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">Grade</Button>}
            </div>
          </Card>
        ))}
      </div>
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </DashPage>
  );
}
