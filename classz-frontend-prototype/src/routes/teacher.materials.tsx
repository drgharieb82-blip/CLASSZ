import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  BookOpen, ChevronDown, ChevronRight, Eye, EyeOff, File, FileText, Film,
  FolderTree, Image, ImagePlus, Link2, Plus, StickyNote, Trash2, Upload, Video, X,
} from "lucide-react";
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
  useTeacherMaterialStore, type TeacherMaterial, type MaterialType, type CreateMaterialData,
} from "@/lib/teacher/teacher-material-store";
import {
  useContentTreeStore, getTreeForCourse, getChildren, getCoverageSummary,
  type ContentTreeNode, type CoverageStatus,
} from "@/lib/teacher/content-tree-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";

export const Route = createFileRoute("/teacher/materials")({ component: MaterialLibraryPage });

const PAGE_SIZE = 12;
const TYPE_META: Record<MaterialType, { icon: React.ElementType; label: string; color: string }> = {
  video: { icon: Video, label: "Video", color: "text-blue-500 bg-blue-500/10" },
  pdf: { icon: FileText, label: "PDF", color: "text-rose-500 bg-rose-500/10" },
  image: { icon: Image, label: "Image", color: "text-emerald-500 bg-emerald-500/10" },
  attachment: { icon: File, label: "Attachment", color: "text-amber-500 bg-amber-500/10" },
  notes: { icon: StickyNote, label: "Notes", color: "text-violet-500 bg-violet-500/10" },
};

const STATUS_COLORS: Record<CoverageStatus, string> = {
  not_started: "bg-slate-500/10 text-slate-500",
  missing_material: "bg-rose-500/10 text-rose-600",
  partial: "bg-amber-500/10 text-amber-600",
  covered: "bg-emerald-500/10 text-emerald-600",
  needs_review: "bg-blue-500/10 text-blue-600",
  extra: "bg-violet-500/10 text-violet-600",
};

const filterOptions: FilterOption[] = [
  { key: "type", label: "Type", options: [{ value: "video", label: "Video" }, { value: "pdf", label: "PDF" }, { value: "image", label: "Image" }, { value: "attachment", label: "Attachment" }, { value: "notes", label: "Notes" }] },
  { key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }] },
  { key: "usage", label: "Usage", options: [{ value: "used", label: "Used in sessions" }, { value: "unused", label: "Unused" }] },
];

const SOURCES = ["Upload File", "YouTube", "Vimeo", "External URL", "Cloud Storage"];

function MaterialLibraryPage() {
  const materials = useTeacherMaterialStore((s) => s.materials);
  const courses = useTeacherCourseStore((s) => s.courses);
  const createMaterial = useTeacherMaterialStore((s) => s.createMaterial);
  const deleteMaterial = useTeacherMaterialStore((s) => s.deleteMaterial);
  const publishMaterial = useTeacherMaterialStore((s) => s.publishMaterial);
  const unpublishMaterial = useTeacherMaterialStore((s) => s.unpublishMaterial);

  const [search, setSearch] = useState(""); const [filters, setFilters] = useState<Record<string, string>>({}); const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadSource, setUploadSource] = useState("Upload File");
  const [uploadType, setUploadType] = useState<MaterialType>("video");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadDuration, setUploadDuration] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showTree, setShowTree] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const filtered = useMemo(() => {
    let r = [...materials].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (search) { const q = search.toLowerCase(); r = r.filter((m) => m.title.toLowerCase().includes(q)); }
    if (filters.type) r = r.filter((m) => m.type === filters.type);
    if (filters.status) r = r.filter((m) => m.status === filters.status);
    if (filters.usage === "used") r = r.filter((m) => (m.linkedSessionIds?.length || 0) > 0 || m.sessionId);
    if (filters.usage === "unused") r = r.filter((m) => (m.linkedSessionIds?.length || 0) === 0 && !m.sessionId);
    return r;
  }, [materials, search, filters]);

  const total = filtered.length; const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const videoCount = materials.filter((m) => m.type === "video").length;
  const pdfCount = materials.filter((m) => m.type === "pdf").length;
  const usedCount = materials.filter((m) => (m.linkedSessionIds?.length || 0) > 0 || m.sessionId).length;

  const handleUpload = () => {
    if (!uploadTitle.trim()) return;
    const data: CreateMaterialData = { type: uploadType, title: uploadTitle.trim(), description: uploadDesc };
    if (uploadType === "video") { data.videoUrl = uploadUrl || "https://example.com/video.mp4"; data.videoDuration = uploadDuration || "15:00"; }
    else if (uploadType === "notes") { data.notesContent = ""; }
    else { data.fileUrl = uploadUrl || "https://example.com/file"; data.fileName = uploadFileName || `${uploadTitle.trim()}.${uploadType === "pdf" ? "pdf" : "zip"}`; data.fileSize = "2.4 MB"; }
    createMaterial(data);
    setUploadTitle(""); setUploadDesc(""); setUploadUrl(""); setUploadDuration(""); setUploadFileName("");
    setShowUpload(false);
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
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowTree(!showTree)}><FolderTree className="me-1.5 h-3.5 w-3.5" /> {showTree ? "Hide" : "Show"} Coverage Tree</Button>
        </div>
        <div className="flex gap-1">
          <Button variant={viewMode === "cards" ? "default" : "outline"} size="sm" className="rounded-lg h-8 text-xs" onClick={() => setViewMode("cards")}>Cards</Button>
          <Button variant={viewMode === "table" ? "default" : "outline"} size="sm" className="rounded-lg h-8 text-xs" onClick={() => setViewMode("table")}>Table</Button>
        </div>
      </div>

      {/* Upload Panel */}
      {showUpload && (
        <Card className="border bg-card p-5 space-y-4">
          <h3 className="font-semibold">Upload Material</h3>
          <div><Label className="text-xs mb-1.5 block">Source</Label><div className="flex flex-wrap gap-1.5">{SOURCES.map((s) => (<button key={s} onClick={() => setUploadSource(s)} className={cn("rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors", uploadSource === s ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>{s}</button>))}</div></div>
          <div><Label className="text-xs mb-1.5 block">Type</Label><div className="flex flex-wrap gap-1.5">{(Object.keys(TYPE_META) as MaterialType[]).map((t) => { const m = TYPE_META[t]; return (<button key={t} onClick={() => setUploadType(t)} className={cn("flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors", uploadType === t ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}><m.icon className="h-3 w-3" /> {m.label}</button>); })}</div></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs">Title *</Label><Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Material title" className="rounded-xl" /></div>
            {uploadType === "video" && (<><div className="space-y-1.5"><Label className="text-xs">{uploadSource === "YouTube" ? "YouTube URL" : uploadSource === "Vimeo" ? "Vimeo URL" : "Video URL"}</Label><Input value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} placeholder="https://..." className="rounded-xl" /></div><div className="space-y-1.5"><Label className="text-xs">Duration</Label><Input value={uploadDuration} onChange={(e) => setUploadDuration(e.target.value)} placeholder="45:00" className="rounded-xl" /></div></>)}
            {uploadType !== "video" && uploadType !== "notes" && (<div className="space-y-1.5"><Label className="text-xs">File URL</Label><Input value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} placeholder="https://..." className="rounded-xl" /></div>)}
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Description</Label><textarea value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} rows={2} placeholder="Optional description..." className="w-full rounded-xl border bg-card px-3 py-2 text-xs resize-none" /></div>
          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={!uploadTitle.trim()} className="rounded-xl gradient-brand border-0 text-white" size="sm"><Upload className="me-1.5 h-4 w-4" /> Upload to Library</Button>
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowUpload(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Main Layout */}
      <div className={cn("grid gap-4", showTree && "lg:grid-cols-[280px_1fr]")}>
        {/* Coverage Tree Panel */}
        {showTree && (
          <Card className="border bg-card p-3 max-h-[600px] overflow-y-auto">
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Content Tree</p>
            {courses.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Create a course first.</p>
            ) : (
              <div className="space-y-1">
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full h-8 rounded-lg border bg-card px-2 text-xs mb-2">
                  <option value="">Select course</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                {selectedCourse && <CourseTree courseId={selectedCourse} selectedNode={selectedNode} onSelect={setSelectedNode} />}
              </div>
            )}
            {selectedCourse && <CoverageSummaryPanel courseId={selectedCourse} />}
          </Card>
        )}

        {/* Materials */}
        <div className="space-y-4">
          <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} filters={filterOptions} activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }} onClearFilters={() => { setFilters({}); setPage(1); }} totalResults={total} placeholder="Search materials..." />

          {total === 0 && materials.length === 0 ? (
            <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10"><Film className="h-8 w-8 text-primary" /></div>
              <h2 className="text-lg font-semibold">Build your teaching library</h2>
              <p className="text-sm text-muted-foreground max-w-md">Upload videos, PDFs, worksheets and notes once. Reuse them across unlimited sessions and courses.</p>
              <Button onClick={() => setShowUpload(true)} className="rounded-xl gradient-brand border-0 text-white"><Plus className="me-1.5 h-4 w-4" /> Upload First Material</Button>
            </Card>
          ) : (
            <div className={cn(viewMode === "cards" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-2")}>
              {paginated.map((mat) => viewMode === "cards" ? <MaterialCard key={mat.id} mat={mat} onPublish={() => publishMaterial(mat.id)} onUnpublish={() => unpublishMaterial(mat.id)} onDelete={() => deleteMaterial(mat.id)} /> : <MaterialRow key={mat.id} mat={mat} onPublish={() => publishMaterial(mat.id)} onUnpublish={() => unpublishMaterial(mat.id)} onDelete={() => deleteMaterial(mat.id)} />)}
            </div>
          )}
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </div>
      </div>
    </DashPage>
  );
}

function MaterialCard({ mat, onPublish, onUnpublish, onDelete }: { mat: TeacherMaterial; onPublish: () => void; onUnpublish: () => void; onDelete: () => void }) {
  const meta = TYPE_META[mat.type]; const Icon = meta.icon;
  const sessionCount = (mat.linkedSessionIds?.length || 0) + (mat.sessionId ? 1 : 0);
  return (
    <Card className="border bg-card overflow-hidden transition-colors hover:border-primary/20">
      <div className={cn("h-20 flex items-center justify-center bg-gradient-to-br", mat.type === "video" ? "from-blue-500/20 to-cyan-500/20" : mat.type === "pdf" ? "from-rose-500/20 to-pink-500/20" : "from-violet-500/20 to-blue-500/20")}>
        <Icon className={cn("h-8 w-8", meta.color.split(" ")[0])} />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0"><p className="text-sm font-semibold truncate">{mat.title}</p><p className="text-xs text-muted-foreground">{meta.label}{mat.videoDuration ? ` · ${mat.videoDuration}` : ""}{mat.fileSize ? ` · ${mat.fileSize}` : ""}</p></div>
          <Badge variant="outline" className={cn("shrink-0 rounded-full text-xs", mat.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{mat.status}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {sessionCount > 0 && <span className="flex items-center gap-1"><Link2 className="h-3 w-3" /> {sessionCount} sessions</span>}
          {(mat.reuseCount || 0) > 0 && <span>Reused {mat.reuseCount}x</span>}
          {mat.segments && mat.segments.length > 0 && <span>{mat.segments.length} segments</span>}
        </div>
        <div className="flex items-center gap-1 pt-1 border-t">
          {mat.status === "draft" ? <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onPublish}><Eye className="h-3.5 w-3.5 text-emerald-600" /></Button> : <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onUnpublish}><EyeOff className="h-3.5 w-3.5 text-amber-600" /></Button>}
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    </Card>
  );
}

function MaterialRow({ mat, onPublish, onUnpublish, onDelete }: { mat: TeacherMaterial; onPublish: () => void; onUnpublish: () => void; onDelete: () => void }) {
  const meta = TYPE_META[mat.type]; const Icon = meta.icon;
  return (
    <Card className="flex items-center gap-3 border bg-card px-4 py-3">
      <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", meta.color)}><Icon className="h-4 w-4" /></div>
      <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{mat.title}</p><p className="text-xs text-muted-foreground">{meta.label}{mat.videoDuration ? ` · ${mat.videoDuration}` : ""}</p></div>
      <Badge variant="outline" className={cn("rounded-full text-xs", mat.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{mat.status}</Badge>
      <div className="flex gap-0.5 shrink-0">
        {mat.status === "draft" ? <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onPublish}><Eye className="h-3.5 w-3.5 text-emerald-600" /></Button> : <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onUnpublish}><EyeOff className="h-3.5 w-3.5 text-amber-600" /></Button>}
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    </Card>
  );
}

function CourseTree({ courseId, selectedNode, onSelect }: { courseId: string; selectedNode: string | null; onSelect: (id: string | null) => void }) {
  const nodes = useContentTreeStore((s) => s.nodes.filter((n) => n.courseId === courseId));
  const createNode = useContentTreeStore((s) => s.createNode);
  const roots = nodes.filter((n) => n.type === "chapter" && !n.parentId).sort((a, b) => a.order - b.order);

  if (roots.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-xs text-muted-foreground mb-2">No content tree yet.</p>
        <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => createNode({ type: "chapter", title: "Chapter 1", parentId: "", courseId })}><Plus className="me-1 h-3 w-3" /> Add Chapter</Button>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {roots.map((node) => <TreeNode key={node.id} node={node} depth={0} selectedNode={selectedNode} onSelect={onSelect} courseId={courseId} />)}
      <Button variant="ghost" size="sm" className="w-full rounded-lg text-xs mt-1" onClick={() => createNode({ type: "chapter", title: `Chapter ${roots.length + 1}`, parentId: "", courseId })}><Plus className="me-1 h-3 w-3" /> Add Chapter</Button>
    </div>
  );
}

function TreeNode({ node, depth, selectedNode, onSelect, courseId }: { node: ContentTreeNode; depth: number; selectedNode: string | null; onSelect: (id: string | null) => void; courseId: string }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const children = useContentTreeStore((s) => s.nodes.filter((n) => n.parentId === node.id).sort((a, b) => a.order - b.order));
  const createNode = useContentTreeStore((s) => s.createNode);
  const isSelected = selectedNode === node.id;
  const hasChildren = children.length > 0;

  const childType: Record<string, string> = { chapter: "lesson", lesson: "concept", concept: "atomic_concept" };
  const nextType = childType[node.type];

  if (node.isHidden) return null;

  return (
    <div>
      <button
        onClick={() => { onSelect(isSelected ? null : node.id); if (hasChildren) setExpanded(!expanded); }}
        className={cn("flex w-full items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors", isSelected ? "bg-primary/10 text-primary" : "hover:bg-accent")}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {hasChildren ? (expanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />) : <span className="w-3 shrink-0" />}
        <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_COLORS[node.coverageStatus].split(" ")[0])} />
        <span className="truncate flex-1 text-start">{node.title}</span>
        {node.linkedMaterialIds.length > 0 && <span className="text-muted-foreground">{node.linkedMaterialIds.length}</span>}
      </button>
      {expanded && (
        <div>
          {children.map((child) => <TreeNode key={child.id} node={child} depth={depth + 1} selectedNode={selectedNode} onSelect={onSelect} courseId={courseId} />)}
          {nextType && (
            <button onClick={() => createNode({ type: nextType as any, title: `New ${nextType.replace("_", " ")}`, parentId: node.id, courseId })} className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground" style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}>
              <Plus className="h-2.5 w-2.5" /> Add {nextType.replace("_", " ")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CoverageSummaryPanel({ courseId }: { courseId: string }) {
  const summary = getCoverageSummary(courseId);
  if (summary.totalNodes === 0) return null;
  return (
    <div className="mt-3 space-y-1.5 border-t pt-3">
      <p className="text-xs font-semibold">Coverage: {summary.coveragePercent}%</p>
      <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full" style={{ width: `${summary.coveragePercent}%` }} /></div>
      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
        <span>Chapters: {summary.chapters.covered}/{summary.chapters.total}</span>
        <span>Lessons: {summary.lessons.covered}/{summary.lessons.total}</span>
        <span>Concepts: {summary.concepts.covered}/{summary.concepts.total}</span>
        <span>Atomic: {summary.atomicConcepts.covered}/{summary.atomicConcepts.total}</span>
      </div>
      <p className="text-xs text-muted-foreground">{summary.materialsLinked} materials · {summary.sessionsLinked} sessions linked</p>
    </div>
  );
}
