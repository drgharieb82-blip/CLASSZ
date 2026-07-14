import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ArrowLeft, FolderTree, Lock, Pencil, Plus, Trash2, Unlock, Upload } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { getCourseById } from "@/lib/teacher/teacher-course-store";
import { useTeacherChapterStore, listChapters, type TeacherChapter } from "@/lib/teacher/teacher-chapter-store";
import { listSessions } from "@/lib/teacher/teacher-session-store";

export const Route = createFileRoute("/teacher/courses/$courseId/chapters")({
  component: ChaptersPage,
});

function ChaptersPage() {
  const { courseId } = Route.useParams();
  const course = getCourseById(courseId);
  const rawChapters = useTeacherChapterStore((s) => s.chapters);
  const chapters = useMemo(
    () => rawChapters.filter((c) => c.courseId === courseId).sort((a, b) => a.order - b.order),
    [rawChapters, courseId],
  );
  const createChapter = useTeacherChapterStore((s) => s.createChapter);
  const loadChapters = useTeacherChapterStore((s) => s.loadChapters);
  const isLoading = useTeacherChapterStore((s) => s.isLoading);
  const deleteChapter = useTeacherChapterStore((s) => s.deleteChapter);
  const publishChapter = useTeacherChapterStore((s) => s.publishChapter);
  const archiveChapter = useTeacherChapterStore((s) => s.archiveChapter);
  const updateChapter = useTeacherChapterStore((s) => s.updateChapter);

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadChapters(courseId);
  }, [courseId]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await createChapter({ courseId, title: title.trim(), description: description.trim() });
    setSaving(false);
    setTitle("");
    setDescription("");
    setShowCreate(false);
  };

  const handleEdit = (ch: TeacherChapter) => {
    setEditId(ch.id);
    setTitle(ch.title);
    setDescription(ch.description);
  };

  const handleSaveEdit = async () => {
    if (!editId || !title.trim()) return;
    setSaving(true);
    try {
      const ok = await updateChapter(editId, { title: title.trim(), description: description.trim() });
      if (!ok) { toast.error("Could not save the chapter. Check your connection and try again."); return; }
      setEditId(null);
      setTitle("");
      setDescription("");
    } finally {
      setSaving(false);
    }
  };

  if (!course) {
    return (
      <DashPage role="teacher" title="Course Not Found" subtitle="" icon={ROLES.teacher.icon}>
        <Button asChild variant="outline" className="rounded-xl"><Link to="/teacher/courses">Back</Link></Button>
      </DashPage>
    );
  }

  return (
    <DashPage role="teacher" title={`Chapters: ${course.title}`} subtitle={course.publicCode} icon={ROLES.teacher.icon}>
      <div className="flex items-center justify-between">
        <Link to="/teacher/courses/$courseId/edit" params={{ courseId }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Course
        </Link>
        <Button onClick={() => { setShowCreate(true); setEditId(null); setTitle(""); setDescription(""); }} className="rounded-xl gradient-brand border-0 text-white" size="sm">
          <Plus className="me-1.5 h-4 w-4" /> Add Chapter
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(showCreate || editId) && (
        <Card className="border bg-card p-5 space-y-3">
          <h3 className="font-semibold">{editId ? "Edit Chapter" : "New Chapter"}</h3>
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Differential Calculus" className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." className="rounded-xl" />
          </div>
          <div className="flex gap-2">
            <Button onClick={editId ? handleSaveEdit : handleCreate} disabled={saving} className="rounded-xl gradient-brand border-0 text-white" size="sm">
              {editId ? "Save" : saving ? "Creating…" : "Create Chapter"}
            </Button>
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => { setShowCreate(false); setEditId(null); }}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Chapter List */}
      {isLoading ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading chapters…</p>
        </Card>
      ) : chapters.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <FolderTree className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No chapters yet</h2>
          <p className="text-sm text-muted-foreground">Add chapters to organize your course content.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {chapters.map((ch) => {
            const sessionCount = listSessions(courseId, ch.id).length;
            return (
              <Card key={ch.id} className="flex items-center gap-4 border bg-card px-5 py-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                  {ch.order}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{ch.title}</p>
                    <Badge variant="outline" className={cn("rounded-full text-xs",
                      ch.status === "published" ? "border-emerald-300 text-emerald-600" :
                      ch.status === "archived" ? "border-slate-300 text-slate-500" : "border-amber-300 text-amber-600"
                    )}>{ch.status}</Badge>
                    {ch.isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{ch.publicCode} · {sessionCount} sessions{ch.description ? ` · ${ch.description}` : ""}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button asChild variant="outline" size="sm" className="rounded-lg text-xs h-8">
                    <Link to="/teacher/courses/$courseId/sessions" params={{ courseId }} search={{ chapter: ch.id }}>Sessions</Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEdit(ch)}><Pencil className="h-3.5 w-3.5" /></Button>
                  {ch.status === "draft" && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => publishChapter(ch.id)}><Upload className="h-3.5 w-3.5 text-emerald-600" /></Button>}
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={async () => { const ok = await deleteChapter(ch.id); if (!ok) toast.error("Could not delete the chapter. Check your connection and try again."); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashPage>
  );
}
