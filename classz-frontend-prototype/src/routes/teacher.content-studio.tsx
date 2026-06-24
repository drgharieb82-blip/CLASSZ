import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  ArrowDown, ArrowUp, BarChart3, BookOpen, Bot, Brain, Calendar, Check, ChevronDown, ChevronUp,
  ChevronRight, Clock, Copy, DollarSign, Edit3, Eye, EyeOff, File, FileText,
  Film, FolderTree, Gift, GripVertical, HelpCircle, ClipboardList, Image, Layers, Link2, Lock,
  Pencil, PlayCircle, Plus, ScrollText, Sparkles, StickyNote, Target,
  Trash2, Trophy, Unlock, Upload, Users, Video, X, Zap,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { useTeacherChapterStore } from "@/lib/teacher/teacher-chapter-store";
import { useTeacherSessionStore, type TeacherSession } from "@/lib/teacher/teacher-session-store";
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
import { useTeacherAssessmentStore } from "@/lib/teacher/teacher-assessment-store";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { seedTeacherData } from "@/lib/teacher/seed-teacher-data";

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

  useEffect(() => {
    seedTeacherData();
  }, []);

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
          {activeTab === "sessions" && <SessionsBuilderTab courseId={selectedCourseId} />}
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

const SESSION_BUILDER_I18N = {
  "stats.total": { en: "Total sessions", ar: "إجمالي الحصص" },
  "stats.published": { en: "Published", ar: "منشور" },
  "stats.drafts": { en: "Drafts", ar: "مسودات" },
  "stats.paid": { en: "Paid sessions", ar: "حصص مدفوعة" },
  "stats.free": { en: "Free sessions", ar: "حصص مجانية" },
  "stats.completion": { en: "Average completion", ar: "متوسط الإكمال" },
  "stats.revenue": { en: "Total revenue", ar: "إجمالي الإيراد" },
  "ui.library": { en: "Session Library", ar: "مكتبة الحصص" },
  "ui.builder": { en: "Learning Experience Builder", ar: "منشئ تجربة التعلم" },
  "ui.preview": { en: "Student Live Preview", ar: "معاينة الطالب" },
  "ui.search": { en: "Search learning experiences...", ar: "ابحث في تجارب التعلم..." },
  "ui.all": { en: "All", ar: "الكل" },
  "ui.status": { en: "Status", ar: "الحالة" },
  "ui.pricing": { en: "Pricing", ar: "التسعير" },
  "ui.publishState": { en: "Publish state", ar: "حالة النشر" },
  "ui.visible": { en: "Visible", ar: "ظاهر" },
  "ui.hidden": { en: "Hidden", ar: "مخفي" },
  "ui.free": { en: "Free", ar: "مجاني" },
  "ui.paid": { en: "Paid", ar: "مدفوع" },
  "ui.overview": { en: "Overview", ar: "نظرة عامة" },
  "ui.blocks": { en: "Blocks", ar: "البلوكات" },
  "ui.access": { en: "Access", ar: "الوصول" },
  "ui.concepts": { en: "Concepts", ar: "المفاهيم" },
  "ui.assessments": { en: "Assessments", ar: "التقييمات" },
  "ui.analytics": { en: "Analytics", ar: "التحليلات" },
  "ui.title": { en: "Title", ar: "العنوان" },
  "ui.chapter": { en: "Chapter", ar: "الفصل" },
  "ui.description": { en: "Description", ar: "الوصف" },
  "ui.objectives": { en: "Objectives", ar: "الأهداف" },
  "ui.thumbnail": { en: "Thumbnail", ar: "الصورة المصغرة" },
  "ui.price": { en: "Price", ar: "السعر" },
  "ui.availability": { en: "Availability", ar: "الإتاحة" },
  "ui.openDate": { en: "Open date", ar: "تاريخ الفتح" },
  "ui.closeDate": { en: "Close date", ar: "تاريخ الإغلاق" },
  "ui.publishControls": { en: "Publish controls", ar: "أدوات النشر" },
  "ui.saveDraft": { en: "Save draft", ar: "حفظ كمسودة" },
  "ui.publish": { en: "Publish", ar: "نشر" },
  "ui.archive": { en: "Archive", ar: "أرشفة" },
  "ui.delete": { en: "Delete", ar: "حذف" },
  "ui.duplicate": { en: "Duplicate", ar: "نسخ" },
  "ui.edit": { en: "Edit", ar: "تعديل" },
  "ui.newSession": { en: "New session", ar: "حصة جديدة" },
  "ui.noResults": { en: "No sessions match filters", ar: "لا توجد حصص مطابقة" },
  "empty.kicker": { en: "Learning experiences are your paid product", ar: "تجارب التعلم هي منتجك المدفوع" },
  "empty.title": { en: "Design your first paid learning experience", ar: "صمم أول تجربة تعلم مدفوعة" },
  "empty.body": { en: "Create a session that combines video, files, practice, assessments, access rules, rewards, and analytics in one paid learning unit.", ar: "أنشئ حصة تجمع الفيديو والملفات والتدريب والتقييمات وقواعد الوصول والمكافآت والتحليلات في وحدة تعلم مدفوعة واحدة." },
  "empty.action": { en: "Create premium session", ar: "إنشاء حصة احترافية" },
  "block.heading": { en: "Learning Blocks", ar: "بلوكات التعلم" },
  "block.linked": { en: "Linked resource", ar: "المورد المرتبط" },
  "block.required": { en: "Required", ar: "إجباري" },
  "block.optional": { en: "Optional", ar: "اختياري" },
  "block.locked": { en: "Locked", ar: "مقفل" },
  "block.unlocked": { en: "Unlocked", ar: "مفتوح" },
  "block.minutes": { en: "min", ar: "دقيقة" },
  "block.video": { en: "Video", ar: "فيديو" },
  "block.pdf": { en: "PDF/material", ar: "ملف PDF/مادة" },
  "block.practice": { en: "Question practice", ar: "تدريب أسئلة" },
  "block.quiz": { en: "Quiz", ar: "اختبار قصير" },
  "block.homework": { en: "Homework", ar: "واجب" },
  "block.exam": { en: "Exam", ar: "امتحان" },
  "block.notes": { en: "Notes", ar: "ملاحظات" },
  "block.attachments": { en: "Attachments", ar: "مرفقات" },
  "block.discussion": { en: "Discussion", ar: "نقاش" },
  "resource.video": { en: "Core lesson video", ar: "فيديو الدرس الأساسي" },
  "resource.pdf": { en: "Student material pack", ar: "حزمة مواد الطالب" },
  "resource.practice": { en: "Adaptive question set", ar: "مجموعة أسئلة تكيفية" },
  "resource.quiz": { en: "Session quiz", ar: "اختبار الحصة" },
  "resource.homework": { en: "Homework submission", ar: "تسليم الواجب" },
  "resource.exam": { en: "Controlled exam", ar: "امتحان مضبوط" },
  "resource.notes": { en: "Teacher notes", ar: "ملاحظات المعلم" },
  "resource.attachments": { en: "Downloadable files", ar: "ملفات قابلة للتحميل" },
  "resource.discussion": { en: "Moderated discussion", ar: "نقاش بإشراف" },
  "access.heading": { en: "Session Access Rules", ar: "قواعد وصول الحصة" },
  "access.previous": { en: "Requires previous session completion", ar: "يتطلب إكمال الحصة السابقة" },
  "access.payment": { en: "Requires payment", ar: "يتطلب الدفع" },
  "access.replay": { en: "Allow replay", ar: "السماح بالإعادة" },
  "concept.heading": { en: "Concepts Coverage", ar: "تغطية المفاهيم" },
  "concept.main": { en: "Main chapter concepts", ar: "مفاهيم الفصل الأساسي" },
  "concept.atomic": { en: "Atomic concepts", ar: "المفاهيم الذرية" },
  "concept.cross": { en: "Cross-chapter concepts", ar: "مفاهيم عابرة للفصول" },
  "concept.coverage": { en: "Coverage percentage", ar: "نسبة التغطية" },
  "assessment.heading": { en: "Assessment Rules", ar: "قواعد التقييم" },
  "assessment.completion": { en: "Completion condition", ar: "شرط الإكمال" },
  "assessment.score": { en: "Minimum quiz score", ar: "أقل درجة للاختبار" },
  "assessment.retake": { en: "Retake policy", ar: "سياسة الإعادة" },
  "assessment.answers": { en: "Show answers", ar: "إظهار الإجابات" },
  "assessment.condition": { en: "All required blocks completed", ar: "إكمال كل البلوكات الإجبارية" },
  "assessment.policy": { en: "Two retakes, highest score counts", ar: "محاولتان إضافيتان وتحسب أعلى درجة" },
  "assessment.approval": { en: "After teacher approval", ar: "بعد موافقة المعلم" },
  "reward.heading": { en: "Rewards", ar: "المكافآت" },
  "reward.xp": { en: "XP points", ar: "نقاط الخبرة" },
  "reward.badge": { en: "Badge", ar: "الشارة" },
  "reward.streak": { en: "Streak bonus", ar: "مكافأة السلسلة" },
  "reward.badgeName": { en: "Concept Master", ar: "متقن المفهوم" },
  "analytics.enrolled": { en: "Enrolled students", ar: "الطلاب المسجلون" },
  "analytics.completion": { en: "Completion rate", ar: "معدل الإكمال" },
  "analytics.watch": { en: "Average watch time", ar: "متوسط المشاهدة" },
  "analytics.quiz": { en: "Quiz average", ar: "متوسط الاختبار" },
  "analytics.revenue": { en: "Revenue", ar: "الإيراد" },
  "analytics.weak": { en: "Weak concepts detected", ar: "مفاهيم ضعيفة مكتشفة" },
  "preview.start": { en: "Start learning", ar: "ابدأ التعلم" },
  "preview.included": { en: "Included blocks", ar: "البلوكات المضمنة" },
  "preview.rules": { en: "Rules summary", ar: "ملخص القواعد" },
} as const;

type SessionBuilderI18nKey = keyof typeof SESSION_BUILDER_I18N;
type SessionBuilderTranslator = (key: SessionBuilderI18nKey) => string;
type SessionBuilderTabKey = "overview" | "blocks" | "access" | "concepts" | "assessments" | "analytics";
type BuilderBlockType = "video" | "pdf" | "practice" | "quiz" | "homework" | "exam" | "notes" | "attachments" | "discussion";
type BuilderBlock = { id: string; type: BuilderBlockType; titleKey: SessionBuilderI18nKey; resource: string; required: boolean; locked: boolean; duration: number };
type BuilderStats = { videoCount: number; resourceCount: number; questionsCount: number; assessmentCount: number };

const BUILDER_BLOCK_META: Record<BuilderBlockType, { icon: typeof Video; labelKey: SessionBuilderI18nKey; resourceKey: SessionBuilderI18nKey; color: string }> = {
  video: { icon: Video, labelKey: "block.video", resourceKey: "resource.video", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  pdf: { icon: FileText, labelKey: "block.pdf", resourceKey: "resource.pdf", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  practice: { icon: HelpCircle, labelKey: "block.practice", resourceKey: "resource.practice", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  quiz: { icon: ClipboardList, labelKey: "block.quiz", resourceKey: "resource.quiz", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
  homework: { icon: Pencil, labelKey: "block.homework", resourceKey: "resource.homework", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  exam: { icon: ScrollText, labelKey: "block.exam", resourceKey: "resource.exam", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  notes: { icon: StickyNote, labelKey: "block.notes", resourceKey: "resource.notes", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  attachments: { icon: File, labelKey: "block.attachments", resourceKey: "resource.attachments", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  discussion: { icon: Users, labelKey: "block.discussion", resourceKey: "resource.discussion", color: "text-primary bg-primary/10 border-primary/20" },
};

function SessionsBuilderTab({ courseId }: { courseId: string }) {
  const { lang } = useApp();
  const sb: SessionBuilderTranslator = (key) => SESSION_BUILDER_I18N[key][lang];
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
  const allAssessments = useTeacherAssessmentStore((s) => s.assessments);
  const allTreeNodes = useContentTreeStore((s) => s.nodes);

  const sessions = useMemo(() => rawSessions.filter((session) => session.courseId === courseId).sort((a, b) => a.order - b.order), [rawSessions, courseId]);
  const chapters = useMemo(() => rawChapters.filter((chapter) => chapter.courseId === courseId).sort((a, b) => a.order - b.order), [rawChapters, courseId]);
  const treeNodes = useMemo(() => allTreeNodes.filter((node) => node.courseId === courseId), [allTreeNodes, courseId]);
  const chapterMap = useMemo(() => new Map(chapters.map((chapter) => [chapter.id, chapter.title])), [chapters]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pricingFilter, setPricingFilter] = useState("");
  const [publishFilter, setPublishFilter] = useState("");
  const [tab, setTab] = useState<SessionBuilderTabKey>("overview");

  useEffect(() => {
    if (sessions.length === 0) setSelectedId("");
    else if (!selectedId || !sessions.some((session) => session.id === selectedId)) setSelectedId(sessions[0].id);
  }, [sessions, selectedId]);

  const statsMap = useMemo(() => {
    const map = new Map<string, BuilderStats>();
    for (const session of sessions) {
      const materials = allMaterials.filter((material) => material.sessionId === session.id || material.linkedSessionIds?.includes(session.id));
      const assessmentCount = allQuizzes.filter((quiz) => quiz.sessionIds?.includes(session.id)).length + allExams.filter((exam) => exam.sessionIds?.includes(session.id)).length + allHomework.filter((item) => item.sessionIds?.includes(session.id)).length + allAssessments.filter((assessment) => assessment.sessionIds?.includes(session.id)).length;
      map.set(session.id, {
        videoCount: materials.filter((material) => material.type === "video").length,
        resourceCount: materials.filter((material) => material.type !== "video").length,
        questionsCount: allQuestions.filter((question) => question.sessionId === session.id || question.sessionIds?.includes(session.id)).length,
        assessmentCount,
      });
    }
    return map;
  }, [sessions, allMaterials, allQuestions, allQuizzes, allExams, allHomework, allAssessments]);

  const filtered = useMemo(() => {
    let result = sessions;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((session) => session.title.toLowerCase().includes(q) || session.publicCode.toLowerCase().includes(q));
    }
    if (statusFilter) result = result.filter((session) => session.status === statusFilter);
    if (pricingFilter === "free") result = result.filter((session) => session.price === 0 || session.isFreePreview);
    if (pricingFilter === "paid") result = result.filter((session) => session.price > 0 && !session.isFreePreview);
    if (publishFilter === "visible") result = result.filter((session) => session.accessStatus !== "locked");
    if (publishFilter === "hidden") result = result.filter((session) => session.accessStatus === "locked");
    return result;
  }, [sessions, search, statusFilter, pricingFilter, publishFilter]);

  const selected = sessions.find((session) => session.id === selectedId) || sessions[0];
  const blocks = useMemo(() => selected ? buildBuilderBlocks(selected, sb, allMaterials, allQuestions, allQuizzes, allExams, allHomework, allAssessments) : [], [selected, allMaterials, allQuestions, allQuizzes, allExams, allHomework, allAssessments, lang]);
  const revenue = sessions.reduce((sum, session, index) => sum + session.price * (90 + index * 19), 0);
  const topStats = [
    { label: sb("stats.total"), value: sessions.length, icon: Layers, cls: "text-blue-500" },
    { label: sb("stats.published"), value: sessions.filter((session) => session.status === "published").length, icon: Eye, cls: "text-emerald-500" },
    { label: sb("stats.drafts"), value: sessions.filter((session) => session.status === "draft").length, icon: Clock, cls: "text-amber-500" },
    { label: sb("stats.paid"), value: sessions.filter((session) => session.price > 0 && !session.isFreePreview).length, icon: DollarSign, cls: "text-primary" },
    { label: sb("stats.free"), value: sessions.filter((session) => session.price === 0 || session.isFreePreview).length, icon: Gift, cls: "text-green-500" },
    { label: sb("stats.completion"), value: `${sessions.length ? Math.round(sessions.reduce((sum, session, index) => sum + builderCompletion(session, index), 0) / sessions.length) : 0}%`, icon: Target, cls: "text-violet-500" },
    { label: sb("stats.revenue"), value: `$${Math.round(revenue).toLocaleString()}`, icon: BarChart3, cls: "text-cyan-500" },
  ];

  const createPremiumSession = () => {
    const chapterId = chapters[0]?.id;
    if (!chapterId) return;
    const session = createSession({ courseId, chapterId, title: `${sb("ui.newSession")} ${sessions.length + 1}`, description: sb("empty.body"), price: 25, currency: "USD", durationMinutes: 75, sessionType: "mixed", status: "draft", accessStatus: "locked" });
    setSelectedId(session.id);
    setTab("overview");
  };

  if (sessions.length === 0) {
    return (
      <Card className="overflow-hidden border bg-card">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5 p-8 sm:p-10">
            <Badge className="w-fit rounded-full border-0 bg-primary/10 text-primary">{sb("empty.kicker")}</Badge>
            <div className="space-y-2"><h2 className="text-2xl font-bold tracking-tight">{sb("empty.title")}</h2><p className="max-w-xl text-sm leading-6 text-muted-foreground">{sb("empty.body")}</p></div>
            <Button onClick={createPremiumSession} disabled={chapters.length === 0} className="rounded-xl gradient-brand border-0 text-white"><Plus className="me-1.5 h-4 w-4" />{sb("empty.action")}</Button>
          </div>
          <div className="border-t bg-gradient-to-br from-primary/10 via-background to-violet-500/10 p-8 lg:border-s"><div className="grid gap-3">{(Object.keys(BUILDER_BLOCK_META) as BuilderBlockType[]).map((type) => { const meta = BUILDER_BLOCK_META[type]; return <BuilderBlockShell key={type} icon={meta.icon} color={meta.color} title={sb(meta.labelKey)} subtitle={sb(meta.resourceKey)} />; })}</div></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {topStats.map((item) => (
          <Card key={item.label} className="border bg-card p-3"><div className="flex items-center gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted"><item.icon className={cn("h-4 w-4", item.cls)} /></span><div className="min-w-0"><p className="truncate text-lg font-bold leading-tight">{item.value}</p><p className="truncate text-[11px] text-muted-foreground">{item.label}</p></div></div></Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <Card className="overflow-hidden border bg-card">
          <div className="border-b p-4">
            <div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">{sb("ui.library")}</h3><p className="text-xs text-muted-foreground">{filtered.length} / {sessions.length}</p></div><Button size="icon" variant="outline" className="h-8 w-8 rounded-lg" onClick={createPremiumSession} disabled={chapters.length === 0} title={sb("ui.newSession")}><Plus className="h-4 w-4" /></Button></div>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={sb("ui.search")} className="h-9 rounded-xl text-sm" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <BuilderSelect label={sb("ui.status")} value={statusFilter} onChange={setStatusFilter} options={[["", sb("ui.all")], ["draft", sb("stats.drafts")], ["published", sb("stats.published")], ["archived", sb("ui.archive")]]} />
              <BuilderSelect label={sb("ui.pricing")} value={pricingFilter} onChange={setPricingFilter} options={[["", sb("ui.all")], ["free", sb("ui.free")], ["paid", sb("ui.paid")]]} />
              <BuilderSelect label={sb("ui.publishState")} value={publishFilter} onChange={setPublishFilter} options={[["", sb("ui.all")], ["visible", sb("ui.visible")], ["hidden", sb("ui.hidden")]]} />
            </div>
          </div>
          <div className="max-h-[44rem] overflow-y-auto p-2">
            {filtered.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">{sb("ui.noResults")}</div> : filtered.map((session, index) => <BuilderSessionItem key={session.id} session={session} stats={statsMap.get(session.id)} chapterName={chapterMap.get(session.chapterId)} selected={session.id === selected?.id} completion={builderCompletion(session, index)} sb={sb} onSelect={() => setSelectedId(session.id)} />)}
          </div>
        </Card>

        <Card className="overflow-hidden border bg-card">
          {selected && (
            <>
              <div className="border-b bg-muted/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0"><div className="mb-1 flex flex-wrap items-center gap-2"><Badge className={cn("rounded-full border-0 text-[10px]", builderTypeColor(selected))}>{builderTypeLabel(selected)}</Badge><span className="font-mono text-[10px] text-muted-foreground">{selected.publicCode}</span><BuilderStatusBadge session={selected} sb={sb} /></div><h3 className="truncate text-lg font-semibold">{selected.title}</h3><p className="text-xs text-muted-foreground">{chapterMap.get(selected.chapterId) || sb("ui.chapter")}</p></div>
                  <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={() => updateSession(selected.id, { status: "draft" })}>{sb("ui.saveDraft")}</Button><Button size="sm" className="h-8 rounded-lg gradient-brand border-0 text-white" onClick={() => publishSession(selected.id)}><Upload className="me-1.5 h-3.5 w-3.5" />{sb("ui.publish")}</Button><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-amber-500" onClick={() => archiveSession(selected.id)} title={sb("ui.archive")}><EyeOff className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => deleteSession(selected.id)} title={sb("ui.delete")}><Trash2 className="h-4 w-4" /></Button></div>
                </div>
              </div>
              <Tabs value={tab} onValueChange={(value) => setTab(value as SessionBuilderTabKey)} className="p-4">
                <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl bg-muted/70 p-1">{(["overview", "blocks", "access", "concepts", "assessments", "analytics"] as SessionBuilderTabKey[]).map((tabKey) => <TabsTrigger key={tabKey} value={tabKey} className="rounded-lg px-3 py-1.5 text-xs">{sb(`ui.${tabKey}` as SessionBuilderI18nKey)}</TabsTrigger>)}</TabsList>
                <TabsContent value="overview" className="mt-4"><BuilderOverview session={selected} chapters={chapters} sb={sb} updateSession={updateSession} /></TabsContent>
                <TabsContent value="blocks" className="mt-4"><BuilderBlocks blocks={blocks} sb={sb} /></TabsContent>
                <TabsContent value="access" className="mt-4"><BuilderAccess session={selected} sb={sb} updateSession={updateSession} lockSession={lockSession} unlockSession={unlockSession} /></TabsContent>
                <TabsContent value="concepts" className="mt-4"><BuilderConcepts session={selected} chapterName={chapterMap.get(selected.chapterId)} treeNodes={treeNodes} blocks={blocks} sb={sb} /></TabsContent>
                <TabsContent value="assessments" className="mt-4"><BuilderAssessments session={selected} sb={sb} /></TabsContent>
                <TabsContent value="analytics" className="mt-4"><BuilderAnalytics analytics={builderAnalytics(selected, sessions.indexOf(selected))} sb={sb} /></TabsContent>
              </Tabs>
            </>
          )}
        </Card>

        <Card className="overflow-hidden border bg-card">{selected && <BuilderPreview session={selected} chapterName={chapterMap.get(selected.chapterId)} blocks={blocks} stats={statsMap.get(selected.id)} sb={sb} />}</Card>
      </div>
    </div>
  );
}

function BuilderSelect({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (value: string) => void }) {
  return <label className="space-y-1"><span className="block truncate text-[10px] font-medium text-muted-foreground">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-full rounded-lg border bg-background px-2 text-[11px]">{options.map(([optionValue, optionLabel]) => <option key={optionValue || "all"} value={optionValue}>{optionLabel}</option>)}</select></label>;
}

function BuilderBlockShell({ icon: Icon, color, title, subtitle }: { icon: typeof Video; color: string; title: string; subtitle: string }) {
  return <div className="flex items-center gap-3 rounded-xl border bg-background/80 p-3 shadow-sm"><span className={cn("grid h-9 w-9 place-items-center rounded-lg border", color)}><Icon className="h-4 w-4" /></span><div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-muted-foreground">{subtitle}</p></div></div>;
}

function BuilderSessionItem({ session, stats, chapterName, selected, completion, sb, onSelect }: { session: TeacherSession; stats?: BuilderStats; chapterName?: string; selected: boolean; completion: number; sb: SessionBuilderTranslator; onSelect: () => void }) {
  const paid = session.price > 0 && !session.isFreePreview;
  return <button onClick={onSelect} className={cn("mb-2 w-full rounded-xl border p-3 text-start transition-colors", selected ? "border-primary/40 bg-primary/10" : "bg-background hover:bg-accent/40")}><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="line-clamp-2 text-sm font-semibold">{session.title}</p><p className="mt-0.5 truncate text-[11px] text-muted-foreground">{chapterName || session.publicCode}</p></div><Badge variant="outline" className={cn("rounded-full text-[10px]", paid ? "border-primary/30 text-primary" : "border-emerald-300 text-emerald-600")}>{paid ? `${session.price} ${session.currency}` : sb("ui.free")}</Badge></div><div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground"><BuilderStatusBadge session={session} sb={sb} /><span className="rounded-full bg-muted px-2 py-0.5">{stats?.videoCount || 0} {sb("block.video")}</span><span className="rounded-full bg-muted px-2 py-0.5">{stats?.assessmentCount || 0} {sb("ui.assessments")}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} /></div></button>;
}

function BuilderStatusBadge({ session, sb }: { session: TeacherSession; sb: SessionBuilderTranslator }) {
  const label = session.status === "published" ? sb("stats.published") : session.status === "draft" ? sb("stats.drafts") : sb("ui.archive");
  return <Badge variant="outline" className={cn("rounded-full text-[10px]", session.status === "published" ? "border-emerald-300 text-emerald-600" : session.status === "draft" ? "border-amber-300 text-amber-600" : "border-slate-300 text-slate-500")}>{label}</Badge>;
}

function BuilderOverview({ session, chapters, sb, updateSession }: { session: TeacherSession; chapters: { id: string; title: string }[]; sb: SessionBuilderTranslator; updateSession: (sessionId: string, data: Partial<TeacherSession>) => void }) {
  return <div className="grid gap-4 lg:grid-cols-[1fr_220px]"><div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><BuilderField label={sb("ui.title")}><Input value={session.title} onChange={(event) => updateSession(session.id, { title: event.target.value })} className="rounded-xl" /></BuilderField><BuilderField label={sb("ui.chapter")}><select value={session.chapterId} onChange={(event) => updateSession(session.id, { chapterId: event.target.value, chapterIds: [event.target.value] })} className="h-10 w-full rounded-xl border bg-background px-3 text-sm">{chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.title}</option>)}</select></BuilderField></div><BuilderField label={sb("ui.description")}><textarea value={session.description} onChange={(event) => updateSession(session.id, { description: event.target.value })} rows={4} className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm" /></BuilderField><BuilderField label={sb("ui.objectives")}><div className="grid gap-2 sm:grid-cols-3">{["assessment.condition", "assessment.score", "concept.coverage"].map((key) => <div key={key} className="rounded-xl border bg-muted/30 p-3 text-xs font-medium">{sb(key as SessionBuilderI18nKey)}</div>)}</div></BuilderField><div className="grid gap-3 sm:grid-cols-3"><BuilderField label={sb("ui.price")}><Input type="number" min="0" value={session.price} onChange={(event) => updateSession(session.id, { price: Number(event.target.value) || 0, isFreePreview: Number(event.target.value) === 0 })} className="rounded-xl" /></BuilderField><BuilderField label={sb("ui.openDate")}><Input type="datetime-local" value={session.openAt.slice(0, 16)} onChange={(event) => updateSession(session.id, { openAt: event.target.value })} className="rounded-xl" /></BuilderField><BuilderField label={sb("ui.closeDate")}><Input type="datetime-local" value={session.closeAt.slice(0, 16)} onChange={(event) => updateSession(session.id, { closeAt: event.target.value })} className="rounded-xl" /></BuilderField></div></div><div className="space-y-3"><BuilderField label={sb("ui.thumbnail")}><div className="grid aspect-video place-items-center rounded-xl border bg-gradient-to-br from-primary/20 via-background to-violet-500/20"><PlayCircle className="h-10 w-10 text-primary" /></div></BuilderField><Card className="border bg-muted/20 p-3"><p className="mb-2 text-xs font-semibold">{sb("ui.publishControls")}</p><div className="grid gap-2 text-xs"><BuilderToggle label={sb("ui.visible")} checked={session.accessStatus !== "locked"} onCheckedChange={(checked) => updateSession(session.id, { accessStatus: checked ? "unlocked" : "locked" })} /><BuilderToggle label={sb("access.replay")} checked /><BuilderToggle label={sb("access.payment")} checked={session.price > 0} /></div></Card></div></div>;
}

function BuilderBlocks({ blocks, sb }: { blocks: BuilderBlock[]; sb: SessionBuilderTranslator }) {
  return <div className="space-y-3"><div className="flex items-center justify-between gap-3"><div><h4 className="font-semibold">{sb("block.heading")}</h4><p className="text-xs text-muted-foreground">{sb("ui.builder")}</p></div><Badge variant="outline" className="rounded-full">{blocks.length}</Badge></div><div className="space-y-2">{blocks.map((block, index) => <BuilderBlockCard key={block.id} block={block} index={index} sb={sb} />)}</div></div>;
}

function BuilderBlockCard({ block, index, sb }: { block: BuilderBlock; index: number; sb: SessionBuilderTranslator }) {
  const meta = BUILDER_BLOCK_META[block.type];
  return <div className="grid gap-3 rounded-xl border bg-background p-3 md:grid-cols-[auto_1fr_auto] md:items-center"><div className="flex items-center gap-2"><GripVertical className="h-4 w-4 text-muted-foreground" /><span className="grid h-9 w-9 place-items-center rounded-lg border bg-card text-xs font-semibold">{index + 1}</span><span className={cn("grid h-9 w-9 place-items-center rounded-lg border", meta.color)}><meta.icon className="h-4 w-4" /></span></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{sb(block.titleKey)}</p><Badge variant="outline" className="rounded-full text-[10px]">{sb(meta.labelKey)}</Badge></div><p className="mt-1 truncate text-xs text-muted-foreground">{sb("block.linked")}: {block.resource}</p><div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground"><BuilderToggle compact label={block.required ? sb("block.required") : sb("block.optional")} checked={block.required} /><Badge variant="outline" className={cn("rounded-full text-[10px]", block.locked ? "border-slate-300 text-slate-500" : "border-emerald-300 text-emerald-600")}>{block.locked ? <Lock className="me-1 h-3 w-3" /> : <Unlock className="me-1 h-3 w-3" />}{block.locked ? sb("block.locked") : sb("block.unlocked")}</Badge><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{block.duration} {sb("block.minutes")}</span></div></div><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title={sb("ui.edit")}><Edit3 className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title={sb("ui.duplicate")}><Copy className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" title={sb("ui.delete")}><Trash2 className="h-3.5 w-3.5" /></Button></div></div>;
}

function BuilderAccess({ session, sb, updateSession, lockSession, unlockSession }: { session: TeacherSession; sb: SessionBuilderTranslator; updateSession: (sessionId: string, data: Partial<TeacherSession>) => void; lockSession: (sessionId: string) => void; unlockSession: (sessionId: string) => void }) {
  const paid = session.price > 0 && !session.isFreePreview;
  return <div className="grid gap-4 lg:grid-cols-2"><Card className="border bg-background p-4"><h4 className="mb-3 font-semibold">{sb("access.heading")}</h4><div className="grid gap-3"><BuilderToggle label={sb("ui.free")} checked={!paid} onCheckedChange={(checked) => updateSession(session.id, { price: checked ? 0 : Math.max(session.price, 25), isFreePreview: checked })} /><BuilderField label={sb("ui.price")}><Input type="number" value={session.price} onChange={(event) => updateSession(session.id, { price: Number(event.target.value) || 0 })} className="rounded-xl" /></BuilderField><BuilderToggle label={sb("access.previous")} checked={session.order > 1} /><BuilderToggle label={sb("access.payment")} checked={paid} /><BuilderToggle label={sb("access.replay")} checked /><BuilderToggle label={sb("ui.visible")} checked={session.accessStatus !== "locked"} onCheckedChange={(checked) => checked ? unlockSession(session.id) : lockSession(session.id)} /></div></Card><Card className="border bg-background p-4"><h4 className="mb-3 font-semibold">{sb("ui.availability")}</h4><div className="grid gap-3"><BuilderField label={sb("ui.openDate")}><Input type="datetime-local" value={session.openAt.slice(0, 16)} onChange={(event) => updateSession(session.id, { openAt: event.target.value })} className="rounded-xl" /></BuilderField><BuilderField label={sb("ui.closeDate")}><Input type="datetime-local" value={session.closeAt.slice(0, 16)} onChange={(event) => updateSession(session.id, { closeAt: event.target.value })} className="rounded-xl" /></BuilderField><div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">{paid ? sb("access.payment") : sb("ui.free")}</div></div></Card></div>;
}

function BuilderConcepts({ session, chapterName, treeNodes, blocks, sb }: { session: TeacherSession; chapterName?: string; treeNodes: ContentTreeNode[]; blocks: BuilderBlock[]; sb: SessionBuilderTranslator }) {
  const concepts = treeNodes.filter((node) => node.type === "concept");
  const atomics = treeNodes.filter((node) => node.type === "atomic_concept");
  const coverage = Math.min(100, 48 + blocks.length * 4 + (session.conceptIds?.length || 0) * 8 + (session.atomicConceptIds?.length || 0) * 5);
  return <div className="grid gap-4 lg:grid-cols-[220px_1fr]"><Card className="border bg-background p-4 text-center"><p className="text-4xl font-bold text-primary">{coverage}%</p><p className="mt-1 text-xs text-muted-foreground">{sb("concept.coverage")}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${coverage}%` }} /></div></Card><div className="grid gap-3"><BuilderConceptGroup title={sb("concept.main")} subtitle={chapterName || sb("ui.chapter")} concepts={concepts.slice(0, 6).map((node) => node.title)} /><BuilderConceptGroup title={sb("concept.atomic")} subtitle={sb("concept.heading")} concepts={atomics.slice(0, 8).map((node) => node.title)} /><BuilderConceptGroup title={sb("concept.cross")} subtitle={sb("concept.heading")} concepts={concepts.slice(6, 11).map((node) => node.title)} /></div></div>;
}

function BuilderConceptGroup({ title, subtitle, concepts }: { title: string; subtitle: string; concepts: string[] }) {
  return <Card className="border bg-background p-4"><div className="mb-2 flex items-center justify-between gap-3"><h4 className="text-sm font-semibold">{title}</h4><span className="text-[11px] text-muted-foreground">{subtitle}</span></div><div className="flex flex-wrap gap-1.5">{concepts.map((concept) => <Badge key={concept} variant="outline" className="rounded-full text-[10px]">{concept}</Badge>)}</div></Card>;
}

function BuilderAssessments({ session, sb }: { session: TeacherSession; sb: SessionBuilderTranslator }) {
  return <div className="grid gap-4 lg:grid-cols-2"><Card className="border bg-background p-4"><h4 className="mb-3 font-semibold">{sb("assessment.heading")}</h4><div className="space-y-3 text-sm"><BuilderInfo label={sb("assessment.completion")} value={sb("assessment.condition")} /><BuilderInfo label={sb("assessment.score")} value={`${session.hasExam ? 75 : 70}%`} /><BuilderInfo label={sb("assessment.retake")} value={sb("assessment.policy")} /><BuilderInfo label={sb("assessment.answers")} value={sb("assessment.approval")} /></div></Card><Card className="border bg-background p-4"><h4 className="mb-3 font-semibold">{sb("reward.heading")}</h4><div className="grid gap-3 sm:grid-cols-3"><BuilderReward icon={Zap} label={sb("reward.xp")} value={String(80 + session.order * 10)} /><BuilderReward icon={Trophy} label={sb("reward.badge")} value={sb("reward.badgeName")} /><BuilderReward icon={Sparkles} label={sb("reward.streak")} value={`+${session.order * 5}%`} /></div></Card></div>;
}

function BuilderAnalytics({ analytics, sb }: { analytics: ReturnType<typeof builderAnalytics>; sb: SessionBuilderTranslator }) {
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><BuilderMetric label={sb("analytics.enrolled")} value={analytics.enrolledStudents} /><BuilderMetric label={sb("analytics.completion")} value={`${analytics.completionRate}%`} /><BuilderMetric label={sb("analytics.watch")} value={`${analytics.averageWatchTime}m`} /><BuilderMetric label={sb("analytics.quiz")} value={`${analytics.quizAverage}%`} /><BuilderMetric label={sb("analytics.revenue")} value={`$${analytics.revenue.toLocaleString()}`} /></div><Card className="border bg-background p-4"><h4 className="mb-3 font-semibold">{sb("analytics.weak")}</h4><div className="grid gap-2 sm:grid-cols-3">{analytics.weakConcepts.map((concept) => <div key={concept.name} className="rounded-xl border bg-muted/20 p-3"><div className="mb-2 flex items-center justify-between text-xs"><span className="font-medium">{concept.name}</span><span className="text-destructive">{concept.score}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-destructive" style={{ width: `${concept.score}%` }} /></div></div>)}</div></Card></div>;
}

function BuilderPreview({ session, chapterName, blocks, stats, sb }: { session: TeacherSession; chapterName?: string; blocks: BuilderBlock[]; stats?: BuilderStats; sb: SessionBuilderTranslator }) {
  const paid = session.price > 0 && !session.isFreePreview;
  return <div><div className="border-b bg-gradient-to-br from-primary/15 via-background to-violet-500/10 p-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{sb("ui.preview")}</p><div className="grid aspect-video place-items-center rounded-xl border bg-background/80"><PlayCircle className="h-12 w-12 text-primary" /></div><h3 className="mt-4 text-lg font-bold">{session.title}</h3><p className="mt-1 text-xs text-muted-foreground">{chapterName}</p><div className="mt-3 flex flex-wrap gap-2"><Badge className="rounded-full border-0 bg-primary text-primary-foreground">{paid ? `${session.price} ${session.currency}` : sb("ui.free")}</Badge><Badge variant="outline" className="rounded-full">{session.durationMinutes || blocks.reduce((sum, block) => sum + block.duration, 0)} {sb("block.minutes")}</Badge></div></div><div className="space-y-4 p-4"><div><h4 className="mb-2 text-sm font-semibold">{sb("preview.included")}</h4><div className="space-y-2">{blocks.slice(0, 6).map((block) => { const meta = BUILDER_BLOCK_META[block.type]; return <div key={block.id} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs"><meta.icon className={cn("h-3.5 w-3.5", meta.color.split(" ")[0])} /><span className="min-w-0 flex-1 truncate">{sb(block.titleKey)}</span>{block.required ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}</div>; })}</div></div><Card className="border bg-muted/20 p-3"><h4 className="mb-2 text-sm font-semibold">{sb("preview.rules")}</h4><div className="grid gap-2 text-xs text-muted-foreground"><span>{sb("assessment.completion")}: {sb("assessment.condition")}</span><span>{sb("assessment.score")}: 70%</span><span>{sb("reward.heading")}: {80 + session.order * 10} {sb("reward.xp")}</span></div></Card><Button className="w-full rounded-xl gradient-brand border-0 text-white">{sb("preview.start")}</Button><div className="grid grid-cols-3 gap-2 text-center text-xs"><BuilderMini value={stats?.videoCount || 1} label={sb("block.video")} /><BuilderMini value={stats?.resourceCount || 2} label={sb("block.pdf")} /><BuilderMini value={stats?.assessmentCount || 2} label={sb("ui.assessments")} /></div></div></div>;
}

function BuilderField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

function BuilderToggle({ label, checked, compact = false, onCheckedChange }: { label: string; checked: boolean; compact?: boolean; onCheckedChange?: (checked: boolean) => void }) {
  return <div className={cn("flex items-center justify-between gap-2", compact && "justify-start")}><span className={cn("text-xs", compact && "text-[11px]")}>{label}</span><Switch checked={checked} onCheckedChange={onCheckedChange || (() => undefined)} className={compact ? "scale-75" : undefined} /></div>;
}

function BuilderInfo({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-2"><span className="text-muted-foreground">{label}</span><span className="text-end font-medium">{value}</span></div>;
}

function BuilderReward({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return <div className="rounded-xl border bg-muted/20 p-3 text-center"><Icon className="mx-auto mb-2 h-4 w-4 text-primary" /><p className="text-sm font-bold">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{label}</p></div>;
}

function BuilderMetric({ label, value }: { label: string; value: string | number }) {
  return <Card className="border bg-background p-3"><p className="text-xl font-bold">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></Card>;
}

function BuilderMini({ value, label }: { value: string | number; label: string }) {
  return <div className="rounded-lg border bg-muted/20 p-2"><p className="font-bold">{value}</p><p className="truncate text-[10px] text-muted-foreground">{label}</p></div>;
}

function buildBuilderBlocks(session: TeacherSession, sb: SessionBuilderTranslator, allMaterials: TeacherMaterial[], allQuestions: TeacherQuestion[], allQuizzes: { id: string; title: string; sessionIds?: string[] }[], allExams: { id: string; title: string; sessionIds?: string[] }[], allHomework: { id: string; title: string; sessionIds?: string[] }[], allAssessments: { id: string; title: string; sessionIds?: string[] }[]): BuilderBlock[] {
  const materials = allMaterials.filter((material) => material.sessionId === session.id || material.linkedSessionIds?.includes(session.id));
  const video = materials.find((material) => material.type === "video");
  const pdf = materials.find((material) => material.type === "pdf") || materials.find((material) => material.type !== "video");
  const practiceCount = allQuestions.filter((question) => question.sessionId === session.id || question.sessionIds?.includes(session.id)).length;
  const quiz = allQuizzes.find((item) => item.sessionIds?.includes(session.id));
  const exam = allExams.find((item) => item.sessionIds?.includes(session.id));
  const homework = allHomework.find((item) => item.sessionIds?.includes(session.id));
  const assessment = allAssessments.find((item) => item.sessionIds?.includes(session.id));
  const durations = [35, 12, 18, 10, 25, 40, 6, 4, 8];
  return (Object.keys(BUILDER_BLOCK_META) as BuilderBlockType[]).map((type, index) => {
    const meta = BUILDER_BLOCK_META[type];
    const resource = type === "video" && video ? video.title : type === "pdf" && pdf ? pdf.title : type === "practice" && practiceCount > 0 ? `${practiceCount} ${sb("block.practice")}` : type === "quiz" && quiz ? quiz.title : type === "homework" && homework ? homework.title : type === "exam" && exam ? exam.title : type === "quiz" && assessment ? assessment.title : sb(meta.resourceKey);
    return { id: `${session.id}-${type}`, type, titleKey: meta.labelKey, resource, required: index < 6, locked: session.accessStatus === "locked" && index > 1, duration: durations[index] };
  });
}

function builderAnalytics(session: TeacherSession, index: number) {
  return { enrolledStudents: 118 + index * 43, completionRate: builderCompletion(session, index), averageWatchTime: 34 + index * 3, quizAverage: 71 + (index % 5) * 4, revenue: session.price * (82 + index * 19), weakConcepts: [{ name: "Chain Rule", score: 42 + index }, { name: "Implicit Differentiation", score: 36 + index * 2 }, { name: "Limit Laws", score: 48 + index }] };
}

function builderTypeLabel(session: TeacherSession) {
  return (SESSION_TYPE_META[session.sessionType as SessionWorkspaceType] || SESSION_TYPE_META.lesson).label;
}

function builderTypeColor(session: TeacherSession) {
  return (SESSION_TYPE_META[session.sessionType as SessionWorkspaceType] || SESSION_TYPE_META.lesson).color;
}

function builderCompletion(session: TeacherSession, index: number) {
  if (session.status === "draft") return 38 + (index % 4) * 7;
  if (session.status === "archived") return 52;
  return Math.min(96, 68 + (index % 6) * 5);
}

function SessionsTab({ courseId }: { courseId: string }) {
  const rawSessions = useTeacherSessionStore((s) => s.sessions);
  const createSession = useTeacherSessionStore((s) => s.createSession);
  const deleteSession = useTeacherSessionStore((s) => s.deleteSession);
  const publishSession = useTeacherSessionStore((s) => s.publishSession);
  const archiveSession = useTeacherSessionStore((s) => s.archiveSession);
  const lockSession = useTeacherSessionStore((s) => s.lockSession);
  const unlockSession = useTeacherSessionStore((s) => s.unlockSession);
  const updateSession = useTeacherSessionStore((s) => s.updateSession);
  const duplicateSession = useTeacherSessionStore((s) => s.createSession);
  const rawChapters = useTeacherChapterStore((s) => s.chapters);
  const allMaterials = useTeacherMaterialStore((s) => s.materials);
  const allQuestions = useTeacherQuestionStore((s) => s.questions);
  const allQuizzes = useTeacherQuizStore((s) => s.quizzes);
  const allExams = useTeacherExamStore((s) => s.exams);
  const allHomework = useTeacherHomeworkStore((s) => s.items);
  const allAssessments = useTeacherAssessmentStore((s) => s.assessments);
  const allTreeNodes = useContentTreeStore((s) => s.nodes);

  const allSessions = useMemo(() => rawSessions.filter((ses) => ses.courseId === courseId).sort((a, b) => a.order - b.order), [rawSessions, courseId]);
  const chapters = useMemo(() => rawChapters.filter((c) => c.courseId === courseId).sort((a, b) => a.order - b.order), [rawChapters, courseId]);
  const treeNodes = useMemo(() => allTreeNodes.filter((n) => n.courseId === courseId), [allTreeNodes, courseId]);
  const treeConcepts = useMemo(() => treeNodes.filter((n) => n.type === "concept"), [treeNodes]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
    { key: "sessionType", label: "Type", options: [{ value: "lesson", label: "Lesson" }, { value: "revision", label: "Revision" }, { value: "practice", label: "Practice" }, { value: "mixed", label: "Mixed" }, { value: "quiz", label: "Quiz" }, { value: "exam", label: "Exam" }, { value: "homework", label: "Homework" }] },
    { key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }] },
    { key: "pricing", label: "Pricing", options: [{ value: "free", label: "Free" }, { value: "paid", label: "Paid" }] },
    { key: "content", label: "Content", options: [{ value: "has_video", label: "Has Video" }, { value: "has_assessment", label: "Has Assessment" }, { value: "has_quiz", label: "Has Quiz" }, { value: "has_homework", label: "Has Homework" }] },
  ], [chapters]);

  type SesStats = { materialsCount: number; videoCount: number; resourceCount: number; questionsCount: number; quizzesCount: number; examsCount: number; homeworkCount: number; assessmentCount: number };

  const sessionStatsMap = useMemo(() => {
    const map = new Map<string, SesStats>();
    for (const s of allSessions) {
      const mats = allMaterials.filter((m) => m.sessionId === s.id || m.linkedSessionIds?.includes(s.id));
      const qs = allQuizzes.filter((q) => q.sessionIds?.includes(s.id));
      const es = allExams.filter((e) => e.sessionIds?.includes(s.id));
      const hs = allHomework.filter((h) => h.sessionIds?.includes(s.id));
      const asmts = allAssessments.filter((a) => a.sessionIds?.includes(s.id));
      map.set(s.id, {
        materialsCount: mats.length,
        videoCount: mats.filter((m) => m.type === "video").length,
        resourceCount: mats.filter((m) => m.type !== "video").length,
        questionsCount: allQuestions.filter((q) => q.sessionId === s.id || q.sessionIds?.includes(s.id)).length,
        quizzesCount: qs.length,
        examsCount: es.length,
        homeworkCount: hs.length,
        assessmentCount: asmts.length + qs.length + es.length + hs.length,
      });
    }
    return map;
  }, [allSessions, allMaterials, allQuestions, allQuizzes, allExams, allHomework, allAssessments]);

  const filtered = useMemo(() => {
    let r = [...allSessions];
    if (search) { const q = search.toLowerCase(); r = r.filter((s) => s.title.toLowerCase().includes(q) || s.publicCode.includes(q)); }
    if (filters.chapter) r = r.filter((s) => s.chapterId === filters.chapter);
    if (filters.sessionType) r = r.filter((s) => s.sessionType === filters.sessionType);
    if (filters.status) r = r.filter((s) => s.status === filters.status);
    if (filters.pricing === "free") r = r.filter((s) => s.price === 0 || s.isFreePreview);
    if (filters.pricing === "paid") r = r.filter((s) => s.price > 0 && !s.isFreePreview);
    if (filters.content) {
      r = r.filter((s) => {
        const st = sessionStatsMap.get(s.id);
        if (!st) return false;
        if (filters.content === "has_video") return st.videoCount > 0;
        if (filters.content === "has_assessment") return st.assessmentCount > 0;
        if (filters.content === "has_quiz") return st.quizzesCount > 0;
        if (filters.content === "has_homework") return st.homeworkCount > 0;
        return true;
      });
    }
    return r;
  }, [allSessions, search, filters, sessionStatsMap]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * 10, page * 10);
  const chapterMap = useMemo(() => new Map(chapters.map((c) => [c.id, c.title])), [chapters]);

  const handleCreate = () => {
    if (!title.trim() || !chapterId) return;
    const ses = createSession({ courseId, chapterId, title: title.trim(), description: "", price: Number(price), currency: "USD" });
    if (sesConceptIds.length > 0) updateSession(ses.id, { conceptIds: sesConceptIds });
    setTitle(""); setPrice("0"); setSesConceptIds([]); setShowCreate(false);
  };

  const handleDuplicate = (s: typeof allSessions[0]) => {
    duplicateSession({ courseId, chapterId: s.chapterId, title: `${s.title} (Copy)`, description: s.description, price: s.price, currency: s.currency, sessionType: s.sessionType, isFreePreview: s.isFreePreview });
  };

  const published = allSessions.filter((s) => s.status === "published").length;
  const draft = allSessions.filter((s) => s.status === "draft").length;
  const paid = allSessions.filter((s) => s.price > 0 && !s.isFreePreview).length;
  const free = allSessions.length - paid;
  const totalVideos = [...sessionStatsMap.values()].reduce((a, s) => a + s.videoCount, 0);
  const totalAssessments = [...sessionStatsMap.values()].reduce((a, s) => a + s.assessmentCount, 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total", value: allSessions.length, icon: Layers, cls: "text-blue-500" },
          { label: "Published", value: published, icon: Eye, cls: "text-emerald-500" },
          { label: "Drafts", value: draft, icon: Clock, cls: "text-amber-500" },
          { label: "Paid", value: paid, icon: DollarSign, cls: "text-primary" },
          { label: "Free", value: free, icon: Gift, cls: "text-green-500" },
          { label: "Videos", value: totalVideos, icon: Video, cls: "text-blue-400" },
          { label: "Assessments", value: totalAssessments, icon: ClipboardList, cls: "text-cyan-500" },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-2 border bg-card px-3 py-2">
            <s.icon className={cn("h-4 w-4 shrink-0", s.cls)} />
            <span className="text-sm font-bold">{s.value}</span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
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
        <Card className="flex flex-col items-center gap-5 border bg-card p-16 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">{allSessions.length === 0 ? "Build your first learning experience" : "No sessions match your filters"}</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            {allSessions.length === 0
              ? "Sessions combine videos, resources, assessments, rules and rewards into what students actually learn."
              : "Try adjusting your filters or search to find sessions."}
          </p>
          {allSessions.length === 0 && (
            <Button onClick={() => setShowCreate(true)} className="rounded-xl gradient-brand border-0 text-white" size="sm">
              <Plus className="me-1.5 h-4 w-4" />Create Session
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-2">
          {paginated.map((session) => {
            const isOpen = expandedId === session.id;
            const st = sessionStatsMap.get(session.id);
            const typeMeta = SESSION_TYPE_META[session.sessionType as SessionWorkspaceType] || SESSION_TYPE_META.lesson;
            const isFree = session.price === 0 || session.isFreePreview;
            const blocksCount = (st?.videoCount || 0) + (st?.resourceCount || 0) + (st?.assessmentCount || 0);

            return (
              <Card key={session.id} className={cn("border bg-card overflow-hidden transition-colors", isOpen && "border-primary/20")}>
                {/* Collapsed card header */}
                <div className="flex items-start gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn("rounded-full text-[10px] border-0 px-1.5 py-0", typeMeta.color)}>{typeMeta.label}</Badge>
                      <span className="text-[10px] font-mono text-muted-foreground">{session.publicCode}</span>
                    </div>
                    <p className="text-sm font-semibold line-clamp-1">{session.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      {chapterMap.get(session.chapterId) && <span>{chapterMap.get(session.chapterId)}</span>}
                      <span className="flex items-center gap-1"><Video className="h-3 w-3" />{st?.videoCount || 0}</span>
                      <span className="flex items-center gap-1"><ClipboardList className="h-3 w-3" />{st?.assessmentCount || 0}</span>
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{st?.resourceCount || 0}</span>
                      {blocksCount > 0 && <span>{blocksCount} blocks</span>}
                      {isFree ? <span className="text-green-600 font-medium">Free</span> : <span className="font-medium">${session.price} {session.currency}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="outline" className={cn("rounded-full text-[10px] px-2 py-0", session.status === "published" ? "border-emerald-300 text-emerald-600" : session.status === "archived" ? "border-slate-300 text-slate-500" : "border-amber-300 text-amber-600")}>{session.status}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title={isOpen ? "Collapse" : "Preview"} onClick={() => setExpandedId(isOpen ? null : session.id)}>
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="h-7 rounded-lg text-[11px] px-2">
                      <Link to="/teacher/courses/$courseId/sessions/$sessionId" params={{ courseId, sessionId: session.id }}>
                        <Edit3 className="me-1 h-3 w-3" />Edit
                      </Link>
                    </Button>
                    {session.status === "draft" && <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => publishSession(session.id)} title="Publish"><Upload className="h-3.5 w-3.5 text-emerald-600" /></Button>}
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleDuplicate(session)} title="Duplicate"><Copy className="h-3.5 w-3.5" /></Button>
                    {session.status !== "archived" && <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => archiveSession(session.id)} title="Archive"><EyeOff className="h-3.5 w-3.5 text-amber-500" /></Button>}
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => deleteSession(session.id)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>

                {/* Expanded preview */}
                <div className={cn("grid transition-all duration-300 ease-in-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <div className="border-t px-5 py-4 space-y-4">
                      <SessionExpandedPreview session={session} stats={st} chapterName={chapterMap.get(session.chapterId)} allMaterials={allMaterials} allQuizzes={allQuizzes} allExams={allExams} allHomework={allHomework} allAssessments={allAssessments} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />
    </div>
  );
}

function SessionExpandedPreview({ session, stats, chapterName, allMaterials, allQuizzes, allExams, allHomework, allAssessments }: {
  session: { id: string; title: string; description: string; sessionType: string; price: number; currency: string; isFreePreview: boolean; accessStatus: string; openAt: string; closeAt: string; durationMinutes: number; createdAt: string; updatedAt: string };
  stats?: { materialsCount: number; videoCount: number; resourceCount: number; questionsCount: number; quizzesCount: number; examsCount: number; homeworkCount: number; assessmentCount: number };
  chapterName?: string;
  allMaterials: { id: string; title: string; type: string; sessionId?: string; linkedSessionIds?: string[]; videoDuration?: string; fileSize?: string }[];
  allQuizzes: { id: string; title: string; questionIds: string[]; durationMinutes: number; sessionIds?: string[] }[];
  allExams: { id: string; title: string; questionIds: string[]; durationMinutes: number; sessionIds?: string[] }[];
  allHomework: { id: string; title: string; homeworkType: string; sessionIds?: string[] }[];
  allAssessments: { id: string; title: string; assessmentType: string; sessionIds?: string[] }[];
}) {
  const mats = allMaterials.filter((m) => m.sessionId === session.id || m.linkedSessionIds?.includes(session.id));
  const videos = mats.filter((m) => m.type === "video");
  const resources = mats.filter((m) => m.type !== "video");
  const quizzes = allQuizzes.filter((q) => q.sessionIds?.includes(session.id));
  const exams = allExams.filter((e) => e.sessionIds?.includes(session.id));
  const homework = allHomework.filter((h) => h.sessionIds?.includes(session.id));
  const assessments = allAssessments.filter((a) => a.sessionIds?.includes(session.id));

  const isFree = session.price === 0 || session.isFreePreview;
  const typeMeta = SESSION_TYPE_META[session.sessionType as SessionWorkspaceType] || SESSION_TYPE_META.lesson;

  const SectionHead = ({ children }: { children: React.ReactNode }) => (
    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{children}</h4>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Left */}
      <div className="space-y-4">
        {/* Description */}
        <div>
          <SectionHead>Description</SectionHead>
          <p className="text-xs text-muted-foreground">{session.description || "No description yet"}</p>
        </div>

        {/* Video Playlist */}
        <div>
          <SectionHead>Video Playlist ({videos.length})</SectionHead>
          {videos.length > 0 ? (
            <div className="space-y-1">
              {videos.map((v) => (
                <div key={v.id} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs">
                  <Video className="h-3 w-3 text-blue-500 shrink-0" />
                  <span className="truncate flex-1">{v.title}</span>
                  {v.videoDuration && <span className="text-muted-foreground shrink-0">{v.videoDuration}</span>}
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-muted-foreground italic">No videos linked</p>}
        </div>

        {/* Resources */}
        <div>
          <SectionHead>Resources ({resources.length})</SectionHead>
          {resources.length > 0 ? (
            <div className="space-y-1">
              {resources.map((r) => (
                <div key={r.id} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs">
                  <FileText className="h-3 w-3 text-rose-500 shrink-0" />
                  <span className="truncate flex-1">{r.title}</span>
                  {r.fileSize && <span className="text-muted-foreground shrink-0">{r.fileSize}</span>}
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-muted-foreground italic">No resources linked</p>}
        </div>

        {/* Assessments */}
        <div>
          <SectionHead>Assessments ({quizzes.length + exams.length + homework.length + assessments.length})</SectionHead>
          {(quizzes.length + exams.length + homework.length + assessments.length) > 0 ? (
            <div className="space-y-1">
              {quizzes.map((q) => (
                <div key={q.id} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs">
                  <ClipboardList className="h-3 w-3 text-cyan-500 shrink-0" />
                  <span className="truncate flex-1">{q.title}</span>
                  <span className="text-muted-foreground shrink-0">{q.questionIds.length}Q · {q.durationMinutes}m</span>
                </div>
              ))}
              {exams.map((e) => (
                <div key={e.id} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs">
                  <ScrollText className="h-3 w-3 text-rose-500 shrink-0" />
                  <span className="truncate flex-1">{e.title}</span>
                  <span className="text-muted-foreground shrink-0">{e.questionIds.length}Q · {e.durationMinutes}m</span>
                </div>
              ))}
              {homework.map((h) => (
                <div key={h.id} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs">
                  <Pencil className="h-3 w-3 text-orange-500 shrink-0" />
                  <span className="truncate flex-1">{h.title}</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 rounded shrink-0">{h.homeworkType}</Badge>
                </div>
              ))}
              {assessments.map((a) => (
                <div key={a.id} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs">
                  <Target className="h-3 w-3 text-violet-500 shrink-0" />
                  <span className="truncate flex-1">{a.title}</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 rounded shrink-0">{a.assessmentType.replace(/_/g, " ")}</Badge>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-muted-foreground italic">No assessments linked</p>}
        </div>
      </div>

      {/* Right */}
      <div className="space-y-4">
        {/* Access & Pricing */}
        <div>
          <SectionHead>Access & Pricing</SectionHead>
          <div className="space-y-1 text-xs">
            <div className="flex items-baseline gap-2"><span className="text-muted-foreground w-24 shrink-0">Access Model</span><span className="font-medium">{isFree ? "Free" : "Paid"}{session.isFreePreview ? " (Free Preview)" : ""}</span></div>
            {!isFree && <div className="flex items-baseline gap-2"><span className="text-muted-foreground w-24 shrink-0">Price</span><span className="font-medium">${session.price} {session.currency}</span></div>}
            <div className="flex items-baseline gap-2"><span className="text-muted-foreground w-24 shrink-0">Lock Status</span><span className="font-medium">{session.accessStatus}</span></div>
            {session.durationMinutes > 0 && <div className="flex items-baseline gap-2"><span className="text-muted-foreground w-24 shrink-0">Duration</span><span className="font-medium">{session.durationMinutes} min</span></div>}
          </div>
        </div>

        {/* Schedule */}
        {(session.openAt || session.closeAt) && (
          <div>
            <SectionHead>Schedule</SectionHead>
            <div className="space-y-1 text-xs">
              {session.openAt && <div className="flex items-baseline gap-2"><span className="text-muted-foreground w-24 shrink-0">Opens</span><span className="font-medium">{new Date(session.openAt).toLocaleString()}</span></div>}
              {session.closeAt && <div className="flex items-baseline gap-2"><span className="text-muted-foreground w-24 shrink-0">Closes</span><span className="font-medium">{new Date(session.closeAt).toLocaleString()}</span></div>}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div>
          <SectionHead>Metadata</SectionHead>
          <div className="space-y-1 text-xs">
            <div className="flex items-baseline gap-2"><span className="text-muted-foreground w-24 shrink-0">Type</span><Badge className={cn("rounded-full text-[10px] border-0 px-1.5 py-0", typeMeta.color)}>{typeMeta.label}</Badge></div>
            <div className="flex items-baseline gap-2"><span className="text-muted-foreground w-24 shrink-0">Chapter</span><span className="font-medium">{chapterName || "—"}</span></div>
            <div className="flex items-baseline gap-2"><span className="text-muted-foreground w-24 shrink-0">Questions</span><span className="font-medium">{stats?.questionsCount || 0}</span></div>
            <div className="flex items-baseline gap-2"><span className="text-muted-foreground w-24 shrink-0">Created</span><span className="font-medium">{new Date(session.createdAt).toLocaleString()}</span></div>
            {session.updatedAt !== session.createdAt && <div className="flex items-baseline gap-2"><span className="text-muted-foreground w-24 shrink-0">Updated</span><span className="font-medium">{new Date(session.updatedAt).toLocaleString()}</span></div>}
          </div>
        </div>
      </div>
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
