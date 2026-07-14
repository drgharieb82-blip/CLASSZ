import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, TrendingUp, GraduationCap, AlertTriangle, Award } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { useAssistantScopedCourses, extractErrorDetail } from "@/hooks/use-assistant-scope";
import { getReportSummary, getProgress, type CourseReportSummary, type StudentProgressEntry } from "@/lib/api/students";

export const Route = createFileRoute("/assistant-teacher/performance")({ component: PerformancePage });

function PerformancePage() {
  const { t } = useApp();
  const { courses, loading: coursesLoading, error: coursesError } = useAssistantScopedCourses("students_data", "view");
  const [courseId, setCourseId] = useState("");
  const [summary, setSummary] = useState<CourseReportSummary | null>(null);
  const [progress, setProgress] = useState<StudentProgressEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    if (!courseId && courses.length > 0) setCourseId(courses[0].course.id);
  }, [courses, courseId]);

  useEffect(() => {
    if (!courseId) return;
    setDataLoading(true);
    setDataError("");
    Promise.all([getReportSummary(courseId), getProgress(courseId)])
      .then(([s, p]) => {
        setSummary(s);
        setProgress(p);
      })
      .catch((err) => setDataError(extractErrorDetail(err)))
      .finally(() => setDataLoading(false));
  }, [courseId]);

  return (
    <DashPage role="assistant" title="at.performance" subtitle="at.performanceSubtitle" icon={ROLES.assistant.icon}>
      {coursesLoading ? (
        <Card className="border bg-card p-8 text-center text-sm text-muted-foreground">{t("common.loading")}</Card>
      ) : coursesError ? (
        <Card className="border border-destructive/40 bg-destructive/5 p-8 text-center text-sm text-destructive">{coursesError}</Card>
      ) : courses.length === 0 ? (
        <Card className="border bg-card p-8 text-center text-sm text-muted-foreground">{t("at.noStudentsDataAccess")}</Card>
      ) : (
        <>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger className="w-[260px] h-9 text-sm bg-muted/30 border">
              <SelectValue placeholder={t("at.selectCourse")} />
            </SelectTrigger>
            <SelectContent>
              {courses.map(({ course }) => (
                <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {dataLoading ? (
            <Card className="border bg-card p-8 text-center text-sm text-muted-foreground">{t("common.loading")}</Card>
          ) : dataError ? (
            <Card className="border border-destructive/40 bg-destructive/5 p-8 text-center text-sm text-destructive">{dataError}</Card>
          ) : summary && (
            <>
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <Card className="border bg-card p-4 space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{summary.total_students}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("at.totalStudents")}</p>
                  </div>
                </Card>
                <Card className="border bg-card p-4 space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{summary.average_progress_percent}%</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("at.avgCompletion")}</p>
                  </div>
                </Card>
                <Card className="border bg-card p-4 space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                    <GraduationCap className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{summary.average_quiz_score ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("at.avgQuizScore")}</p>
                  </div>
                </Card>
                <Card className="border bg-card p-4 space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{summary.at_risk_count}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("at.atRiskStudents")}</p>
                  </div>
                </Card>
              </div>

              <Card className="border bg-card p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                    <Award className="h-4.5 w-4.5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summary.certificates_issued}</p>
                    <p className="text-xs text-muted-foreground">{t("at.certificatesIssued")}</p>
                  </div>
                </div>
              </Card>

              <Card className="border bg-card overflow-hidden">
                <div className="p-4 pb-0">
                  <h3 className="text-sm font-semibold">{t("at.studentProgress")}</h3>
                </div>
                {progress.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">{t("at.noStudentsFound")}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs">{t("at.name")}</TableHead>
                        <TableHead className="text-xs">{t("at.completion")}</TableHead>
                        <TableHead className="text-xs">{t("at.gradedSubmissions")}</TableHead>
                        <TableHead className="text-xs text-end">{t("at.sessions2")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {progress.map((p) => (
                        <TableRow key={p.student_id} className="hover:bg-muted/30">
                          <TableCell className="text-sm font-medium">{p.full_name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{p.progress_percent}%</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{p.quiz_average ?? "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground text-end">{p.sessions_completed}/{p.sessions_total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </>
          )}
        </>
      )}
    </DashPage>
  );
}
