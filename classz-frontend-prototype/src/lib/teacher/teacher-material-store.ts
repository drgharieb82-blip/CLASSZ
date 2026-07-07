import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MaterialType = "video" | "pdf" | "image" | "attachment" | "notes";
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
  // Academic links (multi-row with optional time ranges)
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

interface MaterialState {
  materials: TeacherMaterial[];
  createMaterial: (data: CreateMaterialData) => TeacherMaterial;
  updateMaterial: (materialId: string, data: Partial<TeacherMaterial>) => void;
  deleteMaterial: (materialId: string) => void;
  publishMaterial: (materialId: string) => void;
  unpublishMaterial: (materialId: string) => void;
  reorderMaterials: (sessionId: string, orderedIds: string[]) => void;
}

let counter = 0;

function generateId(): string {
  return `mat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function deriveIds(links: AcademicLink[] | undefined, key: keyof AcademicLink, fallback?: string): string[] {
  if (!links || links.length === 0) return fallback ? [fallback] : [];
  const ids = links.map((l) => l[key] as string | undefined).filter(Boolean) as string[];
  return [...new Set(ids)];
}

export const useTeacherMaterialStore = create<MaterialState>()(
  persist(
    (set, get) => ({
      materials: [],

      createMaterial: (data) => {
        const sessionId = data.sessionId || "";
        const sessionMaterials = sessionId ? get().materials.filter((m) => m.sessionId === sessionId) : [];
        const now = new Date().toISOString();
        const material: TeacherMaterial = {
          id: generateId(),
          sessionId,
          courseId: data.courseId || "",
          chapterId: data.chapterId || "",
          type: data.type,
          title: data.title,
          description: data.description || "",
          order: sessionMaterials.length + 1,
          status: data.status || "draft",
          videoUrl: data.videoUrl,
          videoDuration: data.videoDuration,
          videoDurationSeconds: data.videoDurationSeconds,
          thumbnailUrl: data.thumbnailUrl,
          segments: data.segments,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileType: data.fileType,
          notesContent: data.notesContent,
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
          academicLinks: data.academicLinks,
          linkedSessionIds: data.linkedSessionIds || (sessionId ? [sessionId] : []),
          linkedChapterIds: data.linkedChapterIds || deriveIds(data.academicLinks, "chapterId", data.chapterId),
          linkedLessonIds: data.linkedLessonIds || deriveIds(data.academicLinks, "lessonId"),
          linkedConceptIds: data.linkedConceptIds || deriveIds(data.academicLinks, "conceptId"),
          linkedAtomicConceptIds: data.linkedAtomicConceptIds || deriveIds(data.academicLinks, "atomicConceptId"),
          reuseCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ materials: [...state.materials, material] }));
        return material;
      },

      updateMaterial: (materialId, data) => {
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === materialId ? { ...m, ...data, updatedAt: new Date().toISOString() } : m,
          ),
        }));
      },

      deleteMaterial: (materialId) => {
        set((state) => ({ materials: state.materials.filter((m) => m.id !== materialId) }));
      },

      publishMaterial: (materialId) => {
        get().updateMaterial(materialId, { status: "published" });
      },

      unpublishMaterial: (materialId) => {
        get().updateMaterial(materialId, { status: "draft" });
      },

      reorderMaterials: (sessionId, orderedIds) => {
        set((state) => ({
          materials: state.materials.map((m) => {
            if (m.sessionId !== sessionId) return m;
            const idx = orderedIds.indexOf(m.id);
            return idx >= 0 ? { ...m, order: idx + 1 } : m;
          }),
        }));
      },
    }),
    { name: "classz-teacher-materials" },
  ),
);

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
    store.updateMaterial(materialId, {
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
  store.updateMaterial(materialId, {
    segments: mat.segments!.map((s) => (s.id === segmentId ? { ...s, linkedSessionIds: [...linked, sessionId] } : s)),
    reuseCount: (mat.reuseCount || 0) + 1,
  });
}

export function unlinkSegmentFromSession(materialId: string, segmentId: string, sessionId: string): void {
  const store = useTeacherMaterialStore.getState();
  const mat = store.materials.find((m) => m.id === materialId);
  const segment = mat?.segments?.find((s) => s.id === segmentId);
  if (!mat || !segment) return;
  store.updateMaterial(materialId, {
    segments: mat.segments!.map((s) =>
      s.id === segmentId ? { ...s, linkedSessionIds: (s.linkedSessionIds || []).filter((id) => id !== sessionId) } : s,
    ),
  });
}
