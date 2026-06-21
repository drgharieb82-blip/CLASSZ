import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowLeft, Calendar, Clock, DollarSign, Eye, Lock, Pencil, Plus, Trash2, Unlock, Upload } from "lucide-react";
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
import { useTeacherSessionStore, listSessions, type TeacherSession } from "@/lib/teacher/teacher-session-store";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";

export const Route = createFileRoute("/teacher/courses/$courseId/sessions")({
  validateSearch: (search: Record<string, unknown>) => ({
    chapter: (search.chapter as string) || "",
  }),
  component: SessionsPage,
});

const PAGE_SIZE = 10;

function SessionsPage() {
  const { courseId } = Route.useParams();
  const { chapter: initialChapter } = Route.useSearch();
  const course = getCourseById(courseId);
  const chapters = listChapters(courseId);
  const allSessions = useTeacherSessionStore((s) => s.sessions.filter((ses) => ses.courseId === courseId).sort((a, b) => a.order - b.order));
  const createSession = useTeacherSessionStore((s) => s.createSession);
  const deleteSession = useTeacherSessionStore((s) => s.deleteSession);
  const publishSession = useTeacherSessionStore((s) => s.publishSession);
  const lockSession = useTeacherSessionStore((s) => s.lockSession);
  const unlockSession = useTeacherSessionStore((s) => s.unlockSession);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ chapter: initialChapter });
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [chapterId, setChapterId] = useState(initialChapter || chapters[0]?.id || "");
  const [price, setPrice] = useState("0");
  const [isFree, setIsFree] = useState(false);

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

  const handleCreate = () => {
    if (!title.trim() || !chapterId) return;
    createSession({
      courseId,
      chapterId,
      title: title.trim(),
      description: "",
      price: isFree ? 0 : Number(price),
      currency: "USD",
      isFreePreview: isFree,
    });
    setTitle("");
    setPrice("0");
    setIsFree(false);
    setShowCreate(false);
  };

  if (!course) {
    return (
      <DashPage role="teacher" title="Course Not Found" subtitle="" icon={ROLES.teacher.icon}>
        <Button asChild variant="outline" className="rounded-xl"><Link to="/teacher/courses">Back</Link></Button>
      </DashPage>
    );
  }

  return (
    <DashPage role="teacher" title={`Sessions: ${course.title}`} subtitle={course.publicCode} icon={ROLES.teacher.icon}>
      <div className="flex items-center justify-between">
        <Link to="/teacher/courses/$courseId/chapters" params={{ courseId }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Chapters
        </Link>
        <Button onClick={() => setShowCreate(true)} className="rounded-xl gradient-brand border-0 text-white" size="sm">
          <Plus className="me-1.5 h-4 w-4" /> Add Session
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="border bg-card p-5 space-y-3">
          <h3 className="font-semibold">New Session</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Introduction to Limits" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Chapter *</Label>
              <select value={chapterId} onChange={(e) => setChapterId(e.target.value)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm">
                {chapters.length === 0 && <option value="">No chapters — create one first</option>}
                {chapters.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Price (USD)</Label>
              <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} disabled={isFree} className="rounded-xl" />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="rounded" />
                Free Preview
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={!title.trim() || !chapterId} className="rounded-xl gradient-brand border-0 text-white" size="sm">Create Session</Button>
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Filters */}
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

      {/* Session List */}
      {total === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{allSessions.length === 0 ? "No sessions yet" : "No sessions match filters"}</h2>
          <p className="text-sm text-muted-foreground">
            {chapters.length === 0 ? "Create chapters first, then add sessions." : "Add sessions to your chapters."}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {paginated.map((session) => {
            const ch = chapters.find((c) => c.id === session.chapterId);
            return (
              <Card key={session.id} className="flex items-center gap-4 border bg-card px-5 py-4">
                <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm",
                  session.accessStatus === "locked" ? "bg-slate-500/10 text-slate-500" : "bg-emerald-500/10 text-emerald-600"
                )}>
                  {session.accessStatus === "locked" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{session.title}</p>
                    <Badge variant="outline" className={cn("rounded-full text-xs",
                      session.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600"
                    )}>{session.status}</Badge>
                    {session.isFreePreview && <Badge className="rounded-full bg-blue-500/10 text-blue-600 border-0 text-xs">Free Preview</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {session.publicCode} · {ch?.title ?? "Unknown chapter"} · {session.price === 0 ? "Free" : `$${session.price}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {session.status === "draft" && (
                    <Button variant="outline" size="sm" className="rounded-lg text-xs h-8" onClick={() => publishSession(session.id)}>Publish</Button>
                  )}
                  {session.accessStatus === "locked" ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => unlockSession(session.id)}><Unlock className="h-3.5 w-3.5 text-emerald-600" /></Button>
                  ) : (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => lockSession(session.id)}><Lock className="h-3.5 w-3.5 text-amber-600" /></Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => deleteSession(session.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
