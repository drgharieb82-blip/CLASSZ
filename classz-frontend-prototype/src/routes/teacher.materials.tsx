import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown, ArrowUp, BookOpen, Clock, Copy, Download, Eye, EyeOff, File, FileText, Film,
  Image, Link2, PlayCircle, Pencil, Plus, StickyNote, Trash2, Upload, Video, X,
} from "lucide-react";
import { toast } from "sonner";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import {
  useTeacherMaterialStore, type TeacherMaterial, type MaterialType, type CreateMaterialData, type VideoSegment,
} from "@/lib/teacher/teacher-material-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { useTeacherChapterStore, type TeacherChapter } from "@/lib/teacher/teacher-chapter-store";
import { useTeacherLessonStore, type TeacherLesson } from "@/lib/teacher/teacher-lesson-store";
import { useTeacherConceptStore, type TeacherConcept } from "@/lib/teacher/teacher-concept-store";
import { useTeacherAtomicConceptStore, type TeacherAtomicConcept } from "@/lib/teacher/teacher-atomic-concept-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { uploadMaterialFile } from "@/lib/api/uploads";
import { resolveFileUrl } from "@/lib/api/client";

export const Route = createFileRoute("/teacher/materials")({ component: MaterialLibraryPage });

const PAGE_SIZE = 12;
const TYPE_META: Record<MaterialType, { icon: React.ElementType; label: string; color: string }> = {
  video: { icon: Video, label: "Video", color: "text-blue-500 bg-blue-500/10" },
  pdf: { icon: FileText, label: "PDF", color: "text-rose-500 bg-rose-500/10" },
  image: { icon: Image, label: "Image", color: "text-emerald-500 bg-emerald-500/10" },
  attachment: { icon: File, label: "Attachment", color: "text-amber-500 bg-amber-500/10" },
  notes: { icon: StickyNote, label: "Notes", color: "text-violet-500 bg-violet-500/10" },
  document: { icon: FileText, label: "Document", color: "text-sky-500 bg-sky-500/10" },
  audio: { icon: Film, label: "Audio", color: "text-fuchsia-500 bg-fuchsia-500/10" },
};



function buildFilterOptions(courses: { id: string; title: string }[]): FilterOption[] {
  return [
    { key: "type", label: "Type", options: [{ value: "video", label: "Video" }, { value: "pdf", label: "PDF" }, { value: "image", label: "Image" }, { value: "document", label: "Document" }, { value: "audio", label: "Audio" }, { value: "attachment", label: "Attachment" }, { value: "notes", label: "Notes" }] },
    { key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }] },
    { key: "usage", label: "Usage", options: [{ value: "used", label: "Used in sessions" }, { value: "unused", label: "Unused" }] },
    { key: "course", label: "Course", options: courses.map((c) => ({ value: c.id, label: c.title })) },
  ];
}

const SOURCES = ["Upload File", "YouTube", "Vimeo", "External URL", "Cloud Storage"];

// Must stay in sync with backend ALLOWED_CONTENT_TYPES in uploads/router.py.
const UPLOAD_ACCEPT: Record<MaterialType, string> = {
  video: "video/mp4,video/webm,video/quicktime",
  pdf: "application/pdf",
  image: "image/jpeg,image/png,image/webp",
  document: ".doc,.docx,.ppt,.pptx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  audio: "audio/mpeg,audio/wav,audio/mp4,audio/ogg",
  attachment: "application/zip,application/x-zip-compressed",
  notes: "",
};

function MaterialLibraryPage() {
  const materials = useTeacherMaterialStore((s) => s.materials);
  const courses = useTeacherCourseStore((s) => s.courses);
  const loadCourses = useTeacherCourseStore((s) => s.loadCourses);
  const createMaterial = useTeacherMaterialStore((s) => s.createMaterial);
  const loadMaterials = useTeacherMaterialStore((s) => s.loadMaterials);
  const updateMaterial = useTeacherMaterialStore((s) => s.updateMaterial);
  const deleteMaterial = useTeacherMaterialStore((s) => s.deleteMaterial);
  const publishMaterial = useTeacherMaterialStore((s) => s.publishMaterial);
  const unpublishMaterial = useTeacherMaterialStore((s) => s.unpublishMaterial);
  const user = useAuthStore((s) => s.user);
  const chapters = useTeacherChapterStore((s) => s.chapters);
  const loadChapters = useTeacherChapterStore((s) => s.loadChapters);
  const lessons = useTeacherLessonStore((s) => s.lessons);
  const loadLessons = useTeacherLessonStore((s) => s.loadLessons);
  const concepts = useTeacherConceptStore((s) => s.concepts);
  const loadConcepts = useTeacherConceptStore((s) => s.loadConcepts);
  const atomicConcepts = useTeacherAtomicConceptStore((s) => s.atomicConcepts);
  const loadAtomicConcepts = useTeacherAtomicConceptStore((s) => s.loadAtomicConcepts);

  const [search, setSearch] = useState(""); const [filters, setFilters] = useState<Record<string, string>>({}); const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadSource, setUploadSource] = useState("Upload File");
  const [uploadType, setUploadType] = useState<MaterialType>("video");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadDuration, setUploadDuration] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadCourseId, setUploadCourseId] = useState("");
  const [uploadLocalFile, setUploadLocalFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  useEffect(() => {
    if (user?.id) loadCourses(user.id);
  }, [user?.id, loadCourses]);

  // Materials are course-scoped in the backend (real materials require a real
  // course_id — see Knowledge Graph Integration Milestone 1); hydrate the
  // library by loading each of the teacher's courses' materials.
  useEffect(() => {
    courses.forEach((c) => loadMaterials(c.id));
  }, [courses, loadMaterials]);

  useEffect(() => {
    if (!uploadCourseId) return;
    loadChapters(uploadCourseId);
  }, [uploadCourseId, loadChapters]);

  const courseChapters = useMemo(
    () => chapters.filter((chapter) => chapter.courseId === uploadCourseId).sort((a, b) => a.order - b.order),
    [chapters, uploadCourseId],
  );

  useEffect(() => {
    courseChapters.forEach((chapter) => loadLessons(chapter.id));
  }, [courseChapters, loadLessons]);

  const courseLessons = useMemo(() => {
    const chapterIds = new Set(courseChapters.map((chapter) => chapter.id));
    return lessons.filter((lesson) => chapterIds.has(lesson.chapterId)).sort((a, b) => a.order - b.order);
  }, [courseChapters, lessons]);

  useEffect(() => {
    courseLessons.forEach((lesson) => loadConcepts(lesson.id));
  }, [courseLessons, loadConcepts]);

  const courseConcepts = useMemo(() => {
    const lessonIds = new Set(courseLessons.map((lesson) => lesson.id));
    return concepts.filter((concept) => lessonIds.has(concept.lessonId)).sort((a, b) => a.order - b.order);
  }, [courseLessons, concepts]);

  useEffect(() => {
    courseConcepts.forEach((concept) => loadAtomicConcepts(concept.id));
  }, [courseConcepts, loadAtomicConcepts]);

  const courseAtomicConcepts = useMemo(() => {
    const conceptIds = new Set(courseConcepts.map((concept) => concept.id));
    return atomicConcepts.filter((atomicConcept) => conceptIds.has(atomicConcept.conceptId)).sort((a, b) => a.order - b.order);
  }, [courseConcepts, atomicConcepts]);

  const filtered = useMemo(() => {
    let r = [...materials].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (search) { const q = search.toLowerCase(); r = r.filter((m) => m.title.toLowerCase().includes(q)); }
    if (filters.type) r = r.filter((m) => m.type === filters.type);
    if (filters.status) r = r.filter((m) => m.status === filters.status);
    if (filters.usage === "used") r = r.filter((m) => (m.linkedSessionIds?.length || 0) > 0 || m.sessionId);
    if (filters.usage === "unused") r = r.filter((m) => (m.linkedSessionIds?.length || 0) === 0 && !m.sessionId);
    if (filters.course) r = r.filter((m) => m.courseId === filters.course);
    return r;
  }, [materials, search, filters]);

  const total = filtered.length; const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const videoCount = materials.filter((m) => m.type === "video").length;
  const pdfCount = materials.filter((m) => m.type === "pdf").length;
  const usedCount = materials.filter((m) => (m.linkedSessionIds?.length || 0) > 0 || m.sessionId).length;

  const addSegment = () => {
    setSegments([...segments, { id: `seg-${Date.now()}`, startTime: 0, endTime: 0, title: "", chapterIds: [], lessonIds: [], conceptIds: [], atomicConceptIds: [] }]);
  };

  const updateSegment = (idx: number, patch: Partial<VideoSegment>) => {
    setSegments(segments.map((s, i) => i === idx ? { ...s, ...patch } : s));
  };

  const removeSegment = (idx: number) => setSegments(segments.filter((_, i) => i !== idx));
  const moveSegment = (idx: number, dir: -1 | 1) => {
    if (idx + dir < 0 || idx + dir >= segments.length) return;
    const arr = [...segments]; [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]]; setSegments(arr);
  };

  const handleUpload = async () => {
    if (!uploadTitle.trim()) return;
    if (!uploadCourseId) {
      toast.error("Pick a course — materials must belong to a course to be linked to its curriculum.");
      return;
    }
    setIsUploading(true);
    try {
      let uploadedUrl = uploadUrl.trim();
      let resolvedFileName = uploadFileName.trim();
      let resolvedFileSize: number | undefined;
      let resolvedMimeType = "";

      if (uploadLocalFile) {
        const uploaded = await uploadMaterialFile({ file: uploadLocalFile, courseId: uploadCourseId });
        uploadedUrl = uploaded.url;
        resolvedFileName = uploaded.file_name;
        resolvedFileSize = uploaded.size_bytes;
        resolvedMimeType = uploaded.mime_type;
      }

    const data: CreateMaterialData = { type: uploadType, title: uploadTitle.trim(), description: uploadDesc, courseId: uploadCourseId || undefined };
    if (uploadType === "video") {
      data.videoUrl = uploadedUrl;
      data.videoDuration = uploadDuration || "15:00";
      if (segments.length > 0) data.segments = segments.filter((s) => s.title.trim());
    } else if (uploadType === "notes") { data.notesContent = ""; }
    else {
      data.fileUrl = uploadedUrl;
      data.fileName = resolvedFileName || `${uploadTitle.trim()}.${uploadType === "pdf" ? "pdf" : "bin"}`;
      data.fileSize = resolvedFileSize != null ? `${(resolvedFileSize / (1024 * 1024)).toFixed(2)} MB` : "Unknown";
      data.fileType = resolvedMimeType || uploadType.toUpperCase();
    }
    if (uploadType !== "notes" && !uploadedUrl) {
      toast.error("Please upload a file or provide a valid URL first.");
      return;
    }
    if (uploadLocalFile) {
      data.uploadFileName = resolvedFileName;
      data.uploadFileSize = resolvedFileSize;
      data.uploadMimeType = resolvedMimeType;
    }
    createMaterial(data);
    setUploadTitle(""); setUploadDesc(""); setUploadUrl(""); setUploadDuration(""); setUploadFileName(""); setUploadCourseId(""); setUploadLocalFile(null); setSegments([]);
    setShowUpload(false);
    toast.success("Material uploaded to your library.");
    } catch (error) {
      toast.error("Upload failed. Please try a supported file or use an external URL.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashPage role="teacher" title="Material Library" subtitle="Upload once, reuse anywhere across your academy" icon={ROLES.teacher.icon}>
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="flex items-center gap-2 border bg-card p-3"><Film className="h-4 w-4 text-primary shrink-0" /><div><p className="text-lg font-bold">{materials.length}</p><p className="text-xs text-muted-foreground">Total</p></div></Card>
        <Card className="flex items-center gap-2 border bg-card p-3"><Video className="h-4 w-4 text-blue-500 shrink-0" /><div><p className="text-lg font-bold">{videoCount}</p><p className="text-xs text-muted-foreground">Videos</p></div></Card>
        <Card className="flex items-center gap-2 border bg-card p-3"><FileText className="h-4 w-4 text-rose-500 shrink-0" /><div><p className="text-lg font-bold">{pdfCount}</p><p className="text-xs text-muted-foreground">PDFs</p></div></Card>
        <Card className="flex items-center gap-2 border bg-card p-3"><StickyNote className="h-4 w-4 text-violet-500 shrink-0" /><div><p className="text-lg font-bold">{materials.filter((m) => m.type === "notes" || m.type === "image" || m.type === "attachment").length}</p><p className="text-xs text-muted-foreground">Others</p></div></Card>
        <Card className="flex items-center gap-2 border bg-card p-3"><Link2 className="h-4 w-4 text-emerald-500 shrink-0" /><div><p className="text-lg font-bold">{usedCount}</p><p className="text-xs text-muted-foreground">In Sessions</p></div></Card>
        <Card className="flex items-center gap-2 border bg-card p-3"><BookOpen className="h-4 w-4 text-amber-500 shrink-0" /><div><p className="text-lg font-bold">{materials.length - usedCount}</p><p className="text-xs text-muted-foreground">Unused</p></div></Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowUpload(true)} className="rounded-xl gradient-brand border-0 text-white" size="sm"><Plus className="me-1.5 h-4 w-4" /> Upload Material</Button>
        </div>
        <div className="flex gap-1">
          <Button variant={viewMode === "cards" ? "default" : "outline"} size="sm" className="rounded-lg h-8 text-xs" onClick={() => setViewMode("cards")}>Cards</Button>
          <Button variant={viewMode === "table" ? "default" : "outline"} size="sm" className="rounded-lg h-8 text-xs" onClick={() => setViewMode("table")}>Table</Button>
        </div>
      </div>

      {/* Upload Panel — Step 1: Type, Step 2: Source, Step 3: Details */}
      {showUpload && (
        <Card className="border bg-card p-5 space-y-5">
          <h3 className="font-semibold">Upload Material</h3>

          {/* Step 1: Material Type */}
          <div>
            <Label className="text-xs mb-2 block font-semibold">Step 1 — Material Type</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_META) as MaterialType[]).map((t) => { const m = TYPE_META[t]; return (
                <button key={t} onClick={() => setUploadType(t)} className={cn("flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors", uploadType === t ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>
                  <m.icon className="h-4 w-4" /> {m.label}
                </button>
              ); })}
            </div>
          </div>

          {/* Step 2: Source (only for video/pdf/image/attachment) */}
          {uploadType !== "notes" && (
            <div>
              <Label className="text-xs mb-2 block font-semibold">Step 2 — Source</Label>
              <div className="flex flex-wrap gap-1.5">
                {(uploadType === "video" ? SOURCES : ["Upload File", "External URL", "Cloud Storage"]).map((s) => (
                  <button key={s} onClick={() => setUploadSource(s)} className={cn("rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors", uploadSource === s ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          <div>
            <Label className="text-xs mb-2 block font-semibold">{uploadType === "notes" ? "Step 2" : "Step 3"} — Details</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label className="text-xs">Title *</Label><Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Material title" className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Course</Label>
                <select value={uploadCourseId} onChange={(e) => setUploadCourseId(e.target.value)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm">
                  <option value="">Select a course...</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              {uploadType === "video" && (<>
                <div className="space-y-1.5"><Label className="text-xs">{uploadSource === "YouTube" ? "YouTube URL" : uploadSource === "Vimeo" ? "Vimeo URL" : "Video URL / File"}</Label><Input value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} placeholder={uploadSource === "Upload File" ? "Select file or paste URL" : "https://..."} className="rounded-xl" /></div>
                <div className="space-y-1.5"><Label className="text-xs">Duration</Label><Input value={uploadDuration} onChange={(e) => setUploadDuration(e.target.value)} placeholder="45:00" className="rounded-xl" /></div>
              </>)}
              {uploadType !== "video" && uploadType !== "notes" && (
                <div className="space-y-1.5"><Label className="text-xs">{uploadSource === "Upload File" ? "Select file or paste URL" : "File URL"}</Label><Input value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} placeholder="https://..." className="rounded-xl" /></div>
              )}
              {uploadSource === "Upload File" && uploadType !== "notes" && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">Upload file</Label>
                  <Input
                    type="file"
                    accept={UPLOAD_ACCEPT[uploadType]}
                    className="rounded-xl"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setUploadLocalFile(file);
                      setUploadFileName(file?.name ?? "");
                    }}
                  />
                  {uploadLocalFile && <p className="text-xs text-muted-foreground">{uploadLocalFile.name}</p>}
                </div>
              )}
            </div>
            <div className="mt-3 space-y-1.5"><Label className="text-xs">Description</Label><textarea value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} rows={2} placeholder="Optional description..." className="w-full rounded-xl border bg-card px-3 py-2 text-xs resize-none" /></div>
          </div>

          {/* Video Timing Frames */}
          {uploadType === "video" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold">Video Timing Frames & Concept Mapping</Label>
                <Button variant="outline" size="sm" className="rounded-lg text-xs h-7" onClick={addSegment}><Plus className="me-1 h-3 w-3" /> Add Segment</Button>
              </div>
              {segments.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No segments yet. Add timing frames to map video content to concepts.</p>
              ) : (
                <div className="space-y-3">
                  {segments.map((seg, idx) => (
                    <SegmentEditor key={seg.id} seg={seg} idx={idx} total={segments.length}
                      chapters={courseChapters}
                      lessons={courseLessons}
                      concepts={courseConcepts}
                      atomicConcepts={courseAtomicConcepts}
                      onUpdate={(patch) => updateSegment(idx, patch)}
                      onRemove={() => removeSegment(idx)}
                      onMoveUp={() => moveSegment(idx, -1)}
                      onMoveDown={() => moveSegment(idx, 1)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button onClick={handleUpload} disabled={!uploadTitle.trim() || !uploadCourseId || isUploading} className="rounded-xl gradient-brand border-0 text-white" size="sm"><Upload className="me-1.5 h-4 w-4" /> {isUploading ? "Uploading..." : "Upload to Library"}</Button>
            <Button onClick={() => { if (uploadTitle.trim()) handleUpload(); }} disabled={!uploadCourseId || isUploading} variant="outline" size="sm" className="rounded-xl">Save Draft</Button>
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowUpload(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Materials */}
      <div className="space-y-4">
        <div className="space-y-4">
          <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} filters={buildFilterOptions(courses)} activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }} onClearFilters={() => { setFilters({}); setPage(1); }} totalResults={total} placeholder="Search materials..." />

          {total === 0 && materials.length === 0 ? (
            <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10"><Film className="h-8 w-8 text-primary" /></div>
              <h2 className="text-lg font-semibold">Build your teaching library</h2>
              <p className="text-sm text-muted-foreground max-w-md">Upload videos, PDFs, worksheets and notes once. Reuse them across unlimited sessions and courses.</p>
              <Button onClick={() => setShowUpload(true)} className="rounded-xl gradient-brand border-0 text-white"><Plus className="me-1.5 h-4 w-4" /> Upload First Material</Button>
            </Card>
          ) : (
            <div className={cn(viewMode === "cards" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-2")}>
              {paginated.map((mat) => viewMode === "cards" ? <MaterialCard key={mat.id} mat={mat} onPublish={() => publishMaterial(mat.id)} onUnpublish={() => unpublishMaterial(mat.id)} onDelete={() => deleteMaterial(mat.id)} onRename={(title) => updateMaterial(mat.id, { title })} /> : <MaterialRow key={mat.id} mat={mat} onPublish={() => publishMaterial(mat.id)} onUnpublish={() => unpublishMaterial(mat.id)} onDelete={() => deleteMaterial(mat.id)} onRename={(title) => updateMaterial(mat.id, { title })} />)}
            </div>
          )}
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </div>
      </div>
    </DashPage>
  );
}

function MaterialCard({ mat, onPublish, onUnpublish, onDelete, onRename }: { mat: TeacherMaterial; onPublish: () => void; onUnpublish: () => void; onDelete: () => void; onRename: (title: string) => void }) {
  const meta = TYPE_META[mat.type]; const Icon = meta.icon;
  const sessionCount = (mat.linkedSessionIds?.length || 0) + (mat.sessionId ? 1 : 0);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(mat.title);
  const previewUrl = resolveFileUrl(mat.videoUrl || mat.fileUrl);
  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== mat.title) onRename(trimmed);
    setIsRenaming(false);
  };
  return (
    <Card className="border bg-card overflow-hidden transition-colors hover:border-primary/20">
      <div className={cn("h-20 flex items-center justify-center bg-gradient-to-br", mat.type === "video" ? "from-blue-500/20 to-cyan-500/20" : mat.type === "pdf" ? "from-rose-500/20 to-pink-500/20" : "from-violet-500/20 to-blue-500/20")}>
        <Icon className={cn("h-8 w-8", meta.color.split(" ")[0])} />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {isRenaming ? (
              <Input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onBlur={commitRename} onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setRenameValue(mat.title); setIsRenaming(false); } }} className="h-7 rounded-lg text-sm font-semibold" />
            ) : (
              <p className="text-sm font-semibold truncate cursor-text" onDoubleClick={() => setIsRenaming(true)}>{mat.title}</p>
            )}
            <p className="text-xs text-muted-foreground">{meta.label}{mat.videoDuration ? ` · ${mat.videoDuration}` : ""}{mat.fileSize ? ` · ${mat.fileSize}` : ""}</p>
          </div>
          <Badge variant="outline" className={cn("shrink-0 rounded-full text-xs", mat.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{mat.status}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {sessionCount > 0 && <span className="flex items-center gap-1"><Link2 className="h-3 w-3" /> {sessionCount} sessions</span>}
          {(mat.reuseCount || 0) > 0 && <span>Reused {mat.reuseCount}x</span>}
          {mat.segments && mat.segments.length > 0 && <span>{mat.segments.length} segments</span>}
        </div>
        <div className="flex items-center gap-1 pt-1 border-t">
          {mat.status === "draft" ? <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onPublish}><Eye className="h-3.5 w-3.5 text-emerald-600" /></Button> : <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onUnpublish}><EyeOff className="h-3.5 w-3.5 text-amber-600" /></Button>}
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => setIsRenaming(true)}><Pencil className="h-3.5 w-3.5" /></Button>
          {previewUrl && (<>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" asChild><a href={previewUrl} target="_blank" rel="noopener noreferrer"><PlayCircle className="h-3.5 w-3.5" /></a></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" asChild><a href={previewUrl} download={mat.fileName || mat.title}><Download className="h-3.5 w-3.5" /></a></Button>
          </>)}
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive ms-auto" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    </Card>
  );
}

function MaterialRow({ mat, onPublish, onUnpublish, onDelete, onRename }: { mat: TeacherMaterial; onPublish: () => void; onUnpublish: () => void; onDelete: () => void; onRename: (title: string) => void }) {
  const meta = TYPE_META[mat.type]; const Icon = meta.icon;
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(mat.title);
  const previewUrl = resolveFileUrl(mat.videoUrl || mat.fileUrl);
  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== mat.title) onRename(trimmed);
    setIsRenaming(false);
  };
  return (
    <Card className="flex items-center gap-3 border bg-card px-4 py-3">
      <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", meta.color)}><Icon className="h-4 w-4" /></div>
      <div className="min-w-0 flex-1">
        {isRenaming ? (
          <Input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onBlur={commitRename} onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setRenameValue(mat.title); setIsRenaming(false); } }} className="h-7 rounded-lg text-sm" />
        ) : (
          <p className="text-sm font-medium truncate cursor-text" onDoubleClick={() => setIsRenaming(true)}>{mat.title}</p>
        )}
        <p className="text-xs text-muted-foreground">{meta.label}{mat.videoDuration ? ` · ${mat.videoDuration}` : ""}</p>
      </div>
      <Badge variant="outline" className={cn("rounded-full text-xs", mat.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{mat.status}</Badge>
      <div className="flex gap-0.5 shrink-0">
        {mat.status === "draft" ? <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onPublish}><Eye className="h-3.5 w-3.5 text-emerald-600" /></Button> : <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onUnpublish}><EyeOff className="h-3.5 w-3.5 text-amber-600" /></Button>}
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => setIsRenaming(true)}><Pencil className="h-3.5 w-3.5" /></Button>
        {previewUrl && (<>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" asChild><a href={previewUrl} target="_blank" rel="noopener noreferrer"><PlayCircle className="h-3.5 w-3.5" /></a></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" asChild><a href={previewUrl} download={mat.fileName || mat.title}><Download className="h-3.5 w-3.5" /></a></Button>
        </>)}
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    </Card>
  );
}

function timeToSeconds(t: string): number {
  const parts = t.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function secondsToTime(s: number): string {
  const m = Math.floor(s / 60); const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function SegmentEditor({ seg, idx, total, chapters, lessons, concepts, atomicConcepts, onUpdate, onRemove, onMoveUp, onMoveDown }: {
  seg: VideoSegment; idx: number; total: number;
  chapters: TeacherChapter[];
  lessons: TeacherLesson[];
  concepts: TeacherConcept[];
  atomicConcepts: TeacherAtomicConcept[];
  onUpdate: (patch: Partial<VideoSegment>) => void; onRemove: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) {
  const [startStr, setStartStr] = useState(secondsToTime(seg.startTime));
  const [endStr, setEndStr] = useState(secondsToTime(seg.endTime));
  const selectedChapterId = (seg.chapterIds || [])[0] || "";
  const availableLessons = selectedChapterId ? lessons.filter((lesson) => lesson.chapterId === selectedChapterId) : lessons;
  const selectedLessonId = (seg.lessonIds || [])[0] || "";
  const availableConcepts = selectedLessonId ? concepts.filter((concept) => concept.lessonId === selectedLessonId) : concepts;
  const selectedConceptId = (seg.conceptIds || [])[0] || "";
  const availableAtomicConcepts = selectedConceptId ? atomicConcepts.filter((atomicConcept) => atomicConcept.conceptId === selectedConceptId) : atomicConcepts;

  return (
    <Card className="border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full text-xs"><Clock className="me-1 h-3 w-3" />Segment {idx + 1}</Badge>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={onMoveUp}><ArrowUp className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === total - 1} onClick={onMoveDown}><ArrowDown className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={onRemove}><X className="h-3 w-3" /></Button>
        </div>
      </div>

      {/* Time + Title */}
      <div className="grid gap-2 sm:grid-cols-[100px_100px_1fr]">
        <div className="space-y-1"><Label className="text-xs">Start</Label><Input value={startStr} onChange={(e) => { setStartStr(e.target.value); onUpdate({ startTime: timeToSeconds(e.target.value) }); }} placeholder="00:00" className="rounded-lg h-8 text-xs font-mono" /></div>
        <div className="space-y-1"><Label className="text-xs">End</Label><Input value={endStr} onChange={(e) => { setEndStr(e.target.value); onUpdate({ endTime: timeToSeconds(e.target.value) }); }} placeholder="10:30" className="rounded-lg h-8 text-xs font-mono" /></div>
        <div className="space-y-1"><Label className="text-xs">Title *</Label><Input value={seg.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="e.g. Introduction to Limits" className="rounded-lg h-8 text-xs" /></div>
      </div>

      {/* Concept Mapping */}
      <div className="space-y-2 border-t pt-2">
        <p className="text-xs font-semibold text-muted-foreground">Concept Mapping</p>

        {/* Chapter */}
        {chapters.length > 0 && (
          <select value={(seg.chapterIds || [])[0] || ""} onChange={(e) => onUpdate({ chapterIds: e.target.value ? [e.target.value] : [] })} className="w-full h-8 rounded-lg border bg-card px-2 text-xs">
            <option value="">Chapter (optional)</option>
            {chapters.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        )}

        {/* Lesson */}
        {availableLessons.length > 0 && (
          <select
            value={selectedLessonId}
            onChange={(e) => onUpdate({ lessonIds: e.target.value ? [e.target.value] : [], conceptIds: [], atomicConceptIds: [] })}
            className="w-full h-8 rounded-lg border bg-card px-2 text-xs"
          >
            <option value="">Lesson (optional)</option>
            {availableLessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
          </select>
        )}

        {/* Concept */}
        <div className="flex items-center gap-1.5">
          <select value={selectedConceptId} onChange={(e) => onUpdate({ conceptIds: e.target.value ? [e.target.value] : [], atomicConceptIds: [] })} className="flex-1 h-8 rounded-lg border bg-card px-2 text-xs">
            <option value="">Select Concept</option>
            {availableConcepts.map((concept) => <option key={concept.id} value={concept.id}>{concept.title}</option>)}
          </select>
        </div>

        {/* Atomic Concept */}
        {availableAtomicConcepts.length > 0 && (
          <>
            <div className="flex items-center gap-1.5">
              <select value={(seg.atomicConceptIds || [])[0] || ""} onChange={(e) => onUpdate({ atomicConceptIds: e.target.value ? [e.target.value] : [] })} className="flex-1 h-8 rounded-lg border bg-card px-2 text-xs">
                <option value="">Select Atomic Concept</option>
                {availableAtomicConcepts.map((atomicConcept) => <option key={atomicConcept.id} value={atomicConcept.id}>{atomicConcept.title}</option>)}
              </select>
            </div>
          </>
        )}

        {/* Notes */}
        <Input value={seg.notes || ""} onChange={(e) => onUpdate({ notes: e.target.value })} placeholder="Segment notes (optional)" className="rounded-lg h-7 text-xs" />
      </div>
    </Card>
  );
}
