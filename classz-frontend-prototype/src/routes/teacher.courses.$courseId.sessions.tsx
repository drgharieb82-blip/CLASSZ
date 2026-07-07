import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft, Calendar, DollarSign, Eye, LayoutGrid, List,
  Lock, Plus, Sparkles, Unlock,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { getCourseById } from "@/lib/teacher/teacher-course-store";
import { listChapters } from "@/lib/teacher/teacher-chapter-store";
import { useTeacherSessionStore, listSessions } from "@/lib/teacher/teacher-session-store";
import { useTeacherMaterialStore } from "@/lib/teacher/teacher-material-store";
import { useTeacherQuestionStore } from "@/lib/teacher/teacher-question-store";
import { useTeacherQuizStore } from "@/lib/teacher/teacher-quiz-store";
import { useTeacherExamStore } from "@/lib/teacher/teacher-exam-store";
import { useTeacherHomeworkStore } from "@/lib/teacher/teacher-homework-store";
import {
  SESSION_TYPE_META, type SessionWorkspaceType,
} from "@/lib/teacher/session-workspace-types";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { PremiumSessionCard, type SessionStats } from "@/components/session/PremiumSessionCard";

export const Route = createFileRoute("/teacher/courses/$courseId/sessions")({
  validateSearch: (search: Record<string, unknown>) => ({
    chapter: (search.chapter as string) || "",
  }),
  component: SessionsPage,
});

const PAGE_SIZE = 12;

function SessionsPage() {
  const { courseId } = Route.useParams();
  const { chapter: initialChapter } = Route.useSearch();
  const course = getCourseById(courseId);
  const chapters = listChapters(courseId);
  const allSessions = useTeacherSessionStore((s) => s.sessions.filter((ses) => ses.courseId === courseId).sort((a, b) => a.order - b.order));
  const createSession = useTeacherSessionStore((s) => s.createSession);
  const loadSessions = useTeacherSessionStore((s) => s.loadSessions);
  const isLoading = useTeacherSessionStore((s) => s.isLoading);
  const deleteSession = useTeacherSessionStore((s) => s.deleteSession);
  const publishSession = useTeacherSessionStore((s) => s.publishSession);
  const archiveSession = useTeacherSessionStore((s) => s.archiveSession);
  const lockSession = useTeacherSessionStore((s) => s.lockSession);
  const unlockSession = useTeacherSessionStore((s) => s.unlockSession);
  const allMaterials = useTeacherMaterialStore((s) => s.materials);
  const allQuestions = useTeacherQuestionStore((s) => s.questions);
  const allQuizzes = useTeacherQuizStore((s) => s.quizzes);
  const allExams = useTeacherExamStore((s) => s.exams);
  const allHomework = useTeacherHomeworkStore((s) => s.items);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ chapter: initialChapter });
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [title, setTitle] = useState("");
  const [chapterId, setChapterId] = useState(initialChapter || chapters[0]?.id || "");
  const [price, setPrice] = useState("0");
  const [isFree, setIsFree] = useState(false);
  const [sessionType, setSessionType] = useState<string>("lesson");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSessions(courseId);
  }, [courseId]);

  const filterOptions: FilterOption[] = [
    { key: "chapter", label: "Chapter", options: chapters.map((c) => ({ value: c.id, label: c.title })) },
    { key: "status", label: "Status", options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
      { value: "archived", label: "Archived" },
    ]},
    { key: "access", label: "Access", options: [
      { value: "locked", label: "Locked" },
      { value: "unlocked", label: "Unlocked" },
      { value: "scheduled", label: "Scheduled" },
    ]},
    { key: "preview", label: "Free Preview", options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ]},
  ];

  const filtered = useMemo(() => {
    let result = [...allSessions];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.title.toLowerCase().includes(q) || s.publicCode.includes(q));
    }
    if (filters.chapter) result = result.filter((s) => s.chapterId === filters.chapter);
    if (filters.status) result = result.filter((s) => s.status === filters.status);
    if (filters.access) result = result.filter((s) => s.accessStatus === filters.access);
    if (filters.preview === "yes") result = result.filter((s) => s.isFreePreview);
    if (filters.preview === "no") result = result.filter((s) => !s.isFreePreview);
    return result;
  }, [allSessions, search, filters]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const chapterMap = useMemo(
    () => new Map(chapters.map((c) => [c.id, c.title])),
    [chapters],
  );

  const sessionStatsMap = useMemo(() => {
    const map = new Map<string, SessionStats>();
    for (const session of paginated) {
      map.set(session.id, {
        materialsCount: allMaterials.filter((m) => m.sessionId === session.id || m.linkedSessionIds?.includes(session.id)).length,
        questionsCount: allQuestions.filter((q) => q.sessionId === session.id || q.sessionIds?.includes(session.id)).length,
        quizzesCount: allQuizzes.filter((q) => q.sessionIds?.includes(session.id)).length,
        examsCount: allExams.filter((e) => e.sessionIds?.includes(session.id)).length,
        homeworkCount: allHomework.filter((h) => h.sessionIds?.includes(session.id)).length,
      });
    }
    return map;
  }, [paginated, allMaterials, allQuestions, allQuizzes, allExams, allHomework]);

  const handleCreate = async () => {
    if (!title.trim() || !chapterId) return;
    setSaving(true);
    await createSession({
      courseId,
      chapterIds: [chapterId],
      title: title.trim(),
      description: "",
      price: isFree ? 0 : Number(price),
      currency: "USD",
      isFreePreview: isFree,
      sessionType: sessionType as any,
    });
    setSaving(false);
    setTitle("");
    setPrice("0");
    setIsFree(false);
    setShowCreate(false);
  };

  const handleDuplicate = (session: typeof allSessions[0]) => {
    void createSession({
      courseId,
      chapterIds: session.chapterId ? [session.chapterId] : [],
      title: `${session.title} (Copy)`,
      description: session.description,
      price: session.price,
      currency: session.currency,
      sessionType: session.sessionType,
      isFreePreview: session.isFreePreview,
    });
  };

  if (!course) {
    return (
      <DashPage role="teacher" title="Course Not Found" subtitle="" icon={ROLES.teacher.icon}>
        <Button asChild variant="outline" className="rounded-xl"><Link to="/teacher/courses">Back</Link></Button>
      </DashPage>
    );
  }

  const publishedCount = allSessions.filter((s) => s.status === "published").length;
  const draftCount = allSessions.filter((s) => s.status === "draft").length;
  const totalPrice = allSessions.reduce((a, s) => a + s.price, 0);

  return (
    <DashPage role="teacher" title={`Sessions: ${course.title}`} subtitle={course.publicCode} icon={ROLES.teacher.icon}>
      <div className="flex items-center justify-between">
        <Link to="/teacher/courses/$courseId/chapters" params={{ courseId }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Chapters
        </Link>
        <Button onClick={() => setShowCreate(true)} className="rounded-xl gradient-brand border-0 text-white shadow-md" size="sm">
          <Plus className="me-1.5 h-4 w-4" /> New Session
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: allSessions.length, icon: Calendar, cls: "text-blue-500", bg: "from-blue-500/10 to-blue-600/5" },
          { label: "Published", value: publishedCount, icon: Eye, cls: "text-emerald-500", bg: "from-emerald-500/10 to-emerald-600/5" },
          { label: "Drafts", value: draftCount, icon: Sparkles, cls: "text-amber-500", bg: "from-amber-500/10 to-amber-600/5" },
          { label: "Total Value", value: `$${totalPrice}`, icon: DollarSign, cls: "text-primary", bg: "from-primary/10 to-primary/5" },
        ].map((s) => (
          <Card key={s.label} className={cn("flex items-center gap-3 border bg-gradient-to-br p-4", s.bg)}>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background/80 shadow-sm">
              <s.icon className={cn("h-5 w-5", s.cls)} />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-violet-500/5 p-6 space-y-4">
          <h3 className="font-semibold text-lg">Create New Session</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Introduction to Limits" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Chapter *</Label>
              <select value={chapterId} onChange={(e) => setChapterId(e.target.value)} className="w-full h-10 rounded-xl border bg-background px-3 text-sm">
                {chapters.length === 0 && <option value="">No chapters — create one first</option>}
                {chapters.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Session Type</Label>
              <select value={sessionType} onChange={(e) => setSessionType(e.target.value)} className="w-full h-10 rounded-xl border bg-background px-3 text-sm">
                {(["lesson", "revision", "practice", "quiz", "exam", "homework", "mixed"] as const).map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Price (USD)</Label>
              <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} disabled={isFree} className="rounded-xl" />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="rounded" />
                Free Preview
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleCreate} disabled={!title.trim() || !chapterId || saving} className="rounded-xl gradient-brand border-0 text-white" size="sm">
              {saving ? "Creating…" : "Create Session"}
            </Button>
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Filters + View Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <FilterBar
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            filters={filterOptions}
            activeFilters={filters}
            onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }}
            onClearFilters={() => { setFilters({}); setPage(1); }}
            totalResults={total}
            placeholder="Search sessions..."
          />
        </div>
        <div className="flex rounded-xl border overflow-hidden shrink-0">
          <button onClick={() => setViewMode("cards")} className={cn("px-3 py-1.5 text-xs font-medium transition-colors", viewMode === "cards" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setViewMode("list")} className={cn("px-3 py-1.5 text-xs font-medium transition-colors border-s", viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Session Cards/List */}
      {isLoading ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading sessions…</p>
        </Card>
      ) : total === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-gradient-to-br from-primary/5 via-card to-violet-500/5 p-16 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{allSessions.length === 0 ? "No sessions yet" : "No sessions match filters"}</h2>
          <p className="text-sm text-muted-foreground">
            {chapters.length === 0 ? "Create chapters first, then add sessions." : "Add sessions to your chapters to get started."}
          </p>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {paginated.map((session) => (
            <PremiumSessionCard
              key={session.id}
              session={session}
              courseId={courseId}
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
      ) : (
        <div className="space-y-2">
          {paginated.map((session) => {
            const typeMeta = SESSION_TYPE_META[session.sessionType as SessionWorkspaceType] || SESSION_TYPE_META.lesson;
            const ch = chapterMap.get(session.chapterId);
            return (
              <Card key={session.id} className="flex items-center gap-4 border bg-card px-5 py-4 hover:border-primary/20 transition-colors">
                <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm",
                  session.accessStatus === "locked" ? "bg-slate-500/10 text-slate-500" : "bg-emerald-500/10 text-emerald-600"
                )}>
                  {session.accessStatus === "locked" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{session.title}</p>
                    <Badge className={cn("rounded-full text-[10px] border-0 px-2 py-0", typeMeta.color)}>{typeMeta.label}</Badge>
                    <Badge variant="outline" className={cn("rounded-full text-[10px] px-2 py-0",
                      session.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600"
                    )}>{session.status}</Badge>
                    {session.isFreePreview && <Badge className="rounded-full bg-blue-500/10 text-blue-600 border-0 text-[10px] px-2 py-0">Free</Badge>}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {session.publicCode} · {ch ?? "Unknown chapter"} · {session.price === 0 ? "Free" : `$${session.price}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button asChild variant="outline" size="sm" className="rounded-lg text-xs h-8">
                    <Link to="/teacher/courses/$courseId/sessions/$sessionId" params={{ courseId, sessionId: session.id }}>Edit</Link>
                  </Button>
                  {session.status === "draft" && (
                    <Button variant="outline" size="sm" className="rounded-lg text-xs h-8" onClick={() => publishSession(session.id)}>Publish</Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </DashPage>
  );
}
