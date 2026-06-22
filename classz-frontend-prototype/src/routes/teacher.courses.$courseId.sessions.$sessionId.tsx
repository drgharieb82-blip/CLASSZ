import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDown, ArrowLeft, ArrowUp, BookOpen, ClipboardList, Eye, EyeOff, File, FileText,
  HelpCircle, Image, Library, Pencil, Play, Plus, StickyNote, Sparkles, Trash2, Video,
} from "lucide-react";
import { getPublishedQuizzesForSession } from "@/lib/teacher/teacher-quiz-store";
import { getPublishedExamsForSession } from "@/lib/teacher/teacher-exam-store";
import { getPublishedHomeworkForSession } from "@/lib/teacher/teacher-homework-store";
import { getPublishedAssignmentsForSession } from "@/lib/teacher/teacher-assignment-store";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { getCourseById } from "@/lib/teacher/teacher-course-store";
import { getSessionById } from "@/lib/teacher/teacher-session-store";
import { getChapterById } from "@/lib/teacher/teacher-chapter-store";
import {
  useTeacherMaterialStore, listMaterials,
  type TeacherMaterial, type MaterialType, type CreateMaterialData,
} from "@/lib/teacher/teacher-material-store";

export const Route = createFileRoute("/teacher/courses/$courseId/sessions/$sessionId")({
  component: SessionMaterialsPage,
});

const TYPE_META: Record<MaterialType, { icon: React.ElementType; label: string; color: string }> = {
  video: { icon: Video, label: "Video", color: "text-blue-500 bg-blue-500/10" },
  pdf: { icon: FileText, label: "PDF", color: "text-rose-500 bg-rose-500/10" },
  image: { icon: Image, label: "Image", color: "text-emerald-500 bg-emerald-500/10" },
  attachment: { icon: File, label: "Attachment", color: "text-amber-500 bg-amber-500/10" },
  notes: { icon: StickyNote, label: "Notes", color: "text-violet-500 bg-violet-500/10" },
};

function SessionMaterialsPage() {
  const { courseId, sessionId } = Route.useParams();
  const course = getCourseById(courseId);
  const session = getSessionById(sessionId);
  const chapter = session ? getChapterById(session.chapterId) : undefined;
  const materials = useTeacherMaterialStore((s) =>
    s.materials.filter((m) => m.sessionId === sessionId).sort((a, b) => a.order - b.order),
  );
  const createMaterial = useTeacherMaterialStore((s) => s.createMaterial);
  const deleteMaterial = useTeacherMaterialStore((s) => s.deleteMaterial);
  const publishMaterial = useTeacherMaterialStore((s) => s.publishMaterial);
  const unpublishMaterial = useTeacherMaterialStore((s) => s.unpublishMaterial);
  const reorderMaterials = useTeacherMaterialStore((s) => s.reorderMaterials);

  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<MaterialType>("video");
  const [addTitle, setAddTitle] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [addDuration, setAddDuration] = useState("");
  const [addFileName, setAddFileName] = useState("");
  const [addNotes, setAddNotes] = useState("");

  if (!course || !session) {
    return (
      <DashPage role="teacher" title="Session Not Found" subtitle="" icon={ROLES.teacher.icon}>
        <Button asChild variant="outline" className="rounded-xl"><Link to="/teacher/courses">Back to Courses</Link></Button>
      </DashPage>
    );
  }

  const handleCreate = () => {
    if (!addTitle.trim()) return;
    const data: CreateMaterialData = {
      sessionId,
      courseId,
      chapterId: session.chapterId,
      type: addType,
      title: addTitle.trim(),
    };
    if (addType === "video") {
      data.videoUrl = addUrl || "https://example.com/video.mp4";
      data.videoDuration = addDuration || "15:00";
    } else if (addType === "notes") {
      data.notesContent = addNotes;
    } else {
      data.fileUrl = addUrl || "https://example.com/file";
      data.fileName = addFileName || `${addTitle.trim()}.${addType === "pdf" ? "pdf" : addType === "image" ? "png" : "zip"}`;
      data.fileSize = "2.4 MB";
      data.fileType = addType === "pdf" ? "PDF" : addType === "image" ? "PNG" : "ZIP";
    }
    createMaterial(data);
    setAddTitle("");
    setAddUrl("");
    setAddDuration("");
    setAddFileName("");
    setAddNotes("");
    setShowAdd(false);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const ids = materials.map((m) => m.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    reorderMaterials(sessionId, ids);
  };

  const moveDown = (index: number) => {
    if (index >= materials.length - 1) return;
    const ids = materials.map((m) => m.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    reorderMaterials(sessionId, ids);
  };

  return (
    <DashPage role="teacher" title={`Materials: ${session.title}`} subtitle={`${course.title} · ${chapter?.title ?? ""} · ${session.publicCode}`} icon={ROLES.teacher.icon}>
      <div className="flex items-center justify-between">
        <Link to="/teacher/courses/$courseId/sessions" params={{ courseId }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Sessions
        </Link>
        <Button onClick={() => setShowAdd(true)} className="rounded-xl gradient-brand border-0 text-white" size="sm">
          <Plus className="me-1.5 h-4 w-4" /> Add Material
        </Button>
      </div>

      {/* Add Material Form */}
      {showAdd && (
        <Card className="border bg-card p-5 space-y-4">
          <h3 className="font-semibold">Add Material</h3>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TYPE_META) as MaterialType[]).map((t) => {
              const meta = TYPE_META[t];
              return (
                <button key={t} onClick={() => setAddType(t)} className={cn("flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors", addType === t ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>
                  <meta.icon className="h-3.5 w-3.5" /> {meta.label}
                </button>
              );
            })}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={addTitle} onChange={(e) => setAddTitle(e.target.value)} placeholder="e.g. Introduction Video" className="rounded-xl" />
            </div>
            {addType === "video" && (
              <>
                <div className="space-y-1.5">
                  <Label>Video URL</Label>
                  <Input value={addUrl} onChange={(e) => setAddUrl(e.target.value)} placeholder="https://..." className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Duration</Label>
                  <Input value={addDuration} onChange={(e) => setAddDuration(e.target.value)} placeholder="15:00" className="rounded-xl" />
                </div>
              </>
            )}
            {(addType === "pdf" || addType === "image" || addType === "attachment") && (
              <>
                <div className="space-y-1.5">
                  <Label>File URL / Upload</Label>
                  <Input value={addUrl} onChange={(e) => setAddUrl(e.target.value)} placeholder="https://... or select file" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>File Name</Label>
                  <Input value={addFileName} onChange={(e) => setAddFileName(e.target.value)} placeholder="document.pdf" className="rounded-xl" />
                </div>
              </>
            )}
            {addType === "notes" && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Notes Content</Label>
                <textarea value={addNotes} onChange={(e) => setAddNotes(e.target.value)} rows={4} placeholder="Write lesson notes here..." className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={!addTitle.trim()} className="rounded-xl gradient-brand border-0 text-white" size="sm">Add Material</Button>
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Materials List */}
      {materials.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <Play className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No materials yet</h2>
          <p className="text-sm text-muted-foreground">Add videos, PDFs, images, or notes to this session.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {materials.map((mat, index) => {
            const meta = TYPE_META[mat.type];
            const Icon = meta.icon;
            return (
              <Card key={mat.id} className="flex items-center gap-3 border bg-card px-4 py-3">
                {/* Order arrows */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => moveUp(index)} disabled={index === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => moveDown(index)} disabled={index === materials.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Type icon */}
                <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", meta.color)}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{mat.title}</p>
                    <Badge variant="outline" className={cn("rounded-full text-xs", mat.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{mat.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {meta.label}
                    {mat.videoDuration ? ` · ${mat.videoDuration}` : ""}
                    {mat.fileName ? ` · ${mat.fileName}` : ""}
                    {mat.fileSize ? ` · ${mat.fileSize}` : ""}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {mat.status === "draft" ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => publishMaterial(mat.id)} title="Publish">
                      <Eye className="h-3.5 w-3.5 text-emerald-600" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => unpublishMaterial(mat.id)} title="Unpublish">
                      <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => deleteMaterial(mat.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {materials.length > 0 && (
        <Card className="border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            {materials.length} materials · {materials.filter((m) => m.status === "published").length} published · {materials.filter((m) => m.type === "video").length} videos · {materials.filter((m) => m.type === "pdf").length} PDFs
          </p>
        </Card>
      )}

      {/* Session Blocks */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2"><Library className="h-4 w-4 text-primary" /> Session Blocks</h3>

        {/* Library Picker */}
        <Card className="border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Materials</span>
              <Badge variant="outline" className="rounded-full text-xs">{materials.length} items</Badge>
            </div>
            <Link to="/teacher/materials" className="text-xs text-primary hover:underline">Open Library →</Link>
          </div>
        </Card>

        {/* Practice Block */}
        <Card className="border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium">Practice Questions</span>
              <Badge variant="outline" className="rounded-full text-xs">{session.questionIds?.length || 0} selected</Badge>
            </div>
            <Link to="/teacher/questions" className="text-xs text-primary hover:underline">Select from Bank →</Link>
          </div>
        </Card>

        {/* Quiz Block - Active */}
        {(() => {
          const quizzes = getPublishedQuizzesForSession(sessionId);
          if (quizzes.length > 0) {
            return quizzes.map((qz) => (
              <Card key={qz.id} className="border border-violet-500/20 bg-violet-500/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-violet-500" />
                    <span className="text-sm font-medium">{qz.title}</span>
                    <Badge variant="outline" className="rounded-full text-xs border-violet-300 text-violet-600">{qz.questionIds.length} Q · {qz.durationMinutes}m · +{qz.xpReward} XP</Badge>
                  </div>
                  <Link to="/teacher/quizzes/$quizId/edit" params={{ quizId: qz.id }} className="text-xs text-primary hover:underline">Edit</Link>
                </div>
              </Card>
            ));
          }
          return (
            <Card className="border border-dashed bg-card/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-violet-500" />
                  <span className="text-sm font-medium text-muted-foreground">Quiz</span>
                  <Badge variant="outline" className="rounded-full text-xs text-muted-foreground">No quiz attached</Badge>
                </div>
                <Link to="/teacher/quizzes/create" className="text-xs text-primary hover:underline">Create Quiz →</Link>
              </div>
            </Card>
          );
        })()}

        {/* Exam Block - Active */}
        {(() => {
          const exams = getPublishedExamsForSession(sessionId);
          if (exams.length > 0) return exams.map((ex) => (
            <Card key={ex.id} className="border border-rose-500/20 bg-rose-500/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-rose-500" /><span className="text-sm font-medium">{ex.title}</span>
                  <Badge variant="outline" className="rounded-full text-xs border-rose-300 text-rose-600">{ex.questionIds.length} Q · {ex.durationMinutes}m · +{ex.examXpReward} XP</Badge></div>
                <Link to="/teacher/exams/$examId/edit" params={{ examId: ex.id }} className="text-xs text-primary hover:underline">Edit</Link>
              </div>
            </Card>
          ));
          return (
            <Card className="border border-dashed bg-card/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-rose-500" /><span className="text-sm font-medium text-muted-foreground">Exam</span><Badge variant="outline" className="rounded-full text-xs text-muted-foreground">No exam attached</Badge></div>
                <Link to="/teacher/exams/create" className="text-xs text-primary hover:underline">Create Exam →</Link>
              </div>
            </Card>
          );
        })()}

        {/* Homework Block - Active */}
        {(() => {
          const hws = getPublishedHomeworkForSession(sessionId);
          if (hws.length > 0) return hws.map((hw) => (
            <Card key={hw.id} className="border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Pencil className="h-4 w-4 text-amber-500" /><span className="text-sm font-medium">{hw.title}</span>
                  <Badge variant="outline" className="rounded-full text-xs border-amber-300 text-amber-600">{hw.homeworkType}{hw.dueDate ? ` · Due ${hw.dueDate}` : ""}</Badge></div>
              </div>
            </Card>
          ));
          return (
            <Card className="border border-dashed bg-card/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Pencil className="h-4 w-4 text-amber-500" /><span className="text-sm font-medium text-muted-foreground">Homework</span><Badge variant="outline" className="rounded-full text-xs text-muted-foreground">No homework attached</Badge></div>
                <Link to="/teacher/homework/create" className="text-xs text-primary hover:underline">Create Homework →</Link>
              </div>
            </Card>
          );
        })()}

        {/* Assignment Block - Active */}
        {(() => {
          const asns = getPublishedAssignmentsForSession(sessionId);
          if (asns.length > 0) return asns.map((asn) => (
            <Card key={asn.id} className="border border-cyan-500/20 bg-cyan-500/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-cyan-500" /><span className="text-sm font-medium">{asn.title}</span>
                  <Badge variant="outline" className="rounded-full text-xs border-cyan-300 text-cyan-600">{asn.assignmentType}{asn.dueDate ? ` · Due ${asn.dueDate}` : ""}</Badge></div>
              </div>
            </Card>
          ));
          return null;
        })()}
      </div>
    </DashPage>
  );
}
