import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MaterialType = "video" | "pdf" | "image" | "attachment" | "notes";
export type MaterialStatus = "draft" | "published" | "archived";

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
  // Flexible linking (Phase A)
  linkedSessionIds: string[];
  linkedChapterIds: string[];
  linkedLessonIds: string[];
  linkedConceptIds: string[];
  linkedAtomicConceptIds: string[];
  reuseCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateMaterialData = Pick<TeacherMaterial,
  "sessionId" | "courseId" | "chapterId" | "type" | "title"
> & Partial<Pick<TeacherMaterial,
  "description" | "videoUrl" | "videoDuration" | "fileUrl" | "fileName" | "fileSize" | "fileType" | "notesContent" | "status"
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

export const useTeacherMaterialStore = create<MaterialState>()(
  persist(
    (set, get) => ({
      materials: [],

      createMaterial: (data) => {
        const sessionMaterials = get().materials.filter((m) => m.sessionId === data.sessionId);
        const now = new Date().toISOString();
        const material: TeacherMaterial = {
          id: generateId(),
          sessionId: data.sessionId,
          courseId: data.courseId,
          chapterId: data.chapterId,
          type: data.type,
          title: data.title,
          description: data.description || "",
          order: sessionMaterials.length + 1,
          status: data.status || "draft",
          videoUrl: data.videoUrl,
          videoDuration: data.videoDuration,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileType: data.fileType,
          notesContent: data.notesContent,
          linkedSessionIds: data.sessionId ? [data.sessionId] : [],
          linkedChapterIds: data.chapterId ? [data.chapterId] : [],
          linkedLessonIds: [],
          linkedConceptIds: [],
          linkedAtomicConceptIds: [],
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
