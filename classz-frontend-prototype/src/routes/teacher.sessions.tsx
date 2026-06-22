import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  BookOpen, CalendarDays, ClipboardList, Clock, DollarSign, Eye,
  Layers, LayoutGrid, List, Lock, Pencil, Plus, Search,
  Sparkles, TrendingUp, Unlock,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { useTeacherSessionStore } from "@/lib/teacher/teacher-session-store";
import { useTeacherMaterialStore } from "@/lib/teacher/teacher-material-store";
import { useTeacherQuestionStore } from "@/lib/teacher/teacher-question-store";
import { useTeacherQuizStore } from "@/lib/teacher/teacher-quiz-store";
import { useTeacherExamStore } from "@/lib/teacher/teacher-exam-store";
import { useTeacherHomeworkStore } from "@/lib/teacher/teacher-homework-store";
import { listChapters } from "@/lib/teacher/teacher-chapter-store";
import {
  BUILT_IN_TEMPLATES, SESSION_TYPE_META, type SessionWorkspaceType,
} from "@/lib/teacher/session-workspace-types";
import { PremiumSessionCard, type SessionStats } from "@/components/session/PremiumSessionCard";

export const Route = createFileRoute("/teacher/sessions")({
  component: SessionWorkspacePage,
});

type ViewMode = "cards" | "table" | "calendar";
type StatusFilter = "" | "draft" | "published" | "archived";
type TypeFilter = "" | SessionWorkspaceType;

const ALL_SESSION_TYPES: SessionWorkspaceType[] = [
  "lesson", "revision", "practice", "quiz_session", "exam_session",
  "homework_session", "mixed", "live", "crash_course", "final_revision",
];

function SessionWorkspacePage() {
  const courses = useTeacherCourseStore((s) => s.courses);
  const allSessions = useTeacherSessionStore((s) => s.sessions);
  const publishSession = useTeacherSessionStore((s) => s.publishSession);
  const archiveSession = useTeacherSessionStore((s) => s.archiveSession);
  const deleteSession = useTeacherSessionStore((s) => s.deleteSession);
  const lockSession = useTeacherSessionStore((s) => s.lockSession);
  const unlockSession = useTeacherSessionStore((s) => s.unlockSession);
  const createSession = useTeacherSessionStore((s) => s.createSession);
  const allMaterials = useTeacherMaterialStore((s) => s.materials);
  const allQuestions = useTeacherQuestionStore((s) => s.questions);
  const allQuizzes = useTeacherQuizStore((s) => s.quizzes);
  const allExams = useTeacherExamStore((s) => s.exams);
  const allHomework = useTeacherHomeworkStore((s) => s.items);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [view, setView] = useState<ViewMode>("cards");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("");

  const courseSessions = useMemo(() => {
    let result = selectedCourse
      ? allSessions.filter((s) => s.courseId === selectedCourse)
      : allSessions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.title.toLowerCase().includes(q) || s.publicCode.toLowerCase().includes(q));
    }
    if (statusFilter) result = result.filter((s) => s.status === statusFilter);
    if (typeFilter) result = result.filter((s) => s.sessionType === typeFilter);
    return result.sort((a, b) => a.order - b.order);
  }, [allSessions, selectedCourse, search, statusFilter, typeFilter]);

  const allForCourse = selectedCourse
    ? allSessions.filter((s) => s.courseId === selectedCourse)
    : allSessions;

  const sessionStatsMap = useMemo(() => {
    const map = new Map<string, SessionStats>();
    for (const session of courseSessions) {
      map.set(session.id, {
        materialsCount: allMaterials.filter((m) => m.sessionId === session.id || m.linkedSessionIds?.includes(session.id)).length,
        questionsCount: allQuestions.filter((q) => q.sessionId === session.id || q.sessionIds?.includes(session.id)).length,
        quizzesCount: allQuizzes.filter((q) => q.sessionIds?.includes(session.id)).length,
        examsCount: allExams.filter((e) => e.sessionIds?.includes(session.id)).length,
        homeworkCount: allHomework.filter((h) => h.sessionIds?.includes(session.id)).length,
      });
    }
    return map;
  }, [courseSessions, allMaterials, allQuestions, allQuizzes, allExams, allHomework]);

  const chapterMap = useMemo(() => {
    if (!selectedCourse) return new Map<string, string>();
    const chapters = listChapters(selectedCourse);
    return new Map(chapters.map((c) => [c.id, c.title]));
  }, [selectedCourse]);

  const stats = useMemo(() => ({
    total: allForCourse.length,
    published: allForCourse.filter((s) => s.status === "published").length,
    draft: allForCourse.filter((s) => s.status === "draft").length,
    locked: allForCourse.filter((s) => s.accessStatus === "locked").length,
    freePreview: allForCourse.filter((s) => s.isFreePreview).length,
    totalRevenue: allForCourse.reduce((a, s) => a + s.price, 0),
  }), [allForCourse]);

  const handleDuplicate = (session: typeof allSessions[0]) => {
    createSession({
      courseId: session.courseId,
      chapterId: session.chapterId,
      title: `${session.title} (Copy)`,
      description: session.description,
      price: session.price,
      currency: session.currency,
      sessionType: session.sessionType,
      isFreePreview: session.isFreePreview,
    });
  };

  return (
    <DashPage role="teacher" title="Session Workspace" subtitle="Build premium learning experiences" icon={ROLES.teacher.icon}>
      {/* Premium Stats Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {[
          { label: "Total", value: stats.total, icon: Layers, gradient: "from-blue-500/10 to-blue-600/5", iconCls: "text-blue-500", border: "border-blue-500/20" },
          { label: "Published", value: stats.published, icon: Eye, gradient: "from-emerald-500/10 to-emerald-600/5", iconCls: "text-emerald-500", border: "border-emerald-500/20" },
          { label: "Drafts", value: stats.draft, icon: Clock, gradient: "from-amber-500/10 to-amber-600/5", iconCls: "text-amber-500", border: "border-amber-500/20" },
          { label: "Locked", value: stats.locked, icon: Lock, gradient: "from-slate-500/10 to-slate-600/5", iconCls: "text-slate-500", border: "border-slate-500/20" },
          { label: "Free Preview", value: stats.freePreview, icon: Sparkles, gradient: "from-violet-500/10 to-violet-600/5", iconCls: "text-violet-500", border: "border-violet-500/20" },
          { label: "Revenue", value: `$${stats.totalRevenue}`, icon: DollarSign, gradient: "from-primary/10 to-primary/5", iconCls: "text-primary", border: "border-primary/20" },
        ].map((s) => (
          <Card key={s.label} className={cn("relative overflow-hidden border bg-gradient-to-br p-4", s.gradient, s.border)}>
            <div className="flex items-center gap-3">
              <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background/80 shadow-sm")}>
                <s.icon className={cn("h-5 w-5", s.iconCls)} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Controls Bar */}
      <Card className="border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Course Selector */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="h-9 rounded-xl border bg-background px-3 text-sm font-medium max-w-[220px] focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-shadow"
          >
            <option value="">All Courses</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions..."
              className="h-9 rounded-xl ps-9 text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="h-9 rounded-xl border bg-background px-3 text-sm font-medium"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <div className="ms-auto flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex rounded-xl border overflow-hidden">
              {([
                { mode: "cards" as const, icon: LayoutGrid, label: "Cards" },
                { mode: "table" as const, icon: List, label: "Table" },
                { mode: "calendar" as const, icon: CalendarDays, label: "Calendar" },
              ]).map((v) => (
                <button
                  key={v.mode}
                  onClick={() => setView(v.mode)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                    view === v.mode ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  <v.icon className="h-3.5 w-3.5" />{v.label}
                </button>
              ))}
            </div>

            {selectedCourse && (
              <Button asChild className="rounded-xl gradient-brand border-0 text-white shadow-md" size="sm">
                <Link to="/teacher/courses/$courseId/sessions" params={{ courseId: selectedCourse }}>
                  <Plus className="me-1.5 h-4 w-4" />New Session
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Session Type Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter("")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
              !typeFilter ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground hover:bg-accent border-transparent",
            )}
          >
            All Types
          </button>
          {ALL_SESSION_TYPES.map((t) => {
            const meta = SESSION_TYPE_META[t];
            const count = allForCourse.filter((s) => s.sessionType === t).length;
            if (count === 0 && !typeFilter) return null;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(typeFilter === t ? "" : t)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                  typeFilter === t ? cn(meta.color, "border-current/20") : "text-muted-foreground hover:bg-accent border-transparent",
                )}
              >
                {meta.label}
                {count > 0 && <span className="ms-1 opacity-60">{count}</span>}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Templates Quick Access */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-muted-foreground shrink-0 uppercase tracking-wider">Quick Start:</span>
        {BUILT_IN_TEMPLATES.map((tpl) => {
          const meta = SESSION_TYPE_META[tpl.type];
          return (
            <button
              key={tpl.id}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors hover:border-primary/30 hover:bg-primary/5 shrink-0"
            >
              <span className={cn("h-2 w-2 rounded-full", meta.color.split(" ")[1])} />
              {tpl.name}
            </button>
          );
        })}
      </div>

      {/* Cards View */}
      {view === "cards" && (
        <>
          {courseSessions.length === 0 ? (
            <Card className="flex flex-col items-center gap-4 border bg-gradient-to-br from-primary/5 via-background to-violet-500/5 p-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10">
                <Layers className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">
                {selectedCourse ? "No sessions match your filters" : "Select a course to get started"}
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Sessions are premium learning packages that combine video, PDFs, quizzes, exams, and homework into a single experience.
              </p>
              {selectedCourse && (
                <Button asChild className="rounded-xl gradient-brand border-0 text-white mt-2">
                  <Link to="/teacher/courses/$courseId/sessions" params={{ courseId: selectedCourse }}>
                    <Plus className="me-1.5 h-4 w-4" />Create First Session
                  </Link>
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {courseSessions.map((session) => (
                <PremiumSessionCard
                  key={session.id}
                  session={session}
                  courseId={session.courseId}
                  chapterName={chapterMap.get(session.chapterId)}
                  stats={sessionStatsMap.get(session.id) || { materialsCount: 0, questionsCount: 0, quizzesCount: 0, examsCount: 0, homeworkCount: 0 }}
                  onPublish={() => publishSession(session.id)}
                  onArchive={() => archiveSession(session.id)}
                  onDuplicate={() => handleDuplicate(session)}
                  onDelete={() => deleteSession(session.id)}
                  onToggleLock={() => session.accessStatus === "locked" ? unlockSession(session.id) : lockSession(session.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Table View */}
      {view === "table" && (
        <Card className="border bg-card overflow-hidden">
          {courseSessions.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No sessions to display.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground text-xs">Session</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground text-xs">Type</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground text-xs">Status</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground text-xs">Access</th>
                    <th className="px-4 py-3 text-end font-medium text-muted-foreground text-xs">Price</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground text-xs">Materials</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground text-xs">Assess.</th>
                    <th className="px-4 py-3 text-end font-medium text-muted-foreground text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courseSessions.map((session) => {
                    const typeMeta = SESSION_TYPE_META[session.sessionType as SessionWorkspaceType] || SESSION_TYPE_META.lesson;
                    const st = sessionStatsMap.get(session.id);
                    return (
                      <tr key={session.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium truncate max-w-[200px]">{session.title}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{session.publicCode}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn("rounded-full text-[10px] border-0 px-2 py-0", typeMeta.color)}>{typeMeta.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn("rounded-full text-[10px] px-2 py-0",
                            session.status === "published" ? "border-emerald-200 text-emerald-600" : "border-amber-200 text-amber-600"
                          )}>{session.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {session.accessStatus === "locked"
                            ? <Lock className="h-3.5 w-3.5 text-slate-400" />
                            : <Unlock className="h-3.5 w-3.5 text-emerald-500" />}
                        </td>
                        <td className="px-4 py-3 text-end font-medium">{session.price === 0 ? "Free" : `$${session.price}`}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{st?.materialsCount ?? 0}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {(st?.quizzesCount || session.hasQuiz) ? <ClipboardList className="h-3 w-3 text-cyan-500" /> : null}
                            {(st?.examsCount || session.hasExam) ? <BookOpen className="h-3 w-3 text-rose-500" /> : null}
                            {(st?.homeworkCount || session.hasHomework) ? <Pencil className="h-3 w-3 text-orange-500" /> : null}
                            {!st?.quizzesCount && !st?.examsCount && !st?.homeworkCount && !session.hasQuiz && !session.hasExam && !session.hasHomework && (
                              <span className="text-[11px] text-muted-foreground">--</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <Button asChild variant="outline" size="sm" className="h-7 rounded-lg text-[11px] px-2">
                            <Link to="/teacher/courses/$courseId/sessions/$sessionId" params={{ courseId: session.courseId, sessionId: session.id }}>
                              Edit
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Calendar View Placeholder */}
      {view === "calendar" && (
        <Card className="flex flex-col items-center gap-5 border bg-gradient-to-br from-blue-500/5 via-background to-violet-500/5 p-16 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-500/10">
            <CalendarDays className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold">Calendar & Schedule View</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            View sessions on a calendar timeline. See scheduled releases, due dates, and session flow at a glance.
          </p>
          <div className="grid gap-2 sm:grid-cols-3 w-full max-w-lg mt-2">
            {["Scheduled Sessions", "Release Timeline", "Due Dates"].map((label) => (
              <div key={label} className="rounded-xl border border-dashed p-4 text-center">
                <div className="h-8 w-full rounded-lg bg-muted/50 mb-2" />
                <p className="text-[11px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          <Badge variant="outline" className="rounded-full mt-2">Coming Soon</Badge>
        </Card>
      )}

      {/* Session Coverage Summary */}
      {selectedCourse && allForCourse.length > 0 && (
        <Card className="border bg-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />Course Overview
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "Total Sessions", value: allForCourse.length, cls: "text-blue-600" },
              { label: "Published", value: allForCourse.filter((s) => s.status === "published").length, cls: "text-emerald-600" },
              { label: "With Assessment", value: allForCourse.filter((s) => s.hasQuiz || s.hasExam).length, cls: "text-violet-600" },
              { label: "Free Preview", value: allForCourse.filter((s) => s.isFreePreview).length, cls: "text-cyan-600" },
              { label: "Avg. Price", value: `$${allForCourse.length > 0 ? Math.round(allForCourse.reduce((a, s) => a + s.price, 0) / allForCourse.length) : 0}`, cls: "text-primary" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border p-3.5 text-center bg-background/50">
                <p className={cn("text-xl font-bold", item.cls)}>{item.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </DashPage>
  );
}
