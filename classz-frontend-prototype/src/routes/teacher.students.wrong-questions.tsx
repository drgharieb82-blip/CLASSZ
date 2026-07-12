import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  HelpCircle, Search, BookOpen, Filter,
  BarChart3, AlertTriangle, RefreshCcw,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { useTeacherStudentsStore, useLoadTeacherStudentsData, relativeTime } from "@/lib/teacher/teacher-students-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/students/wrong-questions")({
  component: WrongQuestionsPage,
});

const difficultyColors: Record<string, string> = {
  EASY: "border-emerald-300 text-emerald-500 bg-emerald-500/10",
  MEDIUM: "border-amber-300 text-amber-500 bg-amber-500/10",
  HARD: "border-rose-300 text-rose-500 bg-rose-500/10",
};

function WrongQuestionsPage() {
  const { t } = useApp();
  useLoadTeacherStudentsData();
  const wrongQuestions = useTeacherStudentsStore((s) => s.wrongQuestions);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const courses = useMemo(() => {
    const all = new Set(wrongQuestions.map((wq) => wq.course_title));
    return Array.from(all);
  }, [wrongQuestions]);

  const filtered = useMemo(() => {
    let result = [...wrongQuestions];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (wq) =>
          wq.full_name.toLowerCase().includes(q) ||
          (wq.concept ?? "").toLowerCase().includes(q) ||
          (wq.atomic_concept ?? "").toLowerCase().includes(q) ||
          wq.question_title.toLowerCase().includes(q)
      );
    }
    if (courseFilter !== "all") result = result.filter((wq) => wq.course_title === courseFilter);
    if (difficultyFilter !== "all") result = result.filter((wq) => wq.difficulty === difficultyFilter);
    return result;
  }, [wrongQuestions, search, courseFilter, difficultyFilter]);

  const totalRetries = wrongQuestions.reduce((s, wq) => s + wq.retry_count, 0);
  const hardCount = wrongQuestions.filter((wq) => wq.difficulty === "HARD").length;
  const uniqueStudents = new Set(wrongQuestions.map((wq) => wq.student_id)).size;

  return (
    <DashPage role="teacher" title={t("stu.wrongQuestions")} subtitle="Track and analyze student mistakes for targeted revision" icon={ROLES.teacher.icon}>
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10">
            <HelpCircle className="h-5 w-5 text-rose-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{wrongQuestions.length}</p>
            <p className="text-xs text-muted-foreground">Total Wrong Questions</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10">
            <RefreshCcw className="h-5 w-5 text-amber-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{totalRetries}</p>
            <p className="text-xs text-muted-foreground">Total Retries</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/10">
            <AlertTriangle className="h-5 w-5 text-violet-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{hardCount}</p>
            <p className="text-xs text-muted-foreground">Hard Questions</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10">
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{uniqueStudents}</p>
            <p className="text-xs text-muted-foreground">Students Affected</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="border bg-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student, concept..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl"
            />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[200px] rounded-xl">
              <BookOpen className="h-4 w-4 me-2 text-muted-foreground" />
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[160px] rounded-xl">
              <Filter className="h-4 w-4 me-2 text-muted-foreground" />
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="rounded-full ms-auto">{filtered.length} records</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead>{t("stu.concept")}</TableHead>
                <TableHead>{t("stu.atomicConcept")}</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>{t("stu.retryCount")}</TableHead>
                <TableHead>Last Wrong</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((wq) => (
                <TableRow key={`${wq.student_id}-${wq.question_id}`} className="hover:bg-accent/50">
                  <TableCell className="font-medium text-sm">{wq.full_name}</TableCell>
                  <TableCell className="text-sm">{wq.course_title}</TableCell>
                  <TableCell className="text-sm">{wq.chapter ?? "—"}</TableCell>
                  <TableCell className="text-sm">{wq.concept ?? "—"}</TableCell>
                  <TableCell className="text-sm">{wq.atomic_concept ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full text-xs">{wq.question_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full text-xs", difficultyColors[wq.difficulty])}>
                      {wq.difficulty.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-sm font-semibold",
                      wq.retry_count >= 5 ? "text-rose-500" :
                        wq.retry_count >= 3 ? "text-amber-500" : "text-muted-foreground"
                    )}>
                      {wq.retry_count}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{relativeTime(wq.last_wrong_at)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <HelpCircle className="h-8 w-8" />
                      <p className="text-sm">No wrong questions found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashPage>
  );
}
