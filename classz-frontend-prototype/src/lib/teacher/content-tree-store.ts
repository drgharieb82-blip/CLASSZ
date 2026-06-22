import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TreeNodeType = "course" | "chapter" | "lesson" | "concept" | "atomic_concept";
export type CoverageStatus = "not_started" | "missing_material" | "partial" | "covered" | "needs_review" | "extra";

export interface ContentTreeNode {
  id: string;
  publicCode: string;
  type: TreeNodeType;
  title: string;
  parentId: string;
  courseId: string;
  isOfficial: boolean;
  isRequired: boolean;
  isHidden: boolean;
  order: number;
  coverageStatus: CoverageStatus;
  linkedMaterialIds: string[];
  linkedSessionIds: string[];
  linkedQuestionIds: string[];
  note: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateNodeData = Pick<ContentTreeNode, "type" | "title" | "parentId" | "courseId"> &
  Partial<Pick<ContentTreeNode, "isOfficial" | "isRequired" | "note">>;

const CODE_PREFIXES: Record<TreeNodeType, string> = {
  course: "CRS", chapter: "CHP", lesson: "LES", concept: "CON", atomic_concept: "ATC",
};

let counter = 100;
function genId() { return `tn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`; }
function genCode(type: TreeNodeType) { counter++; const d = type === "atomic_concept" ? 6 : 4; return `${CODE_PREFIXES[type]}-26-${counter.toString().padStart(d, "0")}`; }

interface TreeState {
  nodes: ContentTreeNode[];
  createNode: (data: CreateNodeData) => ContentTreeNode;
  updateNode: (nodeId: string, data: Partial<ContentTreeNode>) => void;
  deleteNode: (nodeId: string) => void;
  hideNode: (nodeId: string) => void;
  showNode: (nodeId: string) => void;
  linkMaterial: (nodeId: string, materialId: string) => void;
  unlinkMaterial: (nodeId: string, materialId: string) => void;
  linkSession: (nodeId: string, sessionId: string) => void;
  linkQuestion: (nodeId: string, questionId: string) => void;
  recomputeCoverage: (courseId: string) => void;
}

function computeStatus(node: ContentTreeNode, children: ContentTreeNode[]): CoverageStatus {
  if (node.isHidden) return "not_started";
  if (!node.isOfficial && node.linkedMaterialIds.length > 0) return "extra";
  const hasMaterials = node.linkedMaterialIds.length > 0;
  const hasQuestions = node.linkedQuestionIds.length > 0;
  const hasSessions = node.linkedSessionIds.length > 0;
  if (children.length > 0) {
    const visible = children.filter((c) => !c.isHidden);
    if (visible.length === 0) return "not_started";
    const covered = visible.filter((c) => c.coverageStatus === "covered" || c.coverageStatus === "extra").length;
    if (covered === visible.length) return "covered";
    if (covered > 0 || hasMaterials) return "partial";
    return "missing_material";
  }
  if (hasMaterials && hasQuestions) return "covered";
  if (hasMaterials || hasSessions) return "partial";
  return node.isRequired ? "missing_material" : "not_started";
}

export const useContentTreeStore = create<TreeState>()(
  persist(
    (set, get) => ({
      nodes: [],

      createNode: (data) => {
        const siblings = get().nodes.filter((n) => n.parentId === data.parentId && n.courseId === data.courseId);
        const now = new Date().toISOString();
        const node: ContentTreeNode = {
          id: genId(), publicCode: genCode(data.type), type: data.type,
          title: data.title, parentId: data.parentId, courseId: data.courseId,
          isOfficial: data.isOfficial ?? false, isRequired: data.isRequired ?? true,
          isHidden: false, order: siblings.length + 1,
          coverageStatus: "not_started",
          linkedMaterialIds: [], linkedSessionIds: [], linkedQuestionIds: [],
          note: data.note || "", createdAt: now, updatedAt: now,
        };
        set((s) => ({ nodes: [...s.nodes, node] }));
        return node;
      },

      updateNode: (nodeId, data) => set((s) => ({
        nodes: s.nodes.map((n) => n.id === nodeId ? { ...n, ...data, updatedAt: new Date().toISOString() } : n),
      })),

      deleteNode: (nodeId) => {
        const descendants = getAllDescendants(get().nodes, nodeId);
        const idsToRemove = new Set([nodeId, ...descendants.map((d) => d.id)]);
        set((s) => ({ nodes: s.nodes.filter((n) => !idsToRemove.has(n.id)) }));
      },

      hideNode: (nodeId) => get().updateNode(nodeId, { isHidden: true }),
      showNode: (nodeId) => get().updateNode(nodeId, { isHidden: false }),

      linkMaterial: (nodeId, materialId) => {
        const node = get().nodes.find((n) => n.id === nodeId);
        if (node && !node.linkedMaterialIds.includes(materialId)) {
          get().updateNode(nodeId, { linkedMaterialIds: [...node.linkedMaterialIds, materialId] });
        }
      },

      unlinkMaterial: (nodeId, materialId) => {
        const node = get().nodes.find((n) => n.id === nodeId);
        if (node) get().updateNode(nodeId, { linkedMaterialIds: node.linkedMaterialIds.filter((id) => id !== materialId) });
      },

      linkSession: (nodeId, sessionId) => {
        const node = get().nodes.find((n) => n.id === nodeId);
        if (node && !node.linkedSessionIds.includes(sessionId)) {
          get().updateNode(nodeId, { linkedSessionIds: [...node.linkedSessionIds, sessionId] });
        }
      },

      linkQuestion: (nodeId, questionId) => {
        const node = get().nodes.find((n) => n.id === nodeId);
        if (node && !node.linkedQuestionIds.includes(questionId)) {
          get().updateNode(nodeId, { linkedQuestionIds: [...node.linkedQuestionIds, questionId] });
        }
      },

      recomputeCoverage: (courseId) => {
        const nodes = get().nodes.filter((n) => n.courseId === courseId);
        const typeOrder: TreeNodeType[] = ["atomic_concept", "concept", "lesson", "chapter", "course"];
        const updated = [...nodes];
        for (const type of typeOrder) {
          for (const node of updated.filter((n) => n.type === type)) {
            const children = updated.filter((n) => n.parentId === node.id);
            node.coverageStatus = computeStatus(node, children);
          }
        }
        set((s) => ({
          nodes: s.nodes.map((n) => {
            if (n.courseId !== courseId) return n;
            const u = updated.find((x) => x.id === n.id);
            return u ? { ...n, coverageStatus: u.coverageStatus } : n;
          }),
        }));
      },
    }),
    { name: "classz-content-tree" },
  ),
);

function getAllDescendants(nodes: ContentTreeNode[], parentId: string): ContentTreeNode[] {
  const children = nodes.filter((n) => n.parentId === parentId);
  return children.flatMap((c) => [c, ...getAllDescendants(nodes, c.id)]);
}

export function getTreeForCourse(courseId: string): ContentTreeNode[] {
  return useContentTreeStore.getState().nodes.filter((n) => n.courseId === courseId).sort((a, b) => a.order - b.order);
}

export function getRootNodes(courseId: string): ContentTreeNode[] {
  return getTreeForCourse(courseId).filter((n) => n.type === "chapter" && !n.parentId);
}

export function getChildren(parentId: string): ContentTreeNode[] {
  return useContentTreeStore.getState().nodes.filter((n) => n.parentId === parentId).sort((a, b) => a.order - b.order);
}

export function getCoverageSummary(courseId: string) {
  const nodes = getTreeForCourse(courseId);
  const byType = (type: TreeNodeType) => nodes.filter((n) => n.type === type && !n.isHidden);
  const covered = (type: TreeNodeType) => byType(type).filter((n) => n.coverageStatus === "covered" || n.coverageStatus === "extra").length;
  const chapters = byType("chapter"); const lessons = byType("lesson");
  const concepts = byType("concept"); const atomics = byType("atomic_concept");
  const total = chapters.length + lessons.length + concepts.length + atomics.length;
  const done = covered("chapter") + covered("lesson") + covered("concept") + covered("atomic_concept");
  return {
    totalNodes: total, coveredNodes: done, coveragePercent: total > 0 ? Math.round((done / total) * 100) : 0,
    chapters: { total: chapters.length, covered: covered("chapter") },
    lessons: { total: lessons.length, covered: covered("lesson") },
    concepts: { total: concepts.length, covered: covered("concept") },
    atomicConcepts: { total: atomics.length, covered: covered("atomic_concept") },
    materialsLinked: new Set(nodes.flatMap((n) => n.linkedMaterialIds)).size,
    sessionsLinked: new Set(nodes.flatMap((n) => n.linkedSessionIds)).size,
  };
}
