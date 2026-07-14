import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  BookOpen, Download, FileSpreadsheet, FileText, Search, ArrowUpDown,
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
import { gradebookData } from "@/lib/assessment-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/assessment/gradebook")({
  component: GradebookPage,
});

const courses = ["Advanced Mathematics", "Calculus Masterclass", "Statistics & Probability"];

const quizMaxScore = 20;
const hwMaxScore = 30;
const examMaxScore = 100;

function scoreCell(score: number, max: number) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const isLow = pct < 50;
  return (
    <span className={cn(
      "inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-xs font-semibold tabular-nums min-w-[36px]",
      isLow ? "bg-rose-500/15 text-rose-600" : pct < 70 ? "bg-amber-500/10 text-amber-600" : "text-foreground"
    )}>
      {score}
    </span>
  );
}

function GradebookPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [sortBy, setSortBy] = useState<"rank" | "average" | "name" | "completion">("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let data = [...gradebookData];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((s) => s.studentName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q));
    }
    data.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "rank") cmp = a.rank - b.rank;
      else if (sortBy === "average") cmp = a.average - b.average;
      else if (sortBy === "completion") cmp = a.completion - b.completion;
      else cmp = a.studentName.localeCompare(b.studentName);
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return data;
  }, [search, sortBy, sortOrder]);

  const handleSort = (key: typeof sortBy) => {
    if (sortBy === key) setSortOrder((o) => o === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortOrder("asc"); }
  };

  const classAvg = gradebookData.length > 0
    ? Math.round(gradebookData.reduce((acc, s) => acc + s.average, 0) / gradebookData.length)
    : 0;

  return (
    <DashPage role="teacher" title={t("assess.gradebook")} subtitle="Spreadsheet view of all student grades" icon={ROLES.teacher.icon}>
      {/* Top Controls */}
      <Card className="border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="rounded-xl border bg-background px-3 py-1.5 text-sm font-medium"
            >
              {courses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="relative">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-9 rounded-xl w-56"
              />
            </div>
            <Badge variant="outline" className="rounded-full text-xs">{filtered.length} students</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              {t("assess.exportExcel")}
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              {t("assess.exportPDF")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-500/10">
            <BookOpen className="h-4 w-4 text-blue-500" />
          </span>
          <div><p className="text-lg font-bold">{gradebookData.length}</p><p className="text-xs text-muted-foreground">Total Students</p></div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10">
            <ArrowUpDown className="h-4 w-4 text-emerald-500" />
          </span>
          <div><p className="text-lg font-bold">{classAvg}%</p><p className="text-xs text-muted-foreground">Class Average</p></div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-green-500/10">
            <ArrowUpDown className="h-4 w-4 text-green-500" />
          </span>
          <div><p className="text-lg font-bold">{gradebookData.filter((s) => s.average >= 50).length}</p><p className="text-xs text-muted-foreground">Passing</p></div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-500/10">
            <ArrowUpDown className="h-4 w-4 text-rose-500" />
          </span>
          <div><p className="text-lg font-bold">{gradebookData.filter((s) => s.average > 0 && s.average < 50).length}</p><p className="text-xs text-muted-foreground">At Risk</p></div>
        </Card>
      </div>

      {/* Gradebook Table */}
      <Card className="border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="sticky start-0 z-10 bg-muted/80 backdrop-blur-sm font-semibold min-w-[60px]">
                  <button onClick={() => handleSort("rank")} className="flex items-center gap-1 hover:text-foreground">
                    {t("assess.rank")} <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="sticky start-[60px] z-10 bg-muted/80 backdrop-blur-sm font-semibold min-w-[160px]">
                  <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-foreground">
                    {t("assess.student")} <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                {[1, 2, 3, 4, 5].map((n) => (
                  <TableHead key={`q${n}`} className="text-center font-semibold min-w-[52px] whitespace-nowrap">Q{n}<br /><span className="text-[10px] font-normal text-muted-foreground">/{quizMaxScore}</span></TableHead>
                ))}
                {[1, 2, 3].map((n) => (
                  <TableHead key={`hw${n}`} className="text-center font-semibold min-w-[52px] whitespace-nowrap">HW{n}<br /><span className="text-[10px] font-normal text-muted-foreground">/{hwMaxScore}</span></TableHead>
                ))}
                <TableHead className="text-center font-semibold min-w-[52px] whitespace-nowrap">Exam<br /><span className="text-[10px] font-normal text-muted-foreground">/{examMaxScore}</span></TableHead>
                <TableHead className="text-center font-semibold min-w-[52px]">Practice</TableHead>
                <TableHead className="text-center font-semibold min-w-[72px]">
                  <button onClick={() => handleSort("average")} className="flex items-center gap-1 justify-center hover:text-foreground">
                    {t("assess.average")} <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-center font-semibold min-w-[80px]">
                  <button onClick={() => handleSort("completion")} className="flex items-center gap-1 justify-center hover:text-foreground">
                    {t("assess.completion")} <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground border border-dashed rounded-xl p-8 mx-4">
                      <BookOpen className="h-8 w-8" />
                      <p className="text-sm">No students found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((student) => {
                  const isLowAvg = student.average > 0 && student.average < 50;
                  return (
                    <TableRow key={student.studentId} className={cn("hover:bg-accent/50", isLowAvg && "bg-rose-500/5")}>
                      <TableCell className="sticky start-0 z-10 bg-card text-center font-bold text-sm tabular-nums">
                        {student.rank}
                      </TableCell>
                      <TableCell className="sticky start-[60px] z-10 bg-card">
                        <div>
                          <p className="text-sm font-medium">{student.studentName}</p>
                          <p className="text-[10px] text-muted-foreground">{student.studentId}</p>
                        </div>
                      </TableCell>
                      {/* Quizzes */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <TableCell key={`q${i}`} className="text-center">
                          {student.quizzes[i] !== undefined ? scoreCell(student.quizzes[i], quizMaxScore) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                      ))}
                      {/* Homework */}
                      {[0, 1, 2].map((i) => (
                        <TableCell key={`hw${i}`} className="text-center">
                          {student.homework[i] !== undefined ? scoreCell(student.homework[i], hwMaxScore) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                      ))}
                      {/* Exam */}
                      <TableCell className="text-center">
                        {student.exams[0] !== undefined ? scoreCell(student.exams[0], examMaxScore) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      {/* Practice */}
                      <TableCell className="text-center">
                        {student.practice > 0 ? (
                          <span className="text-xs font-semibold tabular-nums">{student.practice}%</span>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      {/* Average */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={cn(
                            "text-sm font-bold tabular-nums",
                            student.average === 0 ? "text-muted-foreground" : student.average < 50 ? "text-rose-500" : student.average < 70 ? "text-amber-500" : "text-emerald-500"
                          )}>
                            {student.average > 0 ? `${student.average}%` : "—"}
                          </span>
                          {student.average > 0 && (
                            <Progress
                              value={student.average}
                              className={cn("w-12 h-1", student.average < 50 ? "[&>div]:bg-rose-500" : student.average < 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500")}
                            />
                          )}
                        </div>
                      </TableCell>
                      {/* Completion */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs font-semibold tabular-nums">{student.completion}%</span>
                          <Progress value={student.completion} className="w-12 h-1" />
                        </div>
                      </TableCell>
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
