import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { useAssistantScopedCourses, extractErrorDetail } from "@/hooks/use-assistant-scope";
import { getAtRisk, type AtRiskEntry } from "@/lib/api/students";

export const Route = createFileRoute("/assistant-teacher/follow-up")({ component: FollowUpPage });

const severityColors: Record<string, string> = {
  high: "border-rose-400/40 text-rose-400 bg-rose-500/10",
  medium: "border-amber-400/40 text-amber-400 bg-amber-500/10",
  low: "border-blue-400/40 text-blue-400 bg-blue-500/10",
  none: "border-slate-400/40 text-slate-400 bg-slate-500/10",
};

function FollowUpPage() {
  const { t } = useApp();
  const { courses, loading: coursesLoading, error: coursesError } = useAssistantScopedCourses("students_data", "view");
  const [courseId, setCourseId] = useState("");
  const [entries, setEntries] = useState<AtRiskEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesError, setEntriesError] = useState("");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    if (!courseId && courses.length > 0) setCourseId(courses[0].course.id);
  }, [courses, courseId]);

  useEffect(() => {
    if (!courseId) return;
    setEntriesLoading(true);
    setEntriesError("");
    getAtRisk(courseId)
      .then(setEntries)
      .catch((err) => setEntriesError(extractErrorDetail(err)))
      .finally(() => setEntriesLoading(false));
  }, [courseId]);

  const filtered = tab === "all" ? entries : entries.filter((e) => e.risk_level === tab);
  const highCount = entries.filter((e) => e.risk_level === "high").length;
  const mediumCount = entries.filter((e) => e.risk_level === "medium").length;
  const lowCount = entries.filter((e) => e.risk_level === "low").length;

  return (
    <DashPage role="assistant" title="at.followUp" subtitle="at.followUpSubtitle" icon={ROLES.assistant.icon}>
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

          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            <Card className="flex items-center gap-3 border bg-card p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{entries.length}</p>
                <p className="text-xs text-muted-foreground">{t("at.totalFollowUps")}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 border bg-card p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{highCount}</p>
                <p className="text-xs text-muted-foreground">{t("at.highSeverity")}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 border bg-card p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{mediumCount}</p>
                <p className="text-xs text-muted-foreground">{t("at.mediumSeverity")}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 border bg-card p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                <AlertTriangle className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{lowCount}</p>
                <p className="text-xs text-muted-foreground">{t("at.low")}</p>
              </div>
            </Card>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-muted/50 border">
              <TabsTrigger value="all" className="text-xs data-[state=active]:bg-background">{t("at.all")} ({entries.length})</TabsTrigger>
              <TabsTrigger value="high" className="text-xs data-[state=active]:bg-background">{t("at.highSeverity")} ({highCount})</TabsTrigger>
              <TabsTrigger value="medium" className="text-xs data-[state=active]:bg-background">{t("at.mediumSeverity")} ({mediumCount})</TabsTrigger>
              <TabsTrigger value="low" className="text-xs data-[state=active]:bg-background">{t("at.low")} ({lowCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-4 space-y-3">
              {entriesLoading ? (
                <p className="py-12 text-center text-sm text-muted-foreground">{t("common.loading")}</p>
              ) : entriesError ? (
                <p className="py-12 text-center text-sm text-destructive">{entriesError}</p>
              ) : filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">{t("at.noFollowUps")}</p>
              ) : (
                filtered.map((entry) => (
                  <Card key={entry.student_id} className="border bg-card p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5",
                        entry.risk_level === "high" ? "bg-rose-500/10" : entry.risk_level === "medium" ? "bg-amber-500/10" : "bg-blue-500/10"
                      )}>
                        <AlertTriangle className={cn(
                          "h-4.5 w-4.5",
                          entry.risk_level === "high" ? "text-rose-500" : entry.risk_level === "medium" ? "text-amber-500" : "text-blue-500"
                        )} />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold">{entry.full_name}</p>
                          <Badge variant="outline" className={cn("rounded-full text-[10px] px-1.5 py-0", severityColors[entry.risk_level])}>
                            {entry.risk_level}
                          </Badge>
                        </div>
                        {entry.risk_reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {entry.risk_reasons.map((reason) => (
                              <Badge key={reason} variant="outline" className="rounded-full text-[10px] px-1.5 py-0">{reason}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                          <span>{t("at.completion")}: {entry.progress_percent}%</span>
                          {entry.quiz_average !== null && <span>{t("at.grade")}: {entry.quiz_average}</span>}
                          {entry.last_activity_at && <span>{t("at.lastActive")}: {entry.last_activity_at}</span>}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </DashPage>
  );
}
