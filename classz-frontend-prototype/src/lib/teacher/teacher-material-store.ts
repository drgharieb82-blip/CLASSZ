import { create } from "zustand";
import {
  createMaterial as createMaterialApi,
  listMaterials as listMaterialsApi,
  updateMaterial as updateMaterialApi,
  updateMaterialLinks as updateMaterialLinksApi,
  deleteMaterial as deleteMaterialApi,
  reorderMaterials as reorderMaterialsApi,
  type MaterialRead,
} from "@/lib/api/materials";
import { ApiError } from "@/lib/api/client";

export type MaterialType = "video" | "pdf" | "image" | "attachment" | "notes" | "document" | "audio";
export type MaterialStatus = "draft" | "published" | "archived";
export type SourceMode = "upload" | "url";
export type SourceProvider = "local_upload" | "youtube" | "vimeo" | "external_url" | "cloud_storage" | "bunny" | "cloudflare" | "mux" | "s3";
export type UploadStatus = "idle" | "uploading" | "processing" | "ready" | "failed";
export type ProcessingStatus = "not_started" | "processing" | "ready" | "failed";

export interface AcademicLink {
  id: string;
  fromTime?: string;
  toTime?: string;
  chapterId?: string;
  lessonId?: string;
  conceptId?: string;
  atomicConceptId?: string;
}

export interface VideoSegment {
  id: string;
  startTime: number;
  endTime: number;
  title: string;
  chapterIds: string[];
  lessonIds: string[];
  conceptIds: string[];
  atomicConceptIds: string[];
  notes?: string;
  // Which sessions reference this segment directly (mirrors TeacherMaterial.linkedSessionIds,
  // but at segment granularity — a session can use one clip of a video without linking the whole material).
  linkedSessionIds?: string[];
}

export interface TeacherMaterial {
  id: string;
  sessionId: string;
  courseId: string;
  chapterId: string;
  type: MaterialType;
  title: string;
  description: string;
  order: number;
  status: MaterialStatus;
  // Video
  videoUrl?: string;
  videoDuration?: string;
  videoDurationSeconds?: number;
  thumbnailUrl?: string;
  segments?: VideoSegment[];
  // PDF / Image / Attachment
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  // Notes
  notesContent?: string;
  // Source metadata
  sourceMode?: SourceMode;
  sourceProvider?: SourceProvider;
  originalUrl?: string;
  studentDisplayTitle?: string;
  customThumbnailUrl?: string;
  uploadFileName?: string;
  uploadFileSize?: number;
  uploadMimeType?: string;
  uploadStatus?: UploadStatus;
  processingStatus?: ProcessingStatus;
  // Academic links (multi-row with optional time ranges). Real once persisted:
  // the underlying linkedChapterIds/linkedLessonIds/linkedConceptIds/linkedAtomicConceptIds
  // are database-backed (material_chapter_links etc). Per-row time ranges (fromTime/toTime,
  // for linking a specific video clip) are not yet part of the backend schema and are kept
  // client-side only — they do not survive a reload.
  academicLinks?: AcademicLink[];
  // Flexible linking (Phase A) — auto-populated from academicLinks
  linkedSessionIds: string[];
  linkedChapterIds: string[];
  linkedLessonIds: string[];
  linkedConceptIds: string[];
  linkedAtomicConceptIds: string[];
  reuseCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateMaterialData = Pick<TeacherMaterial, "type" | "title"> & Partial<Pick<TeacherMaterial,
  "sessionId" | "courseId" | "chapterId" | "description" | "videoUrl" | "videoDuration" |
  "videoDurationSeconds" | "thumbnailUrl" | "segments" |
  "fileUrl" | "fileName" | "fileSize" | "fileType" | "notesContent" | "status" |
  "linkedSessionIds" | "linkedChapterIds" | "linkedLessonIds" | "linkedConceptIds" | "linkedAtomicConceptIds" |
  "sourceMode" | "sourceProvider" | "originalUrl" | "studentDisplayTitle" | "customThumbnailUrl" |
  "uploadFileName" | "uploadFileSize" | "uploadMimeType" | "uploadStatus" | "processingStatus" |
  "academicLinks"
>>;

export interface MaterialLinksData {
  chapterIds: string[];
  lessonIds: string[];
  conceptIds: string[];
  atomicConceptIds: string[];
}

interface MaterialState {
  materials: TeacherMaterial[];
  isLoading: boolean;
  loadMaterials: (courseId: string) => Promise<void>;
  createMaterial: (data: CreateMaterialData) => Promise<TeacherMaterial | null>;
  updateMaterial: (materialId: string, data: Partial<TeacherMaterial>) => Promise<boolean>;
  updateMaterialLinks: (materialId: string, links: MaterialLinksData) => Promise<boolean>;
  deleteMaterial: (materialId: string) => Promise<boolean>;
  publishMaterial: (materialId: string) => void;
  unpublishMaterial: (materialId: string) => void;
  reorderMaterials: (sessionId: string, orderedIds: string[]) => void;
}

function isNotFound(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function deriveIds(links: AcademicLink[] | undefined, key: keyof AcademicLink, fallback?: string): string[] {
  if (!links || links.length === 0) return fallback ? [fallback] : [];
  const ids = links.map((l) => l[key] as string | undefined).filter(Boolean) as string[];
  return [...new Set(ids)];
}

// Real, database-backed nodes only — no time-range info survives a reload
// since the backend link tables don't store it (see AcademicLink doc comment above).
function syntheticAcademicLinks(r: MaterialRead): AcademicLink[] {
  return [
    ...r.chapters.map((c) => ({ id: `chapter-${c.id}`, chapterId: c.id })),
    ...r.lessons.map((l) => ({ id: `lesson-${l.id}`, lessonId: l.id })),
    ...r.concepts.map((c) => ({ id: `concept-${c.id}`, conceptId: c.id })),
    ...r.atomic_concepts.map((a) => ({ id: `atomic-${a.id}`, atomicConceptId: a.id })),
  ];
}

function toMaterial(r: MaterialRead, existing?: TeacherMaterial): TeacherMaterial {
  return {
    id: r.id,
    sessionId: r.session_id || existing?.sessionId || "",
    courseId: r.course_id,
    chapterId: r.chapters[0]?.id || existing?.chapterId || "",
    type: r.type,
    title: r.title,
    description: r.description || "",
    order: r.position || existing?.order || 0,
    status: r.status,
    videoUrl: r.video_url ?? existing?.videoUrl,
    videoDuration: existing?.videoDuration,
    videoDurationSeconds: existing?.videoDurationSeconds,
    thumbnailUrl: existing?.thumbnailUrl,
    segments: existing?.segments,
    fileUrl: r.file_url ?? existing?.fileUrl,
    fileName: r.file_name ?? existing?.fileName,
    fileSize: r.file_size_bytes != null ? formatBytes(r.file_size_bytes) : existing?.fileSize,
    fileType: r.mime_type ?? existing?.fileType,
    notesContent: r.notes_content ?? existing?.notesContent,
    sourceMode: existing?.sourceMode,
    sourceProvider: existing?.sourceProvider,
    originalUrl: existing?.originalUrl,
    studentDisplayTitle: existing?.studentDisplayTitle || r.title,
    customThumbnailUrl: existing?.customThumbnailUrl,
    uploadFileName: r.file_name ?? existing?.uploadFileName,
    uploadFileSize: r.file_size_bytes ?? existing?.uploadFileSize,
    uploadMimeType: r.mime_type ?? existing?.uploadMimeType,
    uploadStatus: existing?.uploadStatus || "ready",
    processingStatus: existing?.processingStatus || "ready",
    academicLinks: syntheticAcademicLinks(r),
    linkedSessionIds: existing?.linkedSessionIds || [],
    linkedChapterIds: r.chapters.map((c) => c.id),
    linkedLessonIds: r.lessons.map((l) => l.id),
    linkedConceptIds: r.concepts.map((c) => c.id),
    linkedAtomicConceptIds: r.atomic_concepts.map((a) => a.id),
    reuseCount: existing?.reuseCount || 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export const useTeacherMaterialStore = create<MaterialState>()((set, get) => ({
  materials: [],
  isLoading: false,

  loadMaterials: async (courseId) => {
    set({ isLoading: true });
    try {
      const apiMaterials = await listMaterialsApi(courseId);
      set((state) => ({
        materials: [
          ...state.materials.filter((m) => m.courseId !== courseId),
          ...apiMaterials.map((r) => toMaterial(r, state.materials.find((m) => m.id === r.id))),
        ],
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  createMaterial: async (data) => {
    const sessionId = data.sessionId || "";
    const linkedChapterIds = data.linkedChapterIds || deriveIds(data.academicLinks, "chapterId", data.chapterId);
    const linkedLessonIds = data.linkedLessonIds || deriveIds(data.academicLinks, "lessonId");
    const linkedConceptIds = data.linkedConceptIds || deriveIds(data.academicLinks, "conceptId");
    const linkedAtomicConceptIds = data.linkedAtomicConceptIds || deriveIds(data.academicLinks, "atomicConceptId");

    if (!data.courseId) return null;
    let read: MaterialRead;
    try {
      read = await createMaterialApi({
        course_id: data.courseId,
        session_id: sessionId || undefined,
        type: data.type,
        title: data.title,
        description: data.description || undefined,
        file_url: data.fileUrl,
        video_url: data.videoUrl,
        notes_content: data.notesContent,
        file_name: data.uploadFileName || data.fileName,
        file_size_bytes: data.uploadFileSize,
        mime_type: data.uploadMimeType,
        chapter_ids: linkedChapterIds,
        lesson_ids: linkedLessonIds,
        concept_ids: linkedConceptIds,
        atomic_concept_ids: linkedAtomicConceptIds,
      });
    } catch {
      return null;
    }

    const now = new Date().toISOString();
    const material: TeacherMaterial = {
      ...toMaterial(read),
      sessionId,
      order: get().materials.filter((m) => m.sessionId === sessionId).length + 1,
      videoDuration: data.videoDuration,
      videoDurationSeconds: data.videoDurationSeconds,
      thumbnailUrl: data.thumbnailUrl,
      segments: data.segments,
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      sourceMode: data.sourceMode,
      sourceProvider: data.sourceProvider,
      originalUrl: data.originalUrl,
      studentDisplayTitle: data.studentDisplayTitle || data.title,
      customThumbnailUrl: data.customThumbnailUrl,
      uploadFileName: data.uploadFileName,
      uploadFileSize: data.uploadFileSize,
      uploadMimeType: data.uploadMimeType,
      uploadStatus: data.uploadStatus || "ready",
      processingStatus: data.processingStatus || "ready",
      // Keep the client's own time-ranged link rows for display (not persisted server-side).
      academicLinks: data.academicLinks && data.academicLinks.length > 0 ? data.academicLinks : toMaterial(read).academicLinks,
      linkedSessionIds: data.linkedSessionIds || (sessionId ? [sessionId] : []),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ materials: [...state.materials, material] }));
    return material;
  },

  updateMaterial: async (materialId, data) => {
    const hasRealChange = data.title !== undefined || data.description !== undefined || data.status !== undefined ||
      data.fileUrl !== undefined || data.videoUrl !== undefined || data.notesContent !== undefined ||
      data.sessionId !== undefined || data.fileName !== undefined;
    if (hasRealChange) {
      try {
        await updateMaterialApi(materialId, {
          title: data.title,
          description: data.description,
          status: data.status === "archived" ? undefined : data.status,
          file_url: data.fileUrl,
          video_url: data.videoUrl,
          notes_content: data.notesContent,
          session_id: data.sessionId || undefined,
          file_name: data.fileName,
        });
      } catch (err) {
        if (!isNotFound(err)) return false;
      }
    }
    set((state) => ({
      materials: state.materials.map((m) =>
        m.id === materialId ? { ...m, ...data, updatedAt: new Date().toISOString() } : m,
      ),
    }));
    return true;
  },

  updateMaterialLinks: async (materialId, links) => {
    try {
      const read = await updateMaterialLinksApi(materialId, {
        chapter_ids: links.chapterIds,
        lesson_ids: links.lessonIds,
        concept_ids: links.conceptIds,
        atomic_concept_ids: links.atomicConceptIds,
      });
      set((state) => ({
        materials: state.materials.map((m) => (m.id === materialId ? toMaterial(read, m) : m)),
      }));
      return true;
    } catch (err) {
      if (!isNotFound(err)) return false;
      set((state) => ({ materials: state.materials.filter((m) => m.id !== materialId) }));
      return true;
    }
  },

  deleteMaterial: async (materialId) => {
    try {
      await deleteMaterialApi(materialId);
    } catch (err) {
      if (!isNotFound(err)) return false;
    }
    set((state) => ({ materials: state.materials.filter((m) => m.id !== materialId) }));
    return true;
  },

  publishMaterial: (materialId) => {
    void get().updateMaterial(materialId, { status: "published" });
  },

  unpublishMaterial: (materialId) => {
    void get().updateMaterial(materialId, { status: "draft" });
  },

  reorderMaterials: (sessionId, orderedIds) => {
    set((state) => ({
      materials: state.materials.map((m) => {
        if (m.sessionId !== sessionId) return m;
        const idx = orderedIds.indexOf(m.id);
        return idx >= 0 ? { ...m, order: idx + 1 } : m;
      }),
    }));
    const courseId = get().materials.find((m) => orderedIds.includes(m.id))?.courseId;
    if (courseId) {
      void reorderMaterialsApi(courseId, orderedIds).catch(() => {
        // Best-effort: local order already applied optimistically above.
      });
    }
  },
}));

export function listMaterials(sessionId: string): TeacherMaterial[] {
  return useTeacherMaterialStore.getState().materials
    .filter((m) => m.sessionId === sessionId || (m.linkedSessionIds && m.linkedSessionIds.includes(sessionId)))
    .sort((a, b) => a.order - b.order);
}

export function getPublishedMaterials(sessionId: string): TeacherMaterial[] {
  return listMaterials(sessionId).filter((m) => m.status === "published");
}

export function getMaterialsBySession(courseId: string): Map<string, TeacherMaterial[]> {
  const all = useTeacherMaterialStore.getState().materials
    .filter((m) => m.courseId === courseId && m.status === "published");
  const map = new Map<string, TeacherMaterial[]>();
  for (const m of all) {
    const list = map.get(m.sessionId) || [];
    list.push(m);
    map.set(m.sessionId, list);
  }
  return map;
}

export function getAllLibraryMaterials(): TeacherMaterial[] {
  return useTeacherMaterialStore.getState().materials.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function linkMaterialToSession(materialId: string, sessionId: string): void {
  const store = useTeacherMaterialStore.getState();
  const mat = store.materials.find((m) => m.id === materialId);
  if (!mat) return;
  const linked = mat.linkedSessionIds || [];
  if (!linked.includes(sessionId)) {
    void store.updateMaterial(materialId, {
      linkedSessionIds: [...linked, sessionId],
      reuseCount: (mat.reuseCount || 0) + 1,
    });
  }
}

export function linkSegmentToSession(materialId: string, segmentId: string, sessionId: string): void {
  const store = useTeacherMaterialStore.getState();
  const mat = store.materials.find((m) => m.id === materialId);
  const segment = mat?.segments?.find((s) => s.id === segmentId);
  if (!mat || !segment) return;
  const linked = segment.linkedSessionIds || [];
  if (linked.includes(sessionId)) return;
  void store.updateMaterial(materialId, {
    segments: mat.segments!.map((s) => (s.id === segmentId ? { ...s, linkedSessionIds: [...linked, sessionId] } : s)),
    reuseCount: (mat.reuseCount || 0) + 1,
  });
}

export function unlinkSegmentFromSession(materialId: string, segmentId: string, sessionId: string): void {
  const store = useTeacherMaterialStore.getState();
  const mat = store.materials.find((m) => m.id === materialId);
  const segment = mat?.segments?.find((s) => s.id === segmentId);
  if (!mat || !segment) return;
  void store.updateMaterial(materialId, {
    segments: mat.segments!.map((s) =>
      s.id === segmentId ? { ...s, linkedSessionIds: (s.linkedSessionIds || []).filter((id) => id !== sessionId) } : s,
    ),
  });
}
