import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  FileCheck, Search, Filter, Download, ArrowUpDown,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { submissionRecords } from "@/lib/assessment-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/assessment/submissions")({
  component: SubmissionsPage,
});

const statusColors: Record<string, string> = {
  pending: "border-amber-300 text-amber-600 bg-amber-500/10",
  graded: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
  returned: "border-slate-300 text-slate-500 bg-slate-500/10",
};

const typeColors: Record<string, string> = {
  quiz: "border-blue-300 text-blue-600 bg-blue-500/10",
  exam: "border-violet-300 text-violet-600 bg-violet-500/10",
  homework: "border-amber-300 text-amber-600 bg-amber-500/10",
  essay: "border-pink-300 text-pink-600 bg-pink-500/10",
  practice: "border-cyan-300 text-cyan-600 bg-cyan-500/10",
};

const typeLabels: Record<string, string> = {
  quiz: "Quiz", exam: "Exam", homework: "Homework", essay: "Essay", practice: "Practice",
};

type SortKey = "studentName" | "submittedAt" | "score" | "attempts";

function SubmissionsPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("submittedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const courses = useMemo(() => Array.from(new Set(submissionRecords.map((s) => s.course))), []);

  const filtered = useMemo(() => {
    let items = [...submissionRecords];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((i) =>
        i.studentName.toLowerCase().includes(q) ||
        i.assessment.toLowerCase().includes(q) ||
        i.course.toLowerCase().includes(q)
      );
    }
    if (filterType !== "all") items = items.filter((i) => i.type === filterType);
    if (filterStatus !== "all") items = items.filter((i) => i.status === filterStatus);
    if (filterCourse !== "all") items = items.filter((i) => i.course === filterCourse);

    items.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "score") cmp = (a.score / a.maxScore) - (b.score / b.maxScore);
      else if (sortBy === "attempts") cmp = a.attempts - b.attempts;
      else if (sortBy === "submittedAt") cmp = a.submittedAt.localeCompare(b.submittedAt);
      else cmp = a.studentName.localeCompare(b.studentName);
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return items;
  }, [search, filterType, filterStatus, filterCourse, sortBy, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortOrder((o) => o === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortOrder("asc"); }
  };

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <button className="flex items-center gap-1 font-semibold hover:text-foreground" onClick={() => handleSort(sortKey)}>
      {label}
      <ArrowUpDown className={cn("h-3 w-3", sortBy === sortKey ? "text-primary" : "text-muted-foreground/50")} />
    </button>
  );

  return (
    <DashPage role="teacher" title={t("assess.submissions")} subtitle="Complete log of all student submissions" icon={ROLES.teacher.icon}>
      {/* Filters */}
      <Card className="border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search student, assessment, course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="rounded-xl border bg-background px-3 py-1.5 text-sm"
            >
              <option value="all">{t("assess.course")}: {t("assess.all")}</option>
              {courses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border bg-background px-3 py-1.5 text-sm"
            >
              <option value="all">{t("assess.type")}: {t("assess.all")}</option>
              <option value="quiz">Quiz</option>
              <option value="exam">Exam</option>
              <option value="homework">Homework</option>
              <option value="essay">Essay</option>
              <option value="practice">Practice</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border bg-background px-3 py-1.5 text-sm"
            >
              <option value="all">Status: {t("assess.all")}</option>
              <option value="graded">{t("assess.graded")}</option>
              <option value="pending">{t("assess.pending")}</option>
              <option value="returned">{t("assess.returned")}</option>
            </select>
          </div>
          <Badge variant="outline" className="rounded-full text-xs shrink-0">{filtered.length} results</Badge>
        </div>
      </Card>

      {/* Table */}
      <Card className="border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead><SortHeader label={t("assess.student")} sortKey="studentName" /></TableHead>
                <TableHead className="font-semibold">{t("assess.course")}</TableHead>
                <TableHead className="font-semibold">{t("assess.assessment")}</TableHead>
                <TableHead className="font-semibold">{t("assess.type")}</TableHead>
                <TableHead><SortHeader label={t("assess.submittedAt")} sortKey="submittedAt" /></TableHead>
                <TableHead><SortHeader label={t("assess.score")} sortKey="score" /></TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead><SortHeader label={t("assess.attempts")} sortKey="attempts" /></TableHead>
                <TableHead className="font-semibold">{t("assess.grader")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileCheck className="h-8 w-8" />
                      <p className="text-sm">No submissions found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((sub) => {
                  const pct = Math.round((sub.score / sub.maxScore) * 100);
                  return (
                    <TableRow key={sub.id} className="hover:bg-accent/50">
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{sub.studentName}</p>
                          <p className="text-xs text-muted-foreground">{sub.studentId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{sub.course}</TableCell>
                      <TableCell>
                        <p className="text-sm truncate max-w-[200px]">{sub.assessment}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("rounded-full text-xs", typeColors[sub.type])}>
                          {typeLabels[sub.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{sub.submittedAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Progress value={pct} className={cn("h-1.5 flex-1", pct < 50 ? "[&>div]:bg-rose-500" : pct < 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500")} />
                          <span className={cn("text-sm font-semibold tabular-nums whitespace-nowrap", pct < 50 ? "text-rose-500" : pct < 70 ? "text-amber-500" : "text-emerald-500")}>
                            {sub.score}/{sub.maxScore}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("rounded-full text-xs", statusColors[sub.status])}>
                          {sub.status === "graded" ? t("assess.graded") : sub.status === "pending" ? t("assess.pending") : t("assess.returned")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="rounded-full text-xs tabular-nums">{sub.attempts}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{sub.grader}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashPage>
  );
}
