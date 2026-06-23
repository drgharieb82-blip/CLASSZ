import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowDown, ArrowUp, BookOpen, Brain, Calendar, Check, ChevronDown, ChevronUp,
  ChevronRight, Clock, Copy, DollarSign, Edit3, Eye, EyeOff, File, FileText,
  Film, FolderTree, HelpCircle, ClipboardList, Image, Layers, Link2, Lock,
  Pencil, PlayCircle, Plus, ScrollText, Sparkles, StickyNote, Target,
  Trash2, Unlock, Upload, Users, Video, X, Zap,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { useTeacherChapterStore } from "@/lib/teacher/teacher-chapter-store";
import { useTeacherSessionStore } from "@/lib/teacher/teacher-session-store";
import {
  useTeacherMaterialStore, type TeacherMaterial, type MaterialType, type CreateMaterialData, type AcademicLink,
} from "@/lib/teacher/teacher-material-store";
import { useTeacherQuestionStore, type TeacherQuestion, type AnswerData, type MCQChoice } from "@/lib/teacher/teacher-question-store";
import { useTeacherQuizStore } from "@/lib/teacher/teacher-quiz-store";
import { useTeacherExamStore } from "@/lib/teacher/teacher-exam-store";
import { useTeacherHomeworkStore } from "@/lib/teacher/teacher-homework-store";
import { useTeacherAssignmentStore } from "@/lib/teacher/teacher-assignment-store";
import {
  useContentTreeStore, getCoverageSummary,
  type ContentTreeNode,
} from "@/lib/teacher/content-tree-store";
import { SESSION_TYPE_META, type SessionWorkspaceType } from "@/lib/teacher/session-workspace-types";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { PremiumSessionCard, type SessionStats } from "@/components/session/PremiumSessionCard";
import { AssessmentEngineTab as AssessmentEngineWorkspaceTab } from "@/components/teacher/AssessmentEngineTab";
import {
  TYPE_LABELS as QS_TYPE_LABELS, TYPE_COLORS as QS_TYPE_COLORS,
  DIFF_COLORS as QS_DIFF_COLORS, CATEGORY_MAP as QS_CATEGORY_MAP,
  ALL_TYPE_OPTIONS as QS_ALL_TYPE_OPTIONS,
} from "@/components/question/question-bank-shared";

export const Route = createFileRoute("/teacher/content-studio")({
  component: ContentStudioPage,
});

const CONTENT_TABS = [
  { key: "tree", label: "Content Tree", icon: FolderTree },
  { key: "materials", label: "Materials", icon: FileText },
  { key: "questions", label: "Question Bank", icon: HelpCircle },
  { key: "assessments", label: "Assessment Engine", icon: ClipboardList },
];

const SESSION_TAB = { key: "sessions", label: "Sessions", icon: PlayCircle };

function ContentStudioPage() {
  const courses = useTeacherCourseStore((s) => s.courses);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem("classz-content-studio-tab") || "materials");
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <DashPage role="teacher" title="Content Studio" subtitle="Build, organize, reuse, and publish your complete course content" icon={ROLES.teacher.icon}>
      <Card className="border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Current Course:</span>
          <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="h-9 flex-1 max-w-sm rounded-xl border bg-card px-3 text-sm font-medium">
            <option value="">Select a course...</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title} ({c.publicCode})</option>)}
          </select>
          {selectedCourse && <Badge variant="outline" className="rounded-full text-xs">{selectedCourse.status}</Badge>}
          <Button asChild variant="outline" size="sm" className="rounded-xl ms-auto">
            <Link to="/teacher/courses/create">+ New Course</Link>
          </Button>
        </div>
      </Card>

      {!selectedCourseId ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-16 text-center">
          <FolderTree className="h-14 w-14 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Choose a course to start building content</h2>
          <p className="text-sm text-muted-foreground max-w-md">Select a course to manage its content tree, sessions, materials, questions, quizzes, exams and assignments.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl" onClick={() => { if (courses.length > 0) setSelectedCourseId(courses[0].id); }}>Select Course</Button>
            <Button asChild className="rounded-xl gradient-brand border-0 text-white"><Link to="/teacher/courses/create">Create New Course</Link></Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-0.5 overflow-x-auto border-b pb-px">
            {CONTENT_TABS.map((t) => (
              <button key={t.key} onClick={() => { setActiveTab(t.key); sessionStorage.setItem("classz-content-studio-tab", t.key); }} className={cn("flex items-center gap-1.5 whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-medium transition-colors", activeTab === t.key ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}>
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
            <div className="mx-1.5 h-5 w-px bg-border shrink-0" />
            <button onClick={() => { setActiveTab(SESSION_TAB.key); sessionStorage.setItem("classz-content-studio-tab", SESSION_TAB.key); }} className={cn("flex items-center gap-1.5 whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-medium transition-colors", activeTab === SESSION_TAB.key ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}>
              <SESSION_TAB.icon className="h-3.5 w-3.5" /> {SESSION_TAB.label}
              <span className="text-[10px] text-muted-foreground font-normal hidden sm:inline">· Build learning experiences</span>
            </button>
          </div>

          {activeTab === "tree" && <ContentTreeTab courseId={selectedCourseId} onSwitchTab={setActiveTab} />}
          {activeTab === "materials" && <MaterialsTab courseId={selectedCourseId} />}
          {activeTab === "questions" && <QuestionsTab courseId={selectedCourseId} />}
          {activeTab === "assessments" && <AssessmentEngineTab courseId={selectedCourseId} />}
          {activeTab === "sessions" && <SessionsTab courseId={selectedCourseId} />}
        </>
      )}
    </DashPage>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. CONTENT TREE TAB — 3-column layout
   ═══════════════════════════════════════════════════════════════ */

function ContentTreeTab({ courseId, onSwitchTab }: { courseId: string; onSwitchTab: (tab: string) => void }) {
  const allNodes = useContentTreeStore((s) => s.nodes);
  const createNode = useContentTreeStore((s) => s.createNode);
  const updateNode = useContentTreeStore((s) => s.updateNode);
  const deleteNode = useContentTreeStore((s) => s.deleteNode);
  const hideNode = useContentTreeStore((s) => s.hideNode);
  const showNode = useContentTreeStore((s) => s.showNode);
  const allChapters = useTeacherChapterStore((s) => s.chapters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addTitle, setAddTitle] = useState("");
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  const treeNodes = useMemo(() => allNodes.filter((n) => n.courseId === courseId), [allNodes, courseId]);
  const chapters = useMemo(() => allChapters.filter((c) => c.courseId === courseId).sort((a, b) => a.order - b.order), [allChapters, courseId]);
  const selectedNode = useMemo(() => treeNodes.find((n) => n.id === selectedId), [treeNodes, selectedId]);
  const children = useMemo(() => selectedNode ? treeNodes.filter((n) => n.parentId === selectedNode.id).sort((a, b) => a.order - b.order) : [], [treeNodes, selectedNode]);
  const coverage = useMemo(() => getCoverageSummary(courseId), [courseId, allNodes]);
  const rootNodes = useMemo(() => treeNodes.filter((n) => n.type === "chapter" && !n.parentId).sort((a, b) => a.order - b.order), [treeNodes]);

  const childTypeMap: Record<string, string> = { chapter: "lesson", lesson: "concept", concept: "atomic_concept" };

  const handleAddChild = () => {
    if (!addTitle.trim() || !selectedNode) return;
    const childType = childTypeMap[selectedNode.type];
    if (!childType) return;
    createNode({ type: childType as any, title: addTitle.trim(), parentId: selectedNode.id, courseId, isOfficial: true });
    setAddTitle("");
  };

  return (
    <div className="space-y-4">
      {/* Coverage Summary */}
      <div className="grid gap-3 sm:grid-cols-5">
        {[
          { label: "Chapters", v: `${coverage.chapters.covered}/${coverage.chapters.total}`, cls: "text-blue-600" },
          { label: "Lessons", v: `${coverage.lessons.covered}/${coverage.lessons.total}`, cls: "text-emerald-600" },
          { label: "Concepts", v: `${coverage.concepts.covered}/${coverage.concepts.total}`, cls: "text-violet-600" },
          { label: "Atomics", v: `${coverage.atomicConcepts.covered}/${coverage.atomicConcepts.total}`, cls: "text-amber-600" },
          { label: "Coverage", v: `${coverage.coveragePercent}%`, cls: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="border bg-card p-3 text-center">
            <p className={cn("text-lg font-bold", s.cls)}>{s.v}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4">
        {/* LEFT — Tree */}
        <Card className="border bg-card overflow-hidden">
          <div className="p-3 border-b flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course Structure</h4>
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => {
              const title = prompt("New chapter title:");
              if (title?.trim()) createNode({ type: "chapter", title: title.trim(), parentId: "", courseId, isOfficial: true });
            }}><Plus className="h-3 w-3" /></Button>
          </div>
          <div className="max-h-[32rem] overflow-y-auto">
            <div className="p-2 space-y-0.5">
              {rootNodes.length === 0 && chapters.length === 0 ? (
                <p className="text-xs text-muted-foreground p-2">No content tree nodes. Add chapters to get started.</p>
              ) : rootNodes.length === 0 ? (
                <p className="text-xs text-muted-foreground p-2">No tree nodes yet. Use Content Tree store to build the hierarchy.</p>
              ) : (
                rootNodes.map((node) => (
                  <TreeBranch key={node.id} node={node} nodes={treeNodes} depth={0} selectedId={selectedId} onSelect={setSelectedId} />
                ))
              )}
            </div>
          </div>
        </Card>

        {/* CENTER — Selected node details */}
        <Card className="border bg-card overflow-hidden">
          <div className="max-h-[32rem] overflow-y-auto">
            {!selectedNode ? (
              <div className="flex flex-col items-center gap-4 p-12 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold">Select a node from the tree</h3>
                <p className="text-sm text-muted-foreground max-w-sm">Click any chapter, lesson, concept, or atomic concept in the left panel to view its details and linked content.</p>
                <div className="grid gap-2 sm:grid-cols-3 w-full max-w-md mt-2">
                  {[
                    { label: "Materials Linked", value: coverage.materialsLinked, icon: Video },
                    { label: "Sessions Linked", value: coverage.sessionsLinked, icon: PlayCircle },
                    { label: "Total Nodes", value: coverage.totalNodes, icon: Layers },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border p-3 text-center">
                      <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                      <p className="text-lg font-bold">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="rounded-full text-[10px] capitalize">{selectedNode.type.replace("_", " ")}</Badge>
                    <CoverageBadge status={selectedNode.coverageStatus} />
                    {selectedNode.isOfficial && <Badge className="rounded-full bg-blue-500/10 text-blue-600 border-0 text-[10px]">Official</Badge>}
                    {selectedNode.isHidden && <Badge className="rounded-full bg-slate-500/10 text-slate-500 border-0 text-[10px]">Hidden</Badge>}
                  </div>
                  <h3 className="text-lg font-semibold">{selectedNode.title}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{selectedNode.publicCode}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border p-3 text-center">
                    <p className="text-xl font-bold text-blue-600">{(selectedNode.linkedMaterialIds || []).length}</p>
                    <p className="text-[10px] text-muted-foreground">Materials</p>
                  </div>
                  <div className="rounded-xl border p-3 text-center">
                    <p className="text-xl font-bold text-emerald-600">{(selectedNode.linkedSessionIds || []).length}</p>
                    <p className="text-[10px] text-muted-foreground">Sessions</p>
                  </div>
                  <div className="rounded-xl border p-3 text-center">
                    <p className="text-xl font-bold text-violet-600">{(selectedNode.linkedQuestionIds || []).length}</p>
                    <p className="text-[10px] text-muted-foreground">Questions</p>
                  </div>
                </div>

                {/* Children */}
                {children.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Children ({children.length})</h4>
                    <div className="space-y-1">
                      {children.map((c) => (
                        <button key={c.id} onClick={() => setSelectedId(c.id)} className="flex items-center gap-2 w-full rounded-lg border px-3 py-2 text-xs text-start hover:bg-accent/50 transition-colors">
                          <span className="truncate flex-1">{c.title}</span>
                          <CoverageBadge status={c.coverageStatus} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedNode.note && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Note</h4>
                    <p className="text-sm text-muted-foreground">{selectedNode.note}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="border-t pt-3 space-y-1 text-[11px] text-muted-foreground">
                  <p>Created: {new Date(selectedNode.createdAt).toLocaleString()}</p>
                  <p>Updated: {new Date(selectedNode.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* RIGHT — Structure Actions & Coverage */}
        <Card className="border bg-card overflow-hidden">
          <div className="max-h-[32rem] overflow-y-auto">
            <div className="p-4 space-y-4">
              {selectedNode ? (
                <>
                  {/* Structure Actions */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Structure</h4>
                    <div className="space-y-1.5">
                      {childTypeMap[selectedNode.type] && (
                        <div className="space-y-1.5 mb-2">
                          <Label className="text-[11px]">Add {childTypeMap[selectedNode.type].replace("_", " ")}</Label>
                          <div className="flex gap-1.5">
                            <Input value={addTitle} onChange={(e) => setAddTitle(e.target.value)} placeholder="Title..." className="h-8 rounded-lg text-xs flex-1" onKeyDown={(e) => e.key === "Enter" && handleAddChild()} />
                            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs shrink-0" onClick={handleAddChild} disabled={!addTitle.trim()}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="w-full rounded-lg text-xs h-8 justify-start gap-2" onClick={() => {
                        const newTitle = prompt("Edit title:", selectedNode.title);
                        if (newTitle?.trim() && newTitle !== selectedNode.title) updateNode(selectedNode.id, { title: newTitle.trim() });
                      }}>
                        <Pencil className="h-3 w-3" />Edit Title
                      </Button>
                      {selectedNode.isHidden ? (
                        <Button variant="outline" size="sm" className="w-full rounded-lg text-xs h-8 justify-start gap-2" onClick={() => showNode(selectedNode.id)}>
                          <Eye className="h-3 w-3" />Show Node
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full rounded-lg text-xs h-8 justify-start gap-2" onClick={() => hideNode(selectedNode.id)}>
                          <EyeOff className="h-3 w-3" />Hide / Mark Optional
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="w-full rounded-lg text-xs h-8 justify-start gap-2" onClick={() => updateNode(selectedNode.id, { isRequired: !selectedNode.isRequired })}>
                        {selectedNode.isRequired ? <><Check className="h-3 w-3" />Required</> : <><X className="h-3 w-3" />Optional</>}
                      </Button>
                      <Button variant="outline" size="sm" className="w-full rounded-lg text-xs h-8 justify-start gap-2" onClick={() => updateNode(selectedNode.id, { isOfficial: !selectedNode.isOfficial })}>
                        {selectedNode.isOfficial ? <><FolderTree className="h-3 w-3" />Official</> : <><FolderTree className="h-3 w-3" />Custom</>}
                      </Button>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="border-t pt-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Note</h4>
                    {editingNote ? (
                      <div className="space-y-1.5">
                        <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} rows={3} className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-xs resize-none" placeholder="Add a note..." />
                        <div className="flex gap-1.5">
                          <Button variant="outline" size="sm" className="h-7 rounded-lg text-xs" onClick={() => { updateNode(selectedNode.id, { note: noteDraft }); setEditingNote(false); }}>Save</Button>
                          <Button variant="ghost" size="sm" className="h-7 rounded-lg text-xs" onClick={() => setEditingNote(false)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setNoteDraft(selectedNode.note || ""); setEditingNote(true); }} className="w-full text-start rounded-lg border border-dashed px-2.5 py-2 text-xs text-muted-foreground hover:bg-accent/30 transition-colors">
                        {selectedNode.note || "Click to add note..."}
                      </button>
                    )}
                  </div>

                  {/* Coverage (read-only) */}
                  <div className="border-t pt-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Linked Content</h4>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between rounded-lg border px-2.5 py-2 text-xs">
                        <span className="flex items-center gap-1.5"><Video className="h-3 w-3 text-blue-500" />Materials</span>
                        <span className="font-semibold">{(selectedNode.linkedMaterialIds || []).length}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border px-2.5 py-2 text-xs">
                        <span className="flex items-center gap-1.5"><HelpCircle className="h-3 w-3 text-emerald-500" />Questions</span>
                        <span className="font-semibold">{(selectedNode.linkedQuestionIds || []).length}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border px-2.5 py-2 text-xs">
                        <span className="flex items-center gap-1.5"><PlayCircle className="h-3 w-3 text-violet-500" />Sessions</span>
                        <span className="font-semibold">{(selectedNode.linkedSessionIds || []).length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Navigate to other tabs */}
                  <div className="border-t pt-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">View in Tab</h4>
                    <div className="space-y-1.5">
                      <Button variant="outline" size="sm" className="w-full rounded-lg text-xs h-8 justify-start gap-2" onClick={() => onSwitchTab("materials")}>
                        <FileText className="h-3 w-3 text-blue-500" />Materials for this node
                      </Button>
                      <Button variant="outline" size="sm" className="w-full rounded-lg text-xs h-8 justify-start gap-2" onClick={() => onSwitchTab("questions")}>
                        <HelpCircle className="h-3 w-3 text-emerald-500" />Questions for this node
                      </Button>
                      <Button variant="outline" size="sm" className="w-full rounded-lg text-xs h-8 justify-start gap-2" onClick={() => onSwitchTab("sessions")}>
                        <PlayCircle className="h-3 w-3 text-violet-500" />Sessions for this node
                      </Button>
                    </div>
                  </div>

                  {/* Danger zone */}
                  <div className="border-t pt-3">
                    <Button variant="outline" size="sm" className="w-full rounded-lg text-xs h-8 justify-start gap-2 text-destructive" onClick={() => { deleteNode(selectedNode.id); setSelectedId(null); }}>
                      <Trash2 className="h-3 w-3" />Delete Node
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3 text-center py-4">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-xs text-muted-foreground">Select a node to edit structure and view linked content.</p>
                  <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1.5" onClick={() => {
                    const title = prompt("New chapter title:");
                    if (title?.trim()) createNode({ type: "chapter", title: title.trim(), parentId: "", courseId, isOfficial: true });
                  }}>
                    <Plus className="h-3 w-3" />Add Chapter
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. SESSIONS TAB
   ═══════════════════════════════════════════════════════════════ */

function SessionsTab({ courseId }: { courseId: string }) {
  const rawSessions = useTeacherSessionStore((s) => s.sessions);
  const createSession = useTeacherSessionStore((s) => s.createSession);
  const deleteSession = useTeacherSessionStore((s) => s.deleteSession);
  const publishSession = useTeacherSessionStore((s) => s.publishSession);
  const archiveSession = useTeacherSessionStore((s) => s.archiveSession);
  const lockSession = useTeacherSessionStore((s) => s.lockSession);
  const unlockSession = useTeacherSessionStore((s) => s.unlockSession);
  const updateSession = useTeacherSessionStore((s) => s.updateSession);
  const rawChapters = useTeacherChapterStore((s) => s.chapters);
  const allMaterials = useTeacherMaterialStore((s) => s.materials);
  const allQuestions = useTeacherQuestionStore((s) => s.questions);
  const allQuizzes = useTeacherQuizStore((s) => s.quizzes);
  const allExams = useTeacherExamStore((s) => s.exams);
  const allHomework = useTeacherHomeworkStore((s) => s.items);
  const allTreeNodes = useContentTreeStore((s) => s.nodes);

  const allSessions = useMemo(() => rawSessions.filter((ses) => ses.courseId === courseId).sort((a, b) => a.order - b.order), [rawSessions, courseId]);
  const chapters = useMemo(() => rawChapters.filter((c) => c.courseId === courseId).sort((a, b) => a.order - b.order), [rawChapters, courseId]);
  const treeNodes = useMemo(() => allTreeNodes.filter((n) => n.courseId === courseId), [allTreeNodes, courseId]);
  const treeConcepts = useMemo(() => treeNodes.filter((n) => n.type === "concept"), [treeNodes]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [chapterId, setChapterId] = useState(() => {
    const ch = rawChapters.filter((c) => c.courseId === courseId);
    return ch[0]?.id || "";
  });
  const [price, setPrice] = useState("0");
  const [sesConceptIds, setSesConceptIds] = useState<string[]>([]);

  const filterOptions = useMemo<FilterOption[]>(() => [
    { key: "chapter", label: "Chapter", options: chapters.map((c) => ({ value: c.id, label: c.title })) },
    { key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }] },
    { key: "access", label: "Access", options: [{ value: "locked", label: "Locked" }, { value: "unlocked", label: "Unlocked" }] },
  ], [chapters]);

  const filtered = useMemo(() => {
    let r = [...allSessions];
    if (search) { const q = search.toLowerCase(); r = r.filter((s) => s.title.toLowerCase().includes(q) || s.publicCode.includes(q)); }
    if (filters.chapter) r = r.filter((s) => s.chapterId === filters.chapter);
    if (filters.status) r = r.filter((s) => s.status === filters.status);
    if (filters.access) r = r.filter((s) => s.accessStatus === filters.access);
    return r;
  }, [allSessions, search, filters]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * 10, page * 10);
  const chapterMap = useMemo(() => new Map(chapters.map((c) => [c.id, c.title])), [chapters]);

  const sessionStatsMap = useMemo(() => {
    const map = new Map<string, SessionStats>();
    for (const s of paginated) {
      map.set(s.id, {
        materialsCount: allMaterials.filter((m) => m.sessionId === s.id || m.linkedSessionIds?.includes(s.id)).length,
        questionsCount: allQuestions.filter((q) => q.sessionId === s.id || q.sessionIds?.includes(s.id)).length,
        quizzesCount: allQuizzes.filter((q) => q.sessionIds?.includes(s.id)).length,
        examsCount: allExams.filter((e) => e.sessionIds?.includes(s.id)).length,
        homeworkCount: allHomework.filter((h) => h.sessionIds?.includes(s.id)).length,
      });
    }
    return map;
  }, [paginated, allMaterials, allQuestions, allQuizzes, allExams, allHomework]);

  const handleCreate = () => {
    if (!title.trim() || !chapterId) return;
    const ses = createSession({ courseId, chapterId, title: title.trim(), description: "", price: Number(price), currency: "USD" });
    if (sesConceptIds.length > 0) updateSession(ses.id, { conceptIds: sesConceptIds });
    setTitle(""); setPrice("0"); setSesConceptIds([]); setShowCreate(false);
  };

  const handleDuplicate = (s: typeof allSessions[0]) => {
    createSession({ courseId, chapterId: s.chapterId, title: `${s.title} (Copy)`, description: s.description, price: s.price, currency: s.currency, sessionType: s.sessionType, isFreePreview: s.isFreePreview });
  };

  const published = allSessions.filter((s) => s.status === "published").length;
  const draft = allSessions.filter((s) => s.status === "draft").length;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: allSessions.length, icon: Layers, cls: "text-blue-500", bg: "from-blue-500/10 to-blue-600/5" },
          { label: "Published", value: published, icon: Eye, cls: "text-emerald-500", bg: "from-emerald-500/10 to-emerald-600/5" },
          { label: "Drafts", value: draft, icon: Clock, cls: "text-amber-500", bg: "from-amber-500/10 to-amber-600/5" },
          { label: "Revenue", value: `$${allSessions.reduce((a, s) => a + s.price, 0)}`, icon: DollarSign, cls: "text-primary", bg: "from-primary/10 to-primary/5" },
        ].map((s) => (
          <Card key={s.label} className={cn("flex items-center gap-3 border bg-gradient-to-br p-3", s.bg)}>
            <s.icon className={cn("h-5 w-5 shrink-0", s.cls)} />
            <div><p className="text-lg font-bold">{s.value}</p><p className="text-[11px] text-muted-foreground">{s.label}</p></div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} filters={filterOptions} activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }} onClearFilters={() => { setFilters({}); setPage(1); }} totalResults={total} placeholder="Search sessions..." />
        <Button onClick={() => setShowCreate(true)} className="rounded-xl gradient-brand border-0 text-white ms-3 shrink-0" size="sm"><Plus className="me-1.5 h-4 w-4" />New Session</Button>
      </div>

      {showCreate && (
        <Card className="border-2 border-primary/20 bg-primary/5 p-5 space-y-3">
          <h3 className="font-semibold">Create Session</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1"><Label className="text-xs">Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Session title" className="rounded-xl" /></div>
            <div className="space-y-1"><Label className="text-xs">Chapter *</Label>
              <select value={chapterId} onChange={(e) => setChapterId(e.target.value)} className="w-full h-10 rounded-xl border bg-background px-3 text-sm">
                {chapters.length === 0 && <option value="">No chapters</option>}
                {chapters.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Price (USD)</Label><Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl" /></div>
          </div>
          {treeConcepts.length > 0 && (
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Session Coverage (Concepts)</Label>
              <div className="flex flex-wrap gap-1.5">
                {treeConcepts.map((c) => (
                  <button key={c.id} onClick={() => setSesConceptIds((prev) => prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id])}
                    className={cn("rounded-lg border px-2.5 py-1 text-xs transition-colors", sesConceptIds.includes(c.id) ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>
                    {c.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={!title.trim() || !chapterId} className="rounded-xl gradient-brand border-0 text-white" size="sm">Create</Button>
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {total === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <PlayCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{allSessions.length === 0 ? "No sessions yet" : "No sessions match"}</h2>
          <p className="text-sm text-muted-foreground">{chapters.length === 0 ? "Create chapters first." : "Add sessions to start."}</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {paginated.map((session) => (
            <PremiumSessionCard key={session.id} session={session} courseId={courseId} chapterName={chapterMap.get(session.chapterId)}
              stats={sessionStatsMap.get(session.id) || { materialsCount: 0, questionsCount: 0, quizzesCount: 0, examsCount: 0, homeworkCount: 0 }}
              onPublish={() => publishSession(session.id)} onArchive={() => archiveSession(session.id)}
              onDuplicate={() => handleDuplicate(session)} onDelete={() => deleteSession(session.id)}
              onToggleLock={() => session.accessStatus === "locked" ? unlockSession(session.id) : lockSession(session.id)} />
          ))}
        </div>
      )}
      <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. MATERIALS TAB
   ═══════════════════════════════════════════════════════════════ */

const MAT_TYPE_META: Record<MaterialType, { icon: typeof Video; label: string; color: string }> = {
  video: { icon: Video, label: "Video", color: "text-blue-500 bg-blue-500/10" },
  pdf: { icon: FileText, label: "PDF", color: "text-rose-500 bg-rose-500/10" },
  image: { icon: Image, label: "Image", color: "text-emerald-500 bg-emerald-500/10" },
  attachment: { icon: File, label: "Attachment", color: "text-amber-500 bg-amber-500/10" },
  notes: { icon: StickyNote, label: "Notes", color: "text-violet-500 bg-violet-500/10" },
};

const MAT_FILTER_OPTIONS: FilterOption[] = [
  { key: "type", label: "Type", options: [{ value: "video", label: "Video" }, { value: "pdf", label: "PDF" }, { value: "image", label: "Image" }, { value: "attachment", label: "Attachment" }, { value: "notes", label: "Notes" }] },
  { key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }] },
];

function MaterialsTab({ courseId }: { courseId: string }) {
  const allMaterials = useTeacherMaterialStore((s) => s.materials);
  const createMaterial = useTeacherMaterialStore((s) => s.createMaterial);
  const deleteMaterial = useTeacherMaterialStore((s) => s.deleteMaterial);
  const publishMaterial = useTeacherMaterialStore((s) => s.publishMaterial);
  const unpublishMaterial = useTeacherMaterialStore((s) => s.unpublishMaterial);
  const allTreeNodes = useContentTreeStore((s) => s.nodes);
  const treeNodes = useMemo(() => allTreeNodes.filter((n) => n.courseId === courseId), [allTreeNodes, courseId]);
  const materials = useMemo(() => allMaterials.filter((m) => m.courseId === courseId || !m.courseId), [allMaterials, courseId]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState<MaterialType>("video");
  const [sourceMode, setSourceMode] = useState<"upload" | "url">("url");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadDuration, setUploadDuration] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [customThumb, setCustomThumb] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [acLinks, setAcLinks] = useState<AcademicLink[]>([]);

  const treeChapters = useMemo(() => treeNodes.filter((n) => n.type === "chapter"), [treeNodes]);
  const getLessons = (chId: string) => treeNodes.filter((n) => n.type === "lesson" && n.parentId === chId);
  const getConcepts = (lId: string) => treeNodes.filter((n) => n.type === "concept" && n.parentId === lId);
  const getAtomics = (cId: string) => treeNodes.filter((n) => n.type === "atomic_concept" && n.parentId === cId);

  const addAcLink = () => setAcLinks((prev) => [...prev, { id: `acl-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }]);
  const removeAcLink = (id: string) => setAcLinks((prev) => prev.filter((l) => l.id !== id));
  const updateAcLink = (id: string, patch: Partial<AcademicLink>) => setAcLinks((prev) => prev.map((l) => l.id === id ? { ...l, ...patch } : l));

  const filtered = useMemo(() => {
    let r = [...materials].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (search) { const q = search.toLowerCase(); r = r.filter((m) => m.title.toLowerCase().includes(q)); }
    if (filters.type) r = r.filter((m) => m.type === filters.type);
    if (filters.status) r = r.filter((m) => m.status === filters.status);
    return r;
  }, [materials, search, filters]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * 12, page * 12);
  const videoCount = materials.filter((m) => m.type === "video").length;
  const pdfCount = materials.filter((m) => m.type === "pdf").length;
  const usedCount = materials.filter((m) => (m.linkedSessionIds?.length || 0) > 0 || m.sessionId).length;

  const detectedProvider = useMemo(() => {
    if (!uploadUrl) return "external_url" as const;
    const u = uploadUrl.toLowerCase();
    if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube" as const;
    if (u.includes("vimeo.com")) return "vimeo" as const;
    if (u.includes("bunny.net") || u.includes("b-cdn.net")) return "bunny" as const;
    if (u.includes("cloudflare")) return "cloudflare" as const;
    if (u.includes("mux.com")) return "mux" as const;
    if (u.includes("s3.amazonaws.com") || u.includes(".s3.")) return "s3" as const;
    return "external_url" as const;
  }, [uploadUrl]);

  const handleUpload = () => {
    if (!uploadTitle.trim()) return;
    if (sourceMode === "url" && !uploadUrl.trim() && uploadType !== "notes") return;
    const data: CreateMaterialData = {
      type: uploadType, title: uploadTitle.trim(), courseId,
      sourceMode,
      sourceProvider: sourceMode === "upload" ? "local_upload" : detectedProvider,
      studentDisplayTitle: uploadTitle.trim(),
      customThumbnailUrl: customThumb || undefined,
    };
    if (sourceMode === "url" && uploadUrl) data.originalUrl = uploadUrl;
    if (uploadType === "video") {
      data.videoUrl = uploadUrl || undefined;
      data.videoDuration = uploadDuration || undefined;
    } else if (uploadType === "notes") {
      data.notesContent = "";
    } else {
      data.fileUrl = uploadUrl || undefined;
      data.fileName = uploadFileName || `${uploadTitle.trim()}.${uploadType === "pdf" ? "pdf" : "zip"}`;
      data.fileSize = "2.4 MB";
    }
    if (sourceMode === "upload") {
      data.uploadFileName = uploadFileName || `${uploadTitle.trim()}.${uploadType}`;
      data.uploadStatus = "ready";
      data.processingStatus = "ready";
    }
    if (acLinks.length > 0) {
      data.academicLinks = acLinks.filter((l) => l.chapterId || l.conceptId);
    }
    createMaterial(data);
    setUploadTitle(""); setUploadUrl(""); setUploadDuration(""); setUploadFileName(""); setCustomThumb("");
    setAcLinks([]); setShowUpload(false);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="flex items-center gap-2 border bg-card p-3"><Film className="h-4 w-4 text-primary shrink-0" /><div><p className="text-lg font-bold">{materials.length}</p><p className="text-xs text-muted-foreground">Total</p></div></Card>
        <Card className="flex items-center gap-2 border bg-card p-3"><Video className="h-4 w-4 text-blue-500 shrink-0" /><div><p className="text-lg font-bold">{videoCount}</p><p className="text-xs text-muted-foreground">Videos</p></div></Card>
        <Card className="flex items-center gap-2 border bg-card p-3"><FileText className="h-4 w-4 text-rose-500 shrink-0" /><div><p className="text-lg font-bold">{pdfCount}</p><p className="text-xs text-muted-foreground">PDFs</p></div></Card>
        <Card className="flex items-center gap-2 border bg-card p-3"><StickyNote className="h-4 w-4 text-violet-500 shrink-0" /><div><p className="text-lg font-bold">{materials.filter((m) => m.type !== "video" && m.type !== "pdf").length}</p><p className="text-xs text-muted-foreground">Others</p></div></Card>
        <Card className="flex items-center gap-2 border bg-card p-3"><Link2 className="h-4 w-4 text-emerald-500 shrink-0" /><div><p className="text-lg font-bold">{usedCount}</p><p className="text-xs text-muted-foreground">In Sessions</p></div></Card>
        <Card className="flex items-center gap-2 border bg-card p-3"><BookOpen className="h-4 w-4 text-amber-500 shrink-0" /><div><p className="text-lg font-bold">{materials.length - usedCount}</p><p className="text-xs text-muted-foreground">Unused</p></div></Card>
      </div>

      <div className="flex items-center justify-between">
        <Button onClick={() => setShowUpload(true)} className="rounded-xl gradient-brand border-0 text-white" size="sm"><Plus className="me-1.5 h-4 w-4" /> Upload Material</Button>
        <div className="flex gap-1">
          <Button variant={viewMode === "cards" ? "default" : "outline"} size="sm" className="rounded-lg h-8 text-xs" onClick={() => setViewMode("cards")}>Cards</Button>
          <Button variant={viewMode === "table" ? "default" : "outline"} size="sm" className="rounded-lg h-8 text-xs" onClick={() => setViewMode("table")}>Table</Button>
        </div>
      </div>

      {showUpload && (
        <Card className="border bg-card p-5 space-y-5">
          <h3 className="font-semibold">Add Material</h3>

          {/* Step 1: Material Type */}
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Material Type</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(MAT_TYPE_META) as MaterialType[]).map((t) => { const m = MAT_TYPE_META[t]; return (
                <button key={t} onClick={() => setUploadType(t)} className={cn("flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors", uploadType === t ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>
                  <m.icon className="h-4 w-4" /> {m.label}
                </button>
              ); })}
            </div>
          </div>

          {/* Step 2: Source Mode (not for notes) */}
          {uploadType !== "notes" && (
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Material Source</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={() => setSourceMode("upload")} className={cn("flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors", sourceMode === "upload" ? "border-primary bg-primary/5" : "border-dashed hover:border-primary/30")}>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium">Upload from device</span>
                  <span className="text-[11px] text-muted-foreground text-center">Browse or drag & drop a file</span>
                </button>
                <button onClick={() => setSourceMode("url")} className={cn("flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors", sourceMode === "url" ? "border-primary bg-primary/5" : "border-dashed hover:border-primary/30")}>
                  <Link2 className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium">Paste URL</span>
                  <span className="text-[11px] text-muted-foreground text-center">YouTube, Vimeo, or any link</span>
                </button>
              </div>
            </div>
          )}

          {/* Source: Upload */}
          {sourceMode === "upload" && uploadType !== "notes" && (
            <div className="rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:border-primary/30">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">Drag & drop or browse</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {uploadType === "video" ? "MP4, MOV, WEBM — Max 2 GB" : uploadType === "pdf" ? "PDF — Max 100 MB" : uploadType === "image" ? "JPG, PNG, WEBP — Max 20 MB" : "Any file — Max 500 MB"}
              </p>
              <Button variant="outline" size="sm" className="rounded-lg text-xs mt-3 gap-1.5">
                <Upload className="h-3 w-3" />Browse Files
              </Button>
              {uploadFileName && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-muted-foreground">{uploadFileName}</span>
                  <button onClick={() => setUploadFileName("")} className="text-destructive"><X className="h-3 w-3" /></button>
                </div>
              )}
              <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full w-0 rounded-full bg-primary transition-all" />
              </div>
            </div>
          )}

          {/* Source: URL */}
          {sourceMode === "url" && uploadType !== "notes" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">URL *</Label>
                <Input value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} placeholder={uploadType === "video" ? "https://youtube.com/watch?v=... or any video URL" : "https://..."} className="rounded-xl" />
              </div>
              {uploadUrl && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className={cn("h-2 w-2 rounded-full", detectedProvider === "youtube" ? "bg-red-500" : detectedProvider === "vimeo" ? "bg-blue-500" : detectedProvider === "bunny" ? "bg-amber-500" : "bg-slate-400")} />
                  <span>Provider: <span className="font-medium capitalize">{detectedProvider.replace("_", " ")}</span></span>
                  <span className="opacity-40">|</span>
                  <span>Auto-fetch title & thumbnail on save</span>
                </div>
              )}
              {uploadType === "video" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Duration</Label>
                  <Input value={uploadDuration} onChange={(e) => setUploadDuration(e.target.value)} placeholder="45:00" className="rounded-xl w-32" />
                </div>
              )}
            </div>
          )}

          {/* Display Name */}
          <div className="border-t pt-4 space-y-3">
            <Label className="text-xs font-semibold block">Display Name (shown to students)</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Title *</Label>
                <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="e.g. Introduction to Limits" className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Custom Thumbnail URL</Label>
                <Input value={customThumb} onChange={(e) => setCustomThumb(e.target.value)} placeholder="https://... (optional)" className="rounded-xl" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">Students see the title and thumbnail only — never the raw URL or file path.</p>
          </div>

          {/* Academic Linking — multi-row */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold block">Academic Linking</Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {uploadType === "video"
                    ? "Link parts of this video to the curriculum. Add time ranges for long videos."
                    : "Link this material to one or more parts of the course structure."}
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg text-xs h-7 gap-1 shrink-0" onClick={addAcLink}>
                <Plus className="h-3 w-3" />Add Link
              </Button>
            </div>

            {acLinks.length === 0 ? (
              <button onClick={addAcLink} className="w-full rounded-xl border-2 border-dashed p-4 text-center text-xs text-muted-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors">
                No academic links yet. Click to add one.
              </button>
            ) : (
              <div className="space-y-2">
                {acLinks.map((link, idx) => {
                  const lessons = link.chapterId ? getLessons(link.chapterId) : [];
                  const concepts = link.lessonId ? getConcepts(link.lessonId) : [];
                  const atomics = link.conceptId ? getAtomics(link.conceptId) : [];
                  return (
                    <div key={link.id} className="rounded-xl border bg-muted/30 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-muted-foreground">Link {idx + 1}</span>
                        <button onClick={() => removeAcLink(link.id)} className="text-muted-foreground hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
                      </div>
                      {/* Time range — video only */}
                      {uploadType === "video" && (
                        <div className="flex items-center gap-2">
                          <div className="space-y-0.5">
                            <Label className="text-[10px] text-muted-foreground">From</Label>
                            <Input value={link.fromTime || ""} onChange={(e) => updateAcLink(link.id, { fromTime: e.target.value })} placeholder="00:00" className="h-8 rounded-lg text-xs font-mono w-20" />
                          </div>
                          <span className="text-muted-foreground mt-4">—</span>
                          <div className="space-y-0.5">
                            <Label className="text-[10px] text-muted-foreground">To</Label>
                            <Input value={link.toTime || ""} onChange={(e) => updateAcLink(link.id, { toTime: e.target.value })} placeholder="08:30" className="h-8 rounded-lg text-xs font-mono w-20" />
                          </div>
                          {!link.fromTime && !link.toTime && <span className="text-[10px] text-muted-foreground mt-4">Leave blank to link entire video</span>}
                        </div>
                      )}
                      {/* Curriculum dropdowns */}
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <select value={link.chapterId || ""} onChange={(e) => updateAcLink(link.id, { chapterId: e.target.value || undefined, lessonId: undefined, conceptId: undefined, atomicConceptId: undefined })} className="h-8 rounded-lg border bg-background px-2 text-xs">
                          <option value="">Chapter...</option>
                          {treeChapters.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}
                        </select>
                        <select value={link.lessonId || ""} onChange={(e) => updateAcLink(link.id, { lessonId: e.target.value || undefined, conceptId: undefined, atomicConceptId: undefined })} disabled={!link.chapterId} className="h-8 rounded-lg border bg-background px-2 text-xs disabled:opacity-50">
                          <option value="">Lesson...</option>
                          {lessons.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}
                        </select>
                        <select value={link.conceptId || ""} onChange={(e) => updateAcLink(link.id, { conceptId: e.target.value || undefined, atomicConceptId: undefined })} disabled={!link.lessonId} className="h-8 rounded-lg border bg-background px-2 text-xs disabled:opacity-50">
                          <option value="">Concept...</option>
                          {concepts.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}
                        </select>
                        <select value={link.atomicConceptId || ""} onChange={(e) => updateAcLink(link.id, { atomicConceptId: e.target.value || undefined })} disabled={!link.conceptId} className="h-8 rounded-lg border bg-background px-2 text-xs disabled:opacity-50">
                          <option value="">Atomic...</option>
                          {atomics.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t pt-4">
            <Button onClick={handleUpload} disabled={!uploadTitle.trim() || (sourceMode === "url" && !uploadUrl.trim() && uploadType !== "notes")} className="rounded-xl gradient-brand border-0 text-white" size="sm">
              <Upload className="me-1.5 h-4 w-4" />{sourceMode === "upload" ? "Upload & Save" : "Save Material"}
            </Button>
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowUpload(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} filters={MAT_FILTER_OPTIONS} activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }} onClearFilters={() => { setFilters({}); setPage(1); }} totalResults={total} placeholder="Search materials..." />

      {total === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <Film className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{materials.length === 0 ? "No materials yet" : "No materials match"}</h2>
          <p className="text-sm text-muted-foreground">Upload videos, PDFs, worksheets and notes.</p>
          {materials.length === 0 && <Button onClick={() => setShowUpload(true)} className="rounded-xl gradient-brand border-0 text-white"><Plus className="me-1.5 h-4 w-4" /> Upload First Material</Button>}
        </Card>
      ) : (
        <div className={cn(viewMode === "cards" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-2")}>
          {paginated.map((mat) => viewMode === "cards"
            ? <MatCard key={mat.id} mat={mat} treeNodes={treeNodes} onPublish={() => publishMaterial(mat.id)} onUnpublish={() => unpublishMaterial(mat.id)} onDelete={() => deleteMaterial(mat.id)} />
            : <MatRow key={mat.id} mat={mat} onPublish={() => publishMaterial(mat.id)} onUnpublish={() => unpublishMaterial(mat.id)} onDelete={() => deleteMaterial(mat.id)} />
          )}
        </div>
      )}
      <Pagination page={page} pageSize={12} total={total} onPageChange={setPage} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. QUESTIONS TAB
   ═══════════════════════════════════════════════════════════════ */

function QuestionsTab({ courseId }: { courseId: string }) {
  const allQuestions = useTeacherQuestionStore((s) => s.questions);
  const deleteQuestion = useTeacherQuestionStore((s) => s.deleteQuestion);
  const publishQuestion = useTeacherQuestionStore((s) => s.publishQuestion);
  const duplicateQuestion = useTeacherQuestionStore((s) => s.duplicateQuestion);
  const courses = useTeacherCourseStore((s) => s.courses);
  const allTreeNodes = useContentTreeStore((s) => s.nodes);
  const questions = useMemo(() => allQuestions.filter((q) => q.courseId === courseId), [allQuestions, courseId]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c.title])), [courses]);
  const treeChapters = useMemo(() => { const m = new Map<string, string>(); for (const n of allTreeNodes) if (n.type === "chapter") m.set(n.id, n.title); return m; }, [allTreeNodes]);
  const treeLessons = useMemo(() => { const m = new Map<string, string>(); for (const n of allTreeNodes) if (n.type === "lesson") m.set(n.id, n.title); return m; }, [allTreeNodes]);
  const treeConcepts = useMemo(() => { const m = new Map<string, string>(); for (const n of allTreeNodes) if (n.type === "concept") m.set(n.id, n.title); return m; }, [allTreeNodes]);
  const treeAtomics = useMemo(() => { const m = new Map<string, string>(); for (const n of allTreeNodes) if (n.type === "atomic_concept") m.set(n.id, n.title); return m; }, [allTreeNodes]);

  const csQFilterOptions = useMemo<FilterOption[]>(() => [
    { key: "type", label: "Type", options: QS_ALL_TYPE_OPTIONS },
    { key: "category", label: "Category", options: Object.keys(QS_CATEGORY_MAP).map((c) => ({ value: c, label: c })) },
    { key: "difficulty", label: "Difficulty", options: [{ value: "easy", label: "Easy" }, { value: "medium", label: "Medium" }, { value: "hard", label: "Hard" }, { value: "advanced", label: "Advanced" }] },
    { key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }] },
    { key: "usage", label: "Usage", options: [{ value: "used", label: "Used" }, { value: "unused", label: "Unused" }] },
  ], []);

  const filtered = useMemo(() => {
    let r = [...questions];
    if (search) { const q = search.toLowerCase(); r = r.filter((qn) => qn.text.toLowerCase().includes(q) || qn.publicCode.includes(q) || (qn.concept || "").toLowerCase().includes(q)); }
    if (filters.type) r = r.filter((q) => q.type === filters.type);
    if (filters.category) { const types = QS_CATEGORY_MAP[filters.category]; if (types) r = r.filter((q) => types.includes(q.type as any)); }
    if (filters.difficulty) r = r.filter((q) => q.difficulty === filters.difficulty);
    if (filters.status) r = r.filter((q) => q.status === filters.status);
    if (filters.usage === "used") r = r.filter((q) => ((q.quizIds || []).length + (q.examIds || []).length + (q.homeworkIds || []).length + (q.sessionIds || []).length) > 0);
    if (filters.usage === "unused") r = r.filter((q) => ((q.quizIds || []).length + (q.examIds || []).length + (q.homeworkIds || []).length + (q.sessionIds || []).length) === 0);
    return r;
  }, [questions, search, filters]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * 15, page * 15);
  const published = questions.filter((q) => q.status === "published").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="rounded-full">{questions.length} total</Badge>
        <Badge variant="outline" className="rounded-full border-emerald-300 text-emerald-600">{published} published</Badge>
        <Badge variant="outline" className="rounded-full border-amber-300 text-amber-600">{questions.length - published} drafts</Badge>
        <Button asChild className="rounded-xl gradient-brand border-0 text-white ms-auto" size="sm">
          <Link to="/teacher/questions/create"><Plus className="me-1.5 h-4 w-4" /> Create Question</Link>
        </Button>
      </div>
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} filters={csQFilterOptions} activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }} onClearFilters={() => { setFilters({}); setPage(1); }} totalResults={total} placeholder="Search by text, concept, or code..." />
      {total === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{questions.length === 0 ? "No questions for this course" : "No match"}</h2>
          <Button asChild className="rounded-xl gradient-brand border-0 text-white"><Link to="/teacher/questions/create"><Plus className="me-1.5 h-4 w-4" />Create Question</Link></Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {paginated.map((q) => {
            const isOpen = expandedId === q.id;
            return (
              <Card key={q.id} className={cn("border bg-card overflow-hidden transition-colors", isOpen && "border-primary/20")}>
                <div className="flex items-start gap-3 px-5 py-4">
                  <Badge variant="outline" className={cn("mt-0.5 rounded-full text-xs shrink-0", QS_TYPE_COLORS[q.type])}>{QS_TYPE_LABELS[q.type] || q.type}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium line-clamp-2">{q.text}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className={cn("font-medium", QS_DIFF_COLORS[q.difficulty])}>{q.difficulty}</span>
                      {q.concept && <span>· {q.concept}</span>}
                      <span>· {q.publicCode}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="outline" className={cn("rounded-full text-xs", q.status === "published" ? "border-emerald-300 text-emerald-600" : q.status === "archived" ? "border-slate-300 text-slate-500" : "border-amber-300 text-amber-600")}>{q.status}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title={isOpen ? "Collapse" : "Preview"} onClick={() => setExpandedId(isOpen ? null : q.id)}>
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="Edit"><Link to="/teacher/questions/$questionId/edit" params={{ questionId: q.id }}><Edit3 className="h-3.5 w-3.5" /></Link></Button>
                    {q.status === "draft" && <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => publishQuestion(q.id)}><Upload className="h-3.5 w-3.5 text-emerald-600" /></Button>}
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => duplicateQuestion(q.id)}><Copy className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => deleteQuestion(q.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {/* Expanded preview */}
                <div className={cn("grid transition-all duration-300 ease-in-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <div className="border-t px-5 py-4 space-y-5">
                      <CSQuestionPreview q={q} courseName={courseMap.get(q.courseId)} chapterMap={treeChapters} lessonMap={treeLessons} conceptMap={treeConcepts} atomicMap={treeAtomics} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Pagination page={page} pageSize={15} total={total} onPageChange={setPage} />
    </div>
  );
}

/* ═══════════════════ Content Studio Question Preview ═══════════════════ */

function CSField({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  const display = value === undefined || value === null || value === "" ? null : String(value);
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <span className={cn("font-medium", mono && "font-mono", !display && "text-muted-foreground italic")}>{display || "—"}</span>
    </div>
  );
}

function CSSectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{children}</h4>;
}

function CSQuestionPreview({ q, courseName, chapterMap, lessonMap, conceptMap, atomicMap }: {
  q: TeacherQuestion; courseName?: string;
  chapterMap: Map<string, string>; lessonMap: Map<string, string>;
  conceptMap: Map<string, string>; atomicMap: Map<string, string>;
}) {
  const ad = q.answerData;
  const qzCount = (q.quizIds || []).length;
  const exCount = (q.examIds || []).length;
  const hwCount = (q.homeworkIds || []).length;
  const sesCount = (q.sessionIds || []).length;
  const totalUse = qzCount + exCount + hwCount + sesCount;

  const chapterNames = (q.chapterIds || []).map((id) => chapterMap.get(id)).filter(Boolean) as string[];
  if (!chapterNames.length && q.chapterId && chapterMap.has(q.chapterId)) chapterNames.push(chapterMap.get(q.chapterId)!);
  const lessonNames = (q.lessonIds || []).map((id) => lessonMap.get(id)).filter(Boolean) as string[];
  const conceptNames = (q.conceptIds || []).map((id) => conceptMap.get(id)).filter(Boolean) as string[];
  const atomicNames = (q.atomicConceptIds || []).map((id) => atomicMap.get(id)).filter(Boolean) as string[];
  const hasClassification = !!(courseName || q.concept || chapterNames.length || lessonNames.length || conceptNames.length || atomicNames.length);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-5">
        <div>
          <CSSectionTitle>Question</CSSectionTitle>
          {q.title && <p className="text-xs font-semibold mb-1">{q.title}</p>}
          <p className="text-sm whitespace-pre-wrap">{q.text}</p>
          {q.instructions && <p className="text-xs text-muted-foreground italic mt-1.5">{q.instructions}</p>}
          {q.questionImages && q.questionImages.length > 0 && <p className="text-[11px] text-muted-foreground mt-1">{q.questionImages.length} image(s) attached</p>}
        </div>
        <div>
          <CSSectionTitle>Answer</CSSectionTitle>
          <CSAnswerPreview q={q} ad={ad} />
        </div>
        <div>
          <CSSectionTitle>Solution</CSSectionTitle>
          <div className="space-y-1.5">
            {q.hint ? <div className="rounded-lg border bg-amber-500/5 px-3 py-2 text-xs"><span className="font-medium text-amber-600">Hint:</span> {q.hint}</div> : null}
            {q.explanation ? <div className="rounded-lg border px-3 py-2 text-xs"><span className="font-medium">Explanation:</span> {q.explanation}</div> : null}
            {q.solution ? <div className="rounded-lg border px-3 py-2 text-xs"><span className="font-medium">Solution:</span> {q.solution}</div> : null}
            {(q.commonMistakes || []).length > 0 && <div className="rounded-lg border bg-rose-500/5 px-3 py-2 text-xs"><span className="font-medium text-rose-600">Common mistakes:</span> {q.commonMistakes!.join("; ")}</div>}
            {q.teacherNotes ? <div className="rounded-lg border bg-violet-500/5 px-3 py-2 text-xs"><span className="font-medium text-violet-600">Teacher notes:</span> {q.teacherNotes}</div> : null}
            {!q.hint && !q.explanation && !q.solution && <p className="text-xs text-muted-foreground italic">No solution added yet</p>}
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div>
          <CSSectionTitle>Classification</CSSectionTitle>
          {hasClassification ? (
            <div className="space-y-1">
              {courseName && <CSField label="Course" value={courseName} />}
              {chapterNames.length > 0 && <CSField label="Chapter(s)" value={chapterNames.join(", ")} />}
              {lessonNames.length > 0 && <CSField label="Lesson(s)" value={lessonNames.join(", ")} />}
              {(conceptNames.length > 0 || q.concept) && <CSField label="Concept(s)" value={conceptNames.length > 0 ? conceptNames.join(", ") : q.concept} />}
              {(atomicNames.length > 0 || q.atomicConcept) && <CSField label="Atomic(s)" value={atomicNames.length > 0 ? atomicNames.join(", ") : q.atomicConcept} />}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Not classified</p>
          )}
        </div>
        <div>
          <CSSectionTitle>Metadata</CSSectionTitle>
          <div className="space-y-1">
            <CSField label="Code" value={q.publicCode} mono />
            <CSField label="Type" value={q.type.replace(/_/g, " ")} />
            <CSField label="Difficulty" value={q.difficulty} />
            <CSField label="Status" value={q.status} />
            <CSField label="Est. time" value={q.estimatedTimeSeconds ? (q.estimatedTimeSeconds < 60 ? `${q.estimatedTimeSeconds}s` : `${Math.round(q.estimatedTimeSeconds / 60)} min`) : undefined} />
            <CSField label="Source" value={q.sourceLabel || q.source} />
            <CSField label="Points" value={q.points} />
            {q.tags && q.tags.length > 0 && (
              <div className="flex items-baseline gap-2 text-xs">
                <span className="text-muted-foreground w-24 shrink-0">Tags</span>
                <div className="flex flex-wrap gap-1">{q.tags.map((t) => <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{t}</span>)}</div>
              </div>
            )}
            {q.createdBy && <CSField label="Created by" value={q.createdBy} />}
            <CSField label="Created" value={new Date(q.createdAt).toLocaleString()} />
            {q.updatedBy && <CSField label="Updated by" value={q.updatedBy} />}
            {q.updatedAt !== q.createdAt && <CSField label="Updated" value={new Date(q.updatedAt).toLocaleString()} />}
          </div>
        </div>
        <div>
          <CSSectionTitle>Usage</CSSectionTitle>
          {totalUse > 0 || (q.useCount || 0) > 0 ? (
            <div className="space-y-1">
              {qzCount > 0 && <CSField label="Quizzes" value={qzCount} />}
              {exCount > 0 && <CSField label="Exams" value={exCount} />}
              {hwCount > 0 && <CSField label="Homework" value={hwCount} />}
              {sesCount > 0 && <CSField label="Sessions" value={sesCount} />}
              <CSField label="Total uses" value={q.useCount || totalUse} />
              {(q.wrongRate || 0) > 0 && <CSField label="Wrong rate" value={`${Math.round((q.wrongRate || 0) * 100)}%`} />}
              {(q.averageTimeSeconds || 0) > 0 && <CSField label="Avg. time" value={`${q.averageTimeSeconds}s`} />}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Not used yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CSAnswerPreview({ q, ad }: { q: TeacherQuestion; ad?: AnswerData }) {
  if ((q.type === "mcq" || q.type === "multi_select") && q.choices && q.choices.length > 0) {
    return (
      <div className="space-y-1">
        {q.choices.map((c, i) => (
          <div key={c.id} className={cn("flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs", c.isCorrect ? "border-emerald-300 bg-emerald-500/5" : "")}>
            {c.isCorrect && <Check className="h-3 w-3 text-emerald-600 shrink-0" />}
            <span>{String.fromCharCode(65 + i)}. {c.text}</span>
          </div>
        ))}
      </div>
    );
  }
  if (q.type === "true_false" && ad?.kind === "true_false") {
    return <div className="flex gap-2">{[true, false].map((v) => (<span key={String(v)} className={cn("rounded-lg border px-3 py-1.5 text-xs font-medium", ad.correctBoolean === v ? "border-emerald-300 bg-emerald-500/5 text-emerald-600" : "")}>{v ? "True" : "False"}</span>))}</div>;
  }
  if (q.type === "short_answer" && ad?.kind === "short_answer") {
    return <div className="text-xs"><span className="text-muted-foreground">Accepted:</span> {ad.acceptedAnswers.join(", ") || "—"}</div>;
  }
  if (q.type === "essay") {
    const model = ad?.kind === "essay" ? ad.modelAnswer : q.modelAnswer;
    return model ? <p className="text-xs border rounded-lg px-3 py-2 bg-muted/30 line-clamp-4">{model}</p> : <p className="text-xs text-muted-foreground italic">Manual grading required</p>;
  }
  if (q.type === "calculation") {
    const ans = ad?.kind === "calculation" ? ad.correctAnswer : q.correctAnswer;
    const unit = ad?.kind === "calculation" ? ad.unit : q.unit;
    const tol = ad?.kind === "calculation" ? ad.tolerance : q.tolerance;
    const steps = ad?.kind === "calculation" ? ad.solutionSteps : undefined;
    return (
      <div className="space-y-1 text-xs">
        <div><span className="text-muted-foreground">Answer:</span> <span className="font-mono font-semibold">{ans || "—"}</span>{unit ? ` ${unit}` : ""}{tol ? <span className="text-muted-foreground"> (±{tol})</span> : ""}</div>
        {ad?.kind === "calculation" && ad.formulaUsed && <div><span className="text-muted-foreground">Formula:</span> {ad.formulaUsed}</div>}
        {steps && steps.length > 0 && <div className="mt-1 space-y-0.5">{steps.map((s, i) => <p key={i} className="text-muted-foreground">{i + 1}. {s}</p>)}</div>}
      </div>
    );
  }
  if (q.type === "fill_blank" && ad?.kind === "fill_blank") {
    return (<div className="space-y-1 text-xs"><p className="font-medium">{ad.promptWithBlanks}</p>{ad.blanks.map((b, i) => <p key={b.id} className="text-muted-foreground">Blank {i + 1}: {b.acceptedAnswers.join(", ")}</p>)}</div>);
  }
  if (q.type === "matching" && ad?.kind === "matching") {
    return (<div className="space-y-1">{ad.correctPairs.map((p) => { const l = ad.leftItems.find((x) => x.id === p.leftId); const r = ad.rightItems.find((x) => x.id === p.rightId); return <div key={p.leftId} className="flex items-center gap-2 text-xs"><span className="font-medium">{l?.text}</span><span className="text-muted-foreground">→</span><span>{r?.text}</span></div>; })}</div>);
  }
  if (q.type === "ordering" && ad?.kind === "ordering") {
    return (<div className="space-y-0.5">{ad.correctOrder.map((id, i) => { const item = ad.items.find((x) => x.id === id); return <p key={id} className="text-xs">{i + 1}. {item?.text}</p>; })}</div>);
  }
  if (q.type === "classification" && ad?.kind === "classification") {
    return (<div className="space-y-1">{ad.categories.map((cat) => { const items = ad.items.filter((it) => ad.correctCategoryByItem[it.id] === cat.id); return <div key={cat.id} className="text-xs"><span className="font-medium">{cat.text}:</span> {items.map((i) => i.text).join(", ") || "—"}</div>; })}</div>);
  }
  if (q.type === "coding" && ad?.kind === "coding") {
    return (<div className="space-y-1 text-xs"><div><span className="text-muted-foreground">Language:</span> {ad.language}</div>{ad.starterCode && <pre className="rounded-lg border bg-slate-900 text-emerald-400 p-2 text-[10px] font-mono overflow-x-auto max-h-24">{ad.starterCode}</pre>}<div><span className="text-muted-foreground">Test cases:</span> {ad.testCases.length}</div></div>);
  }
  if (q.type === "flashcard" && ad?.kind === "flashcard") {
    return (<div className="rounded-lg border p-3 text-xs space-y-1"><div><span className="font-medium">Front:</span> {ad.front}</div><div><span className="font-medium">Back:</span> {ad.back}</div>{ad.hint && <div className="text-muted-foreground">Hint: {ad.hint}</div>}</div>);
  }
  if (q.type === "drag_drop" && ad?.kind === "drag_drop") {
    return (<div className="text-xs"><span className="text-muted-foreground">{ad.draggableItems.length} items → {ad.dropZones.length} zones</span></div>);
  }
  if (q.type === "equation_builder" && ad?.kind === "equation_builder") {
    return <p className="text-xs font-mono">{ad.expectedEquation}</p>;
  }
  if (q.type === "chemical_structure" && ad?.kind === "chemical_structure") {
    return <p className="text-xs"><span className="text-muted-foreground">Structure ({ad.representation}):</span> <span className="font-mono">{ad.expectedStructure}</span></p>;
  }
  if (q.type === "table_completion" && ad?.kind === "table_completion") {
    return <p className="text-xs text-muted-foreground">{ad.columns.length} columns × {ad.rows.length} rows, {ad.blankCells.length} blanks</p>;
  }
  if (q.type === "file_upload" && ad?.kind === "file_upload") {
    return <p className="text-xs text-muted-foreground">Upload: {ad.allowedFileTypes.join(", ")} — max {ad.maxFileSizeMB || "?"}MB</p>;
  }
  if (q.type === "passage" && ad?.kind === "passage") {
    return <p className="text-xs line-clamp-3">{ad.passageText || "No passage text"}</p>;
  }
  if (q.type === "case_study" && ad?.kind === "case_study") {
    return <p className="text-xs line-clamp-3">{ad.caseText || "No case text"}</p>;
  }
  if (ad) return <p className="text-xs text-muted-foreground">Type: {ad.kind} — answer configured</p>;
  return <p className="text-xs text-muted-foreground italic">No answer data</p>;
}

/* ═══════════════════════════════════════════════════════════════
   ASSESSMENT ENGINE TAB (unified)
   ═══════════════════════════════════════════════════════════════ */

function AssessmentEngineTab({ courseId }: { courseId: string }) {
  return <AssessmentEngineWorkspaceTab courseId={courseId} />;
}

const QUIZ_TYPE_LABELS: Record<string, string> = { practice: "Practice", session_quiz: "Session Quiz", revision: "Revision", homework_quiz: "Homework", checkpoint: "Checkpoint", exam_prep: "Exam Prep", standalone: "Standalone" };

const QUIZ_FILTER_OPTIONS: FilterOption[] = [
  { key: "type", label: "Type", options: Object.entries(QUIZ_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })) },
  { key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }] },
];

function QuizzesTab({ courseId }: { courseId: string }) {
  const allQuizzes = useTeacherQuizStore((s) => s.quizzes);
  const deleteQuiz = useTeacherQuizStore((s) => s.deleteQuiz);
  const publishQuiz = useTeacherQuizStore((s) => s.publishQuiz);
  const duplicateQuiz = useTeacherQuizStore((s) => s.duplicateQuiz);
  const quizzes = useMemo(() => allQuizzes.filter((q) => q.courseId === courseId), [allQuizzes, courseId]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let r = [...quizzes];
    if (search) { const q = search.toLowerCase(); r = r.filter((qz) => qz.title.toLowerCase().includes(q) || qz.publicCode.includes(q)); }
    if (filters.type) r = r.filter((q) => q.quizType === filters.type);
    if (filters.status) r = r.filter((q) => q.status === filters.status);
    return r;
  }, [quizzes, search, filters]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * 10, page * 10);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="rounded-full">{quizzes.length} quizzes</Badge>
        <Button asChild className="rounded-xl gradient-brand border-0 text-white" size="sm"><Link to="/teacher/quizzes/create"><Plus className="me-1.5 h-4 w-4" />Create Quiz</Link></Button>
      </div>
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} filters={QUIZ_FILTER_OPTIONS} activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }} onClearFilters={() => { setFilters({}); setPage(1); }} totalResults={total} placeholder="Search quizzes..." />
      {total === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{quizzes.length === 0 ? "No quizzes for this course" : "No match"}</h2>
          <Button asChild className="rounded-xl gradient-brand border-0 text-white"><Link to="/teacher/quizzes/create"><Plus className="me-1.5 h-4 w-4" />Create Quiz</Link></Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {paginated.map((quiz) => (
            <Card key={quiz.id} className="flex items-center gap-4 border bg-card px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{quiz.title}</p>
                  <Badge variant="outline" className={cn("rounded-full text-xs", quiz.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{quiz.status}</Badge>
                  <Badge variant="outline" className="rounded-full text-xs">{QUIZ_TYPE_LABELS[quiz.quizType]}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{quiz.publicCode} · {quiz.questionIds.length} questions · {quiz.durationMinutes} min · +{quiz.xpReward} XP</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button asChild variant="outline" size="sm" className="rounded-lg text-xs h-8"><Link to="/teacher/quizzes/$quizId/edit" params={{ quizId: quiz.id }}>Edit</Link></Button>
                {quiz.status === "draft" && quiz.questionIds.length > 0 && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => publishQuiz(quiz.id)}><Upload className="h-3.5 w-3.5 text-emerald-600" /></Button>}
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => duplicateQuiz(quiz.id)}><Copy className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => deleteQuiz(quiz.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. HOMEWORK TAB
   ═══════════════════════════════════════════════════════════════ */

const HW_TYPE_LABELS: Record<string, string> = { worksheet: "Worksheet", essay: "Essay", file_upload: "File Upload", mixed: "Mixed" };

const HW_FILTER_OPTIONS: FilterOption[] = [
  { key: "type", label: "Type", options: Object.entries(HW_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })) },
  { key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }] },
];

function HomeworkTab({ courseId }: { courseId: string }) {
  const allItems = useTeacherHomeworkStore((s) => s.items);
  const deleteHomework = useTeacherHomeworkStore((s) => s.deleteHomework);
  const publishHomework = useTeacherHomeworkStore((s) => s.publishHomework);
  const items = useMemo(() => allItems.filter((h) => h.courseId === courseId), [allItems, courseId]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let r = [...items];
    if (search) { const q = search.toLowerCase(); r = r.filter((h) => h.title.toLowerCase().includes(q)); }
    if (filters.type) r = r.filter((h) => h.homeworkType === filters.type);
    if (filters.status) r = r.filter((h) => h.status === filters.status);
    return r;
  }, [items, search, filters]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * 10, page * 10);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="rounded-full">{items.length} homework</Badge>
        <Button asChild className="rounded-xl gradient-brand border-0 text-white" size="sm"><Link to="/teacher/homework/create"><Plus className="me-1.5 h-4 w-4" />Create Homework</Link></Button>
      </div>
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} filters={HW_FILTER_OPTIONS} activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }} onClearFilters={() => { setFilters({}); setPage(1); }} totalResults={total} placeholder="Search homework..." />
      {total === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <Pencil className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{items.length === 0 ? "No homework for this course" : "No match"}</h2>
          <Button asChild className="rounded-xl gradient-brand border-0 text-white"><Link to="/teacher/homework/create"><Plus className="me-1.5 h-4 w-4" />Create Homework</Link></Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {paginated.map((hw) => (
            <Card key={hw.id} className="flex items-center gap-4 border bg-card px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{hw.title}</p>
                  <Badge variant="outline" className={cn("rounded-full text-xs", hw.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{hw.status}</Badge>
                  <Badge variant="outline" className="rounded-full text-xs">{HW_TYPE_LABELS[hw.homeworkType]}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{hw.publicCode}{hw.dueDate ? ` · Due ${hw.dueDate}` : ""}{hw.xpReward ? ` · +${hw.xpReward} XP` : ""}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {hw.status === "draft" && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => publishHomework(hw.id)}><Upload className="h-3.5 w-3.5 text-emerald-600" /></Button>}
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => deleteHomework(hw.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. EXAMS TAB
   ═══════════════════════════════════════════════════════════════ */

const EXAM_TYPE_LABELS: Record<string, string> = { periodic: "Periodic", weekly: "Weekly", monthly: "Monthly", final: "Final", mock: "Mock", custom: "Custom" };

const EXAM_FILTER_OPTIONS: FilterOption[] = [
  { key: "type", label: "Type", options: Object.entries(EXAM_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })) },
  { key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }] },
];

function ExamsTab({ courseId }: { courseId: string }) {
  const allExams = useTeacherExamStore((s) => s.exams);
  const deleteExam = useTeacherExamStore((s) => s.deleteExam);
  const publishExam = useTeacherExamStore((s) => s.publishExam);
  const exams = useMemo(() => allExams.filter((e) => e.courseId === courseId), [allExams, courseId]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let r = [...exams];
    if (search) { const q = search.toLowerCase(); r = r.filter((e) => e.title.toLowerCase().includes(q) || e.publicCode.includes(q)); }
    if (filters.type) r = r.filter((e) => e.examType === filters.type);
    if (filters.status) r = r.filter((e) => e.status === filters.status);
    return r;
  }, [exams, search, filters]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * 10, page * 10);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="rounded-full">{exams.length} exams</Badge>
        <Button asChild className="rounded-xl gradient-brand border-0 text-white" size="sm"><Link to="/teacher/exams/create"><Plus className="me-1.5 h-4 w-4" />Create Exam</Link></Button>
      </div>
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} filters={EXAM_FILTER_OPTIONS} activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }} onClearFilters={() => { setFilters({}); setPage(1); }} totalResults={total} placeholder="Search exams..." />
      {total === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <ScrollText className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{exams.length === 0 ? "No exams for this course" : "No match"}</h2>
          <Button asChild className="rounded-xl gradient-brand border-0 text-white"><Link to="/teacher/exams/create"><Plus className="me-1.5 h-4 w-4" />Create Exam</Link></Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {paginated.map((exam) => (
            <Card key={exam.id} className="flex items-center gap-4 border bg-card px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{exam.title}</p>
                  <Badge variant="outline" className={cn("rounded-full text-xs", exam.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{exam.status}</Badge>
                  <Badge variant="outline" className="rounded-full text-xs">{EXAM_TYPE_LABELS[exam.examType]}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{exam.publicCode} · {exam.questionIds.length} Q · {exam.durationMinutes}m · +{exam.examXpReward} XP</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button asChild variant="outline" size="sm" className="rounded-lg text-xs h-8"><Link to="/teacher/exams/$examId/edit" params={{ examId: exam.id }}>Edit</Link></Button>
                {exam.status === "draft" && exam.questionIds.length > 0 && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => publishExam(exam.id)}><Upload className="h-3.5 w-3.5 text-emerald-600" /></Button>}
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => deleteExam(exam.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. ASSIGNMENTS TAB
   ═══════════════════════════════════════════════════════════════ */

const ASN_TYPE_LABELS: Record<string, string> = { project: "Project", research: "Research", presentation: "Presentation", custom: "Custom" };

function AssignmentsTab({ courseId }: { courseId: string }) {
  const allItems = useTeacherAssignmentStore((s) => s.items);
  const deleteAssignment = useTeacherAssignmentStore((s) => s.deleteAssignment);
  const publishAssignment = useTeacherAssignmentStore((s) => s.publishAssignment);
  const items = useMemo(() => allItems.filter((a) => a.courseId === courseId), [allItems, courseId]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((a) => a.title.toLowerCase().includes(q));
  }, [items, search]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * 10, page * 10);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="rounded-full">{items.length} assignments</Badge>
        <div className="relative max-w-xs flex-1 ms-4">
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search assignments..." className="h-9 rounded-xl text-sm" />
        </div>
      </div>

      {total === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{items.length === 0 ? "No assignments for this course" : "No match"}</h2>
          <p className="text-sm text-muted-foreground">Create projects, research tasks, and presentations.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {paginated.map((asn) => (
            <Card key={asn.id} className="flex items-center gap-4 border bg-card px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{asn.title}</p>
                  <Badge variant="outline" className={cn("rounded-full text-xs", asn.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{asn.status}</Badge>
                  <Badge variant="outline" className="rounded-full text-xs">{ASN_TYPE_LABELS[asn.assignmentType] || asn.assignmentType}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{asn.publicCode}{asn.dueDate ? ` · Due ${asn.dueDate}` : ""}{asn.xpReward ? ` · +${asn.xpReward} XP` : ""}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {asn.status === "draft" && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => publishAssignment(asn.id)}><Upload className="h-3.5 w-3.5 text-emerald-600" /></Button>}
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => deleteAssignment(asn.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED HELPERS
   ═══════════════════════════════════════════════════════════════ */

function TreeBranch({ node, nodes, depth, selectedId, onSelect }: { node: ContentTreeNode; nodes: ContentTreeNode[]; depth: number; selectedId: string | null; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(depth < 1);
  const children = nodes.filter((n) => n.parentId === node.id).sort((a, b) => a.order - b.order);
  const hasChildren = children.length > 0;
  const isSelected = selectedId === node.id;
  const typeColors: Record<string, string> = { chapter: "text-blue-500", lesson: "text-emerald-500", concept: "text-violet-500", atomic_concept: "text-amber-500" };

  return (
    <div>
      <button
        onClick={() => { onSelect(node.id); if (hasChildren) setOpen(!open); }}
        className={cn("flex items-center gap-1.5 w-full rounded-lg px-1.5 py-1.5 text-xs text-start transition-colors", isSelected ? "bg-primary/10 text-primary" : "hover:bg-accent/50")}
        style={{ paddingLeft: `${depth * 12 + 6}px` }}
      >
        {hasChildren ? (
          open ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
        ) : <span className="w-3 shrink-0" />}
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", typeColors[node.type] ? `bg-current ${typeColors[node.type]}` : "bg-muted-foreground")} />
        <span className="truncate flex-1">{node.title}</span>
        <CoverageBadge status={node.coverageStatus} />
      </button>
      {open && children.map((child) => (
        <TreeBranch key={child.id} node={child} nodes={nodes} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}

function CoverageBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    covered: "bg-emerald-500/10 text-emerald-600",
    partial: "bg-amber-500/10 text-amber-600",
    missing_material: "bg-rose-500/10 text-rose-600",
    not_started: "bg-slate-500/10 text-slate-500",
    needs_review: "bg-blue-500/10 text-blue-600",
    extra: "bg-violet-500/10 text-violet-600",
  };
  return (
    <span className={cn("rounded px-1 py-0.5 text-[9px] font-medium shrink-0", styles[status] || styles.not_started)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

const PROVIDER_LABELS: Record<string, { label: string; cls: string }> = {
  local_upload: { label: "Upload", cls: "bg-slate-500/10 text-slate-600" },
  youtube: { label: "YouTube", cls: "bg-red-500/10 text-red-600" },
  vimeo: { label: "Vimeo", cls: "bg-blue-500/10 text-blue-600" },
  bunny: { label: "Bunny", cls: "bg-amber-500/10 text-amber-700" },
  cloudflare: { label: "Cloudflare", cls: "bg-orange-500/10 text-orange-600" },
  mux: { label: "Mux", cls: "bg-pink-500/10 text-pink-600" },
  s3: { label: "S3", cls: "bg-amber-500/10 text-amber-600" },
  external_url: { label: "URL", cls: "bg-slate-500/10 text-slate-500" },
};

function MatCard({ mat, treeNodes, onPublish, onUnpublish, onDelete }: {
  mat: TeacherMaterial; treeNodes: ContentTreeNode[];
  onPublish: () => void; onUnpublish: () => void; onDelete: () => void;
}) {
  const meta = MAT_TYPE_META[mat.type]; const Icon = meta.icon;
  const sessionCount = (mat.linkedSessionIds?.length || 0) + (mat.sessionId ? 1 : 0);
  const links = mat.academicLinks || [];
  const linkCount = links.length;
  const firstLink = links[0];
  const nodeName = (id?: string) => id ? (treeNodes.find((n) => n.id === id)?.title || "") : "";
  const provider = mat.sourceProvider ? PROVIDER_LABELS[mat.sourceProvider] : null;
  const courseCount = new Set((mat.linkedChapterIds || []).concat(mat.linkedConceptIds || [])).size;
  const hasTimeframes = links.some((l) => l.fromTime || l.toTime);
  const timeLinks = hasTimeframes ? links.filter((l) => l.fromTime) : [];
  const displayTitle = mat.studentDisplayTitle && mat.studentDisplayTitle !== mat.title ? mat.studentDisplayTitle : null;
  const tags = mat.description ? mat.description.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <Card className="group border bg-card overflow-hidden transition-all hover:border-primary/20 hover:shadow-sm">
      {/* Visual header */}
      <div className={cn("relative h-16 flex items-center justify-center bg-gradient-to-br", mat.type === "video" ? "from-blue-500/15 to-cyan-500/15" : mat.type === "pdf" ? "from-rose-500/15 to-pink-500/15" : mat.type === "image" ? "from-emerald-500/15 to-teal-500/15" : "from-violet-500/15 to-blue-500/15")}>
        <Icon className={cn("h-7 w-7", meta.color.split(" ")[0])} />
        <div className="absolute top-2 start-2 flex gap-1">
          <Badge variant="outline" className={cn("rounded-full text-[9px] px-1.5 py-0 bg-background/80 backdrop-blur-sm", mat.status === "published" ? "border-emerald-300 text-emerald-600" : mat.status === "archived" ? "border-slate-300 text-slate-500" : "border-amber-300 text-amber-600")}>{mat.status}</Badge>
          {provider && <Badge className={cn("rounded-full text-[9px] px-1.5 py-0 border-0", provider.cls)}>{provider.label}</Badge>}
        </div>
      </div>

      <div className="p-3.5 space-y-2.5">
        {/* Title + code + type info */}
        <div>
          <p className="text-sm font-semibold truncate">{mat.title}</p>
          {displayTitle && <p className="text-[11px] text-muted-foreground truncate">Student sees: {displayTitle}</p>}
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {meta.label}{mat.videoDuration ? ` · ${mat.videoDuration}` : ""}{mat.fileSize ? ` · ${mat.fileSize}` : ""}
          </p>
        </div>

        {/* Academic linking summary */}
        {linkCount > 0 ? (
          <div className="rounded-lg border bg-muted/30 px-2.5 py-2 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Target className="h-3 w-3 text-primary shrink-0" />
              <span className="font-medium">{linkCount} academic link{linkCount !== 1 ? "s" : ""}</span>
            </div>
            {firstLink && (
              <p className="text-[10px] text-muted-foreground truncate">
                {[nodeName(firstLink.chapterId), nodeName(firstLink.lessonId), nodeName(firstLink.conceptId), nodeName(firstLink.atomicConceptId)].filter(Boolean).join(" > ") || "Linked"}
              </p>
            )}
            {linkCount > 1 && <p className="text-[10px] text-muted-foreground">+{linkCount - 1} more</p>}
            {timeLinks.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {timeLinks.slice(0, 3).map((l) => (
                  <span key={l.id} className="rounded bg-background px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground border">
                    {l.fromTime}–{l.toTime}
                  </span>
                ))}
                {timeLinks.length > 3 && <span className="text-[9px] text-muted-foreground">+{timeLinks.length - 3}</span>}
              </div>
            )}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground italic">No academic links</p>
        )}

        {/* Usage stats */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Link2 className="h-3 w-3" />{sessionCount > 0 ? `${sessionCount} sessions` : "Not used"}</span>
          {(mat.reuseCount || 0) > 0 && <span>{mat.reuseCount}x reused</span>}
          {courseCount > 0 && <span>{courseCount} nodes</span>}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-1">
            {tags.slice(0, 2).map((t) => <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">{t}</span>)}
            {tags.length > 2 && <span className="text-[9px] text-muted-foreground">+{tags.length - 2}</span>}
          </div>
        )}

        {/* Metadata */}
        <p className="text-[10px] text-muted-foreground">{new Date(mat.updatedAt).toLocaleDateString()}</p>

        {/* Actions */}
        <div className="flex items-center gap-1 pt-1.5 border-t">
          {mat.status === "draft"
            ? <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onPublish} title="Publish"><Eye className="h-3.5 w-3.5 text-emerald-600" /></Button>
            : <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onUnpublish} title="Unpublish"><EyeOff className="h-3.5 w-3.5 text-amber-600" /></Button>}
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={onDelete} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    </Card>
  );
}

function MatRow({ mat, onPublish, onUnpublish, onDelete }: { mat: TeacherMaterial; onPublish: () => void; onUnpublish: () => void; onDelete: () => void }) {
  const meta = MAT_TYPE_META[mat.type]; const Icon = meta.icon;
  return (
    <Card className="flex items-center gap-3 border bg-card px-4 py-3">
      <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", meta.color)}><Icon className="h-4 w-4" /></div>
      <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{mat.title}</p><p className="text-xs text-muted-foreground">{meta.label}{mat.videoDuration ? ` · ${mat.videoDuration}` : ""}</p></div>
      <Badge variant="outline" className={cn("rounded-full text-xs", mat.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>{mat.status}</Badge>
      <div className="flex gap-0.5 shrink-0">
        {mat.status === "draft"
          ? <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onPublish}><Eye className="h-3.5 w-3.5 text-emerald-600" /></Button>
          : <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onUnpublish}><EyeOff className="h-3.5 w-3.5 text-amber-600" /></Button>}
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    </Card>
  );
}
