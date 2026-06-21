import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Copy, Eye, EyeOff, File, FileText, Image, Plus, StickyNote,
  Trash2, Video, Film,
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
  useTeacherMaterialStore, getAllLibraryMaterials,
  type TeacherMaterial, type MaterialType, type CreateMaterialData, type VideoSegment,
} from "@/lib/teacher/teacher-material-store";

export const Route = createFileRoute("/teacher/materials")({
  component: MaterialLibraryPage,
});

const PAGE_SIZE = 12;

const TYPE_META: Record<MaterialType, { icon: React.ElementType; label: string; color: string }> = {
  video: { icon: Video, label: "Video", color: "text-blue-500 bg-blue-500/10" },
  pdf: { icon: FileText, label: "PDF", color: "text-rose-500 bg-rose-500/10" },
  image: { icon: Image, label: "Image", color: "text-emerald-500 bg-emerald-500/10" },
  attachment: { icon: File, label: "Attachment", color: "text-amber-500 bg-amber-500/10" },
  notes: { icon: StickyNote, label: "Notes", color: "text-violet-500 bg-violet-500/10" },
};

const filterOptions: FilterOption[] = [
  { key: "type", label: "Type", options: [
    { value: "video", label: "Video" },
    { value: "pdf", label: "PDF" },
    { value: "image", label: "Image" },
    { value: "attachment", label: "Attachment" },
    { value: "notes", label: "Notes" },
  ]},
  { key: "status", label: "Status", options: [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ]},
];

function MaterialLibraryPage() {
  const materials = useTeacherMaterialStore((s) => s.materials);
  const createMaterial = useTeacherMaterialStore((s) => s.createMaterial);
  const deleteMaterial = useTeacherMaterialStore((s) => s.deleteMaterial);
  const publishMaterial = useTeacherMaterialStore((s) => s.publishMaterial);
  const unpublishMaterial = useTeacherMaterialStore((s) => s.unpublishMaterial);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState<MaterialType>("video");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadDuration, setUploadDuration] = useState("");

  const filtered = useMemo(() => {
    let result = [...materials].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q));
    }
    if (filters.type) result = result.filter((m) => m.type === filters.type);
    if (filters.status) result = result.filter((m) => m.status === filters.status);
    return result;
  }, [materials, search, filters]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleUpload = () => {
    if (!uploadTitle.trim()) return;
    const data: CreateMaterialData = { type: uploadType, title: uploadTitle.trim() };
    if (uploadType === "video") {
      data.videoUrl = uploadUrl || "https://example.com/video.mp4";
      data.videoDuration = uploadDuration || "15:00";
    } else if (uploadType === "notes") {
      data.notesContent = "";
    } else {
      data.fileUrl = uploadUrl || "https://example.com/file";
      data.fileName = `${uploadTitle.trim()}.${uploadType === "pdf" ? "pdf" : "zip"}`;
      data.fileSize = "2.4 MB";
    }
    createMaterial(data);
    setUploadTitle("");
    setUploadUrl("");
    setUploadDuration("");
    setShowUpload(false);
  };

  return (
    <DashPage role="teacher" title="Material Library" subtitle="Upload once, reuse anywhere across sessions" icon={ROLES.teacher.icon}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="rounded-full">{materials.length} materials</Badge>
          <Badge variant="outline" className="rounded-full text-blue-600 border-blue-300">
            {materials.filter((m) => m.type === "video").length} videos
          </Badge>
        </div>
        <Button onClick={() => setShowUpload(true)} className="rounded-xl gradient-brand border-0 text-white" size="sm">
          <Plus className="me-1.5 h-4 w-4" /> Upload Material
        </Button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <Card className="border bg-card p-5 space-y-4">
          <h3 className="font-semibold">Upload to Library</h3>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TYPE_META) as MaterialType[]).map((t) => {
              const meta = TYPE_META[t];
              return (
                <button key={t} onClick={() => setUploadType(t)} className={cn("flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors", uploadType === t ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>
                  <meta.icon className="h-3.5 w-3.5" /> {meta.label}
                </button>
              );
            })}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="e.g. Intro to Derivatives" className="rounded-xl" />
            </div>
            {uploadType === "video" && (
              <>
                <div className="space-y-1.5">
                  <Label>Video URL</Label>
                  <Input value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} placeholder="https://..." className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Duration</Label>
                  <Input value={uploadDuration} onChange={(e) => setUploadDuration(e.target.value)} placeholder="45:00" className="rounded-xl" />
                </div>
              </>
            )}
            {uploadType !== "video" && uploadType !== "notes" && (
              <div className="space-y-1.5">
                <Label>File URL</Label>
                <Input value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} placeholder="https://..." className="rounded-xl" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={!uploadTitle.trim()} className="rounded-xl gradient-brand border-0 text-white" size="sm">Upload to Library</Button>
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowUpload(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }}
        onClearFilters={() => { setFilters({}); setPage(1); }}
        totalResults={total}
        placeholder="Search materials..."
      />

      {/* Material Grid */}
      {total === 0 && materials.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <Film className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Material Library is empty</h2>
          <p className="text-sm text-muted-foreground">Upload videos, PDFs, and resources to reuse across sessions.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((mat) => {
            const meta = TYPE_META[mat.type];
            const Icon = meta.icon;
            return (
              <Card key={mat.id} className="border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", meta.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{mat.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {meta.label}
                      {mat.videoDuration ? ` · ${mat.videoDuration}` : ""}
                      {mat.fileSize ? ` · ${mat.fileSize}` : ""}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("rounded-full text-xs", mat.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{mat.status}</Badge>
                    {(mat.reuseCount || 0) > 0 && (
                      <span className="text-xs text-muted-foreground">Used {mat.reuseCount}x</span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {mat.status === "draft" ? (
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => publishMaterial(mat.id)}><Eye className="h-3.5 w-3.5 text-emerald-600" /></Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => unpublishMaterial(mat.id)}><EyeOff className="h-3.5 w-3.5 text-amber-600" /></Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => deleteMaterial(mat.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {mat.segments && mat.segments.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">{mat.segments.length} segments</p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </DashPage>
  );
}
