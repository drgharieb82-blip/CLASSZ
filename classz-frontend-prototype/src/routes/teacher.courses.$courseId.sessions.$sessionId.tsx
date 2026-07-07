import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowLeft, ArrowDown, ArrowUp, BarChart3, BookOpen, Brain, Calendar,
  Check, ChevronDown, ChevronRight, ClipboardList, Clock, Crown, DollarSign,
  Eye, FileText, GripVertical, HelpCircle, Image, Layers, LayoutTemplate,
  Library, Link2, Lock, MapPin, MoreHorizontal, Pencil, Play, Plus,
  Save, Send, Settings, StickyNote, Sparkles, Target, Trash2, TrendingUp, Trophy,
  Unlock, Users, Video, Zap,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getCourseById } from "@/lib/teacher/teacher-course-store";
import { useTeacherSessionStore, getSessionById } from "@/lib/teacher/teacher-session-store";
import { getChapterById, listChapters } from "@/lib/teacher/teacher-chapter-store";
import {
  useTeacherMaterialStore, linkSegmentToSession, unlinkSegmentFromSession,
  type TeacherMaterial, type VideoSegment,
} from "@/lib/teacher/teacher-material-store";
import { useTeacherQuestionStore, type TeacherQuestion } from "@/lib/teacher/teacher-question-store";
import { useTeacherQuizStore } from "@/lib/teacher/teacher-quiz-store";
import { useTeacherExamStore } from "@/lib/teacher/teacher-exam-store";
import { useTeacherHomeworkStore } from "@/lib/teacher/teacher-homework-store";
import { useContentTreeStore, getTreeForCourse, getChildren, getCoverageSummary, type ContentTreeNode } from "@/lib/teacher/content-tree-store";
import {
  SESSION_TYPE_META, BLOCK_META, NEW_BLOCK_TYPES,
  type SessionWorkspaceType, type SessionBlockType,
} from "@/lib/teacher/session-workspace-types";

export const Route = createFileRoute("/teacher/courses/$courseId/sessions/$sessionId")({
  component: SessionBuilderPage,
});

const BLOCK_TYPES: SessionBlockType[] = [...NEW_BLOCK_TYPES];

interface CanvasBlock {
  id: string;
  type: SessionBlockType;
  title: string;
  entityId?: string;
  meta?: string;
  parentId?: string; // for segment blocks: the id of the Material the segment belongs to
  durationMinutes?: number; // known real duration (e.g. a video segment's clip length), overrides the Timeline tab's heuristic estimate
}

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function estimateBlockMinutes(block: CanvasBlock): number {
  if (block.durationMinutes != null) return block.durationMinutes;
  return block.type === "video" ? 20 : block.type === "quiz_block" || block.type === "exam_block" ? 15 : 10;
}

function SessionBuilderPage() {
  const { courseId, sessionId } = Route.useParams();
  const course = getCourseById(courseId);
  const session = getSessionById(sessionId);
  const chapter = session ? getChapterById(session.chapterId) : undefined;
  const updateSession = useTeacherSessionStore((s) => s.updateSession);
  const publishSession = useTeacherSessionStore((s) => s.publishSession);
  const archiveSession = useTeacherSessionStore((s) => s.archiveSession);

  const materials = useTeacherMaterialStore((s) =>
    s.materials.filter((m) => m.sessionId === sessionId || m.linkedSessionIds?.includes(sessionId)).sort((a, b) => a.order - b.order),
  );
  const allLibraryMaterials = useTeacherMaterialStore((s) => s.materials);
  const createMaterial = useTeacherMaterialStore((s) => s.createMaterial);
  const deleteMaterial = useTeacherMaterialStore((s) => s.deleteMaterial);
  const reorderMaterials = useTeacherMaterialStore((s) => s.reorderMaterials);
  const linkSegment = (materialId: string, segmentId: string) => linkSegmentToSession(materialId, segmentId, sessionId);
  const unlinkSegment = (materialId: string, segmentId: string) => unlinkSegmentFromSession(materialId, segmentId, sessionId);

  // Segments referencing this session, from ANY material in the library — a segment can be used
  // by a session without the whole parent Material being linked to it (no video is duplicated;
  // this only reads material.segments, it never copies them).
  const linkedSegments = useMemo(() => {
    const result: { material: TeacherMaterial; segment: VideoSegment }[] = [];
    for (const m of allLibraryMaterials) {
      for (const seg of m.segments || []) {
        if (seg.linkedSessionIds?.includes(sessionId)) result.push({ material: m, segment: seg });
      }
    }
    return result;
  }, [allLibraryMaterials, sessionId]);

  const questions = useTeacherQuestionStore((s) =>
    s.questions.filter((q) => q.sessionId === sessionId || q.sessionIds?.includes(sessionId)),
  );
  const allQuestions = useTeacherQuestionStore((s) => s.questions);

  const quizzes = useTeacherQuizStore((s) => s.quizzes.filter((q) => q.sessionIds?.includes(sessionId)));
  const allQuizzes = useTeacherQuizStore((s) => s.quizzes.filter((q) => q.courseId === courseId));
  const attachQuizToSession = useTeacherQuizStore((s) => s.attachQuizToSession);
  const detachQuizFromSession = useTeacherQuizStore((s) => s.detachQuizFromSession);

  const exams = useTeacherExamStore((s) => s.exams.filter((e) => e.sessionIds?.includes(sessionId)));
  const allExams = useTeacherExamStore((s) => s.exams.filter((e) => e.courseId === courseId));
  const attachExamToSession = useTeacherExamStore((s) => s.attachToSession);
  const detachExamFromSession = useTeacherExamStore((s) => s.detachFromSession);

  const homework = useTeacherHomeworkStore((s) => s.items.filter((h) => h.sessionIds?.includes(sessionId)));
  const allHomework = useTeacherHomeworkStore((s) => s.items.filter((h) => h.courseId === courseId));
  const attachHomeworkToSession = useTeacherHomeworkStore((s) => s.attachToSession);
  const detachHomeworkFromSession = useTeacherHomeworkStore((s) => s.detachFromSession);

  const treeNodes = useContentTreeStore((s) => s.nodes.filter((n) => n.courseId === courseId));

  const [activeTab, setActiveTab] = useState("build");
  const [leftSection, setLeftSection] = useState<string>("materials");
  const [showBlockPalette, setShowBlockPalette] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(session?.title || "");

  const canvasBlocks = useMemo<CanvasBlock[]>(() => {
    const blocks: CanvasBlock[] = [];
    materials.forEach((m, i) => {
      const typeMap: Record<string, SessionBlockType> = { video: "video", pdf: "pdf", notes: "notes", image: "image", attachment: "pdf" };
      blocks.push({ id: `mat-${m.id}`, type: typeMap[m.type] || "pdf", title: m.title, entityId: m.id, meta: m.videoDuration || m.fileSize || "" });
    });
    if (questions.length > 0) {
      blocks.push({ id: "qblock", type: "question_block", title: `Practice Questions (${questions.length})`, meta: `${questions.filter((q) => q.type === "mcq").length} MCQ` });
    }
    quizzes.forEach((q) => {
      blocks.push({ id: `quiz-${q.id}`, type: "quiz_block", title: q.title, entityId: q.id, meta: `${q.questionIds.length} Q · ${q.durationMinutes}m` });
    });
    exams.forEach((e) => {
      blocks.push({ id: `exam-${e.id}`, type: "exam_block", title: e.title, entityId: e.id, meta: `${e.questionIds.length} Q · ${e.durationMinutes}m` });
    });
    homework.forEach((h) => {
      blocks.push({ id: `hw-${h.id}`, type: "homework_block", title: h.title, entityId: h.id, meta: h.homeworkType });
    });
    linkedSegments.forEach(({ material, segment }) => {
      blocks.push({
        id: `seg-${material.id}-${segment.id}`,
        type: "video_playlist",
        title: segment.title || `${material.title} clip`,
        entityId: segment.id,
        parentId: material.id,
        meta: `${material.title} · ${formatSeconds(segment.startTime)}–${formatSeconds(segment.endTime)}`,
        durationMinutes: Math.max(1, Math.round((segment.endTime - segment.startTime) / 60)),
      });
    });
    return blocks;
  }, [materials, questions, quizzes, exams, homework, linkedSegments]);

  const coverageSummary = useMemo(() => getCoverageSummary(courseId), [courseId, treeNodes]);

  if (!course || !session) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex flex-col items-center gap-4 p-16">
          <h2 className="text-lg font-semibold">Session Not Found</h2>
          <Button asChild variant="outline" className="rounded-xl"><Link to="/teacher/courses">Back to Courses</Link></Button>
        </div>
      </DashboardLayout>
    );
  }

  const typeMeta = SESSION_TYPE_META[session.sessionType as SessionWorkspaceType] || SESSION_TYPE_META.lesson;

  const handleSaveTitle = () => {
    if (titleDraft.trim() && titleDraft !== session.title) {
      updateSession(sessionId, { title: titleDraft.trim() });
    }
    setEditingTitle(false);
  };

  const isMaterialBlock = (block: CanvasBlock) => block.id.startsWith("mat-");

  const moveBlock = (index: number, direction: -1 | 1) => {
    // Canvas ordering is only meaningful within the Materials group today —
    // quiz/exam/homework blocks have no shared position field to reorder against.
    const matIds = materials.map((m) => m.id);
    const target = index + direction;
    if (target < 0 || target >= matIds.length) return;
    [matIds[index], matIds[target]] = [matIds[target], matIds[index]];
    reorderMaterials(sessionId, matIds);
  };

  const removeBlock = (block: CanvasBlock) => {
    if (!block.entityId) return;
    if (block.type === "quiz_block") detachQuizFromSession(block.entityId, sessionId);
    else if (block.type === "exam_block") detachExamFromSession(block.entityId, sessionId);
    else if (block.type === "homework_block") detachHomeworkFromSession(block.entityId, sessionId);
    else if (block.id.startsWith("seg-") && block.parentId) unlinkSegment(block.parentId, block.entityId);
    else deleteMaterial(block.entityId);
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-4">
        {/* Top Toolbar */}
        <div className="flex items-center gap-3">
          <Link to="/teacher/courses/$courseId/sessions" params={{ courseId }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="min-w-0 flex-1">
            {editingTitle ? (
              <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                autoFocus
                className="h-8 rounded-lg text-sm font-semibold max-w-sm"
              />
            ) : (
              <button onClick={() => { setTitleDraft(session.title); setEditingTitle(true); }} className="flex items-center gap-2 text-start hover:bg-accent rounded-lg px-2 py-1 -ms-2 transition-colors">
                <h1 className="font-semibold text-lg truncate">{session.title}</h1>
                <Pencil className="h-3 w-3 text-muted-foreground shrink-0" />
              </button>
            )}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 px-2">
              <span className="font-mono">{session.publicCode}</span>
              <span className="opacity-40">|</span>
              <Badge className={cn("rounded-full text-[10px] border-0 px-1.5 py-0", typeMeta.color)}>{typeMeta.label}</Badge>
              <span className="opacity-40">|</span>
              <span>{chapter?.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="rounded-xl text-xs h-8 gap-1.5">
              <Save className="h-3.5 w-3.5" />Save Draft
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl text-xs h-8 gap-1.5">
              <Eye className="h-3.5 w-3.5" />Preview
            </Button>
            {session.status === "draft" ? (
              <Button onClick={() => publishSession(sessionId)} className="rounded-xl gradient-brand border-0 text-white text-xs h-8 gap-1.5 shadow-md" size="sm">
                <Send className="h-3.5 w-3.5" />Publish
              </Button>
            ) : (
              <Badge variant="outline" className="rounded-full border-emerald-300 text-emerald-600 px-3 py-1">Published</Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem><LayoutTemplate className="me-2 h-3.5 w-3.5" />Change Template</DropdownMenuItem>
                <DropdownMenuItem><Users className="me-2 h-3.5 w-3.5" />Assign Team</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => archiveSession(sessionId)} className="text-amber-600"><Library className="me-2 h-3.5 w-3.5" />Archive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Builder Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start rounded-xl bg-muted/50 p-1">
            {[
              { value: "build", label: "Build", icon: Layers },
              { value: "timeline", label: "Timeline", icon: Clock },
              { value: "coverage", label: "Coverage", icon: Target },
              { value: "settings", label: "Settings", icon: Settings },
              { value: "analytics", label: "Analytics", icon: BarChart3 },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 rounded-lg text-xs data-[state=active]:shadow-sm">
                <tab.icon className="h-3.5 w-3.5" />{tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ═══════════════════ BUILD TAB ═══════════════════ */}
          <TabsContent value="build" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-4">
              {/* ── LEFT PANEL ── */}
              <div className="space-y-3">
                {/* Section Switcher */}
                <div className="flex rounded-xl border overflow-hidden text-xs">
                  {([
                    { key: "tree", label: "Tree", icon: Target },
                    { key: "materials", label: "Materials", icon: Video },
                    { key: "questions", label: "Questions", icon: HelpCircle },
                    { key: "assess", label: "Assess", icon: ClipboardList },
                  ] as const).map((s) => (
                    <button key={s.key} onClick={() => setLeftSection(s.key)} className={cn("flex-1 flex items-center justify-center gap-1 py-2 font-medium transition-colors", leftSection === s.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>
                      <s.icon className="h-3 w-3" />
                      <span className="hidden xl:inline">{s.label}</span>
                    </button>
                  ))}
                </div>

                <Card className="border bg-card overflow-hidden">
                  <div className="max-h-[32rem] overflow-y-auto">
                    <div className="p-3 space-y-1">
                      {/* Content Tree */}
                      {leftSection === "tree" && (
                        <>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">Content Tree</p>
                          {treeNodes.filter((n) => n.type === "chapter" && !n.parentId).length === 0 ? (
                            <p className="text-xs text-muted-foreground px-1">No content tree for this course.</p>
                          ) : (
                            treeNodes.filter((n) => n.type === "chapter" && !n.parentId).sort((a, b) => a.order - b.order).map((chap) => (
                              <TreeBranch key={chap.id} node={chap} nodes={treeNodes} depth={0} />
                            ))
                          )}
                        </>
                      )}

                      {/* Materials Library */}
                      {leftSection === "materials" && (
                        <>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">Materials Library</p>
                          {allLibraryMaterials.length === 0 ? (
                            <p className="text-xs text-muted-foreground px-1">No materials yet.</p>
                          ) : (
                            allLibraryMaterials.slice(0, 30).map((m) => (
                              <LibraryItem
                                key={m.id}
                                material={m}
                                isLinked={materials.some((mat) => mat.id === m.id)}
                                sessionId={sessionId}
                                onLinkSegment={linkSegment}
                                onUnlinkSegment={unlinkSegment}
                              />
                            ))
                          )}
                        </>
                      )}

                      {/* Question Bank */}
                      {leftSection === "questions" && (
                        <>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">Question Bank</p>
                          {allQuestions.length === 0 ? (
                            <p className="text-xs text-muted-foreground px-1">No questions yet.</p>
                          ) : (
                            allQuestions.slice(0, 30).map((q) => (
                              <QuestionItem key={q.id} question={q} isLinked={questions.some((qu) => qu.id === q.id)} />
                            ))
                          )}
                        </>
                      )}

                      {/* Assessments */}
                      {leftSection === "assess" && (
                        <>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">Quizzes</p>
                          {allQuizzes.length === 0 ? (
                            <p className="text-xs text-muted-foreground px-1 mb-3">No quizzes.</p>
                          ) : (
                            allQuizzes.map((q) => {
                              const isLinked = quizzes.some((qq) => qq.id === q.id);
                              return (
                                <button
                                  key={q.id}
                                  onClick={() => (isLinked ? detachQuizFromSession(q.id, sessionId) : attachQuizToSession(q.id, sessionId))}
                                  className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs mb-1 w-full text-start transition-colors", isLinked ? "border-primary/30 bg-primary/5" : "hover:bg-accent/50")}
                                >
                                  <ClipboardList className="h-3 w-3 text-cyan-500 shrink-0" />
                                  <span className="truncate flex-1">{q.title}</span>
                                  {isLinked && <Check className="h-3 w-3 text-primary shrink-0" />}
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 rounded shrink-0">{q.questionIds.length}Q</Badge>
                                </button>
                              );
                            })
                          )}
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2 mt-4">Exams</p>
                          {allExams.length === 0 ? (
                            <p className="text-xs text-muted-foreground px-1 mb-3">No exams.</p>
                          ) : (
                            allExams.map((e) => {
                              const isLinked = exams.some((ee) => ee.id === e.id);
                              return (
                                <button
                                  key={e.id}
                                  onClick={() => (isLinked ? detachExamFromSession(e.id, sessionId) : attachExamToSession(e.id, sessionId))}
                                  className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs mb-1 w-full text-start transition-colors", isLinked ? "border-primary/30 bg-primary/5" : "hover:bg-accent/50")}
                                >
                                  <BookOpen className="h-3 w-3 text-rose-500 shrink-0" />
                                  <span className="truncate flex-1">{e.title}</span>
                                  {isLinked && <Check className="h-3 w-3 text-primary shrink-0" />}
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 rounded shrink-0">{e.questionIds.length}Q</Badge>
                                </button>
                              );
                            })
                          )}
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2 mt-4">Homework</p>
                          {allHomework.length === 0 ? (
                            <p className="text-xs text-muted-foreground px-1">No homework.</p>
                          ) : (
                            allHomework.map((h) => {
                              const isLinked = homework.some((hh) => hh.id === h.id);
                              return (
                                <button
                                  key={h.id}
                                  onClick={() => (isLinked ? detachHomeworkFromSession(h.id, sessionId) : attachHomeworkToSession(h.id, sessionId))}
                                  className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs mb-1 w-full text-start transition-colors", isLinked ? "border-primary/30 bg-primary/5" : "hover:bg-accent/50")}
                                >
                                  <Pencil className="h-3 w-3 text-orange-500 shrink-0" />
                                  <span className="truncate flex-1">{h.title}</span>
                                  {isLinked && <Check className="h-3 w-3 text-primary shrink-0" />}
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 rounded shrink-0">{h.homeworkType}</Badge>
                                </button>
                              );
                            })
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* ── CENTER: SESSION CANVAS ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />Session Canvas
                    <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0">{canvasBlocks.length} blocks</Badge>
                  </h3>
                  <Button variant="outline" size="sm" className="rounded-lg text-xs h-7 gap-1" onClick={() => setShowBlockPalette(!showBlockPalette)}>
                    <Plus className="h-3 w-3" />Add Block
                  </Button>
                </div>

                {/* Block Palette */}
                {showBlockPalette && (
                  <Card className="border-2 border-dashed border-primary/30 bg-primary/5 p-3">
                    <p className="text-xs font-medium mb-2">Choose a block type:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {BLOCK_TYPES.map((bt) => {
                        const meta = BLOCK_META[bt];
                        return (
                          <button
                            key={bt}
                            onClick={() => {
                              createMaterial({
                                sessionId, courseId, chapterId: session.chapterId,
                                type: bt === "video" ? "video" : bt === "notes" ? "notes" : bt === "image" ? "image" : "pdf",
                                title: `New ${meta.label}`,
                              });
                              setShowBlockPalette(false);
                            }}
                            className={cn("flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-medium transition-all hover:border-primary/40 hover:bg-primary/5", meta.color)}
                          >
                            <span className="text-base">{meta.icon}</span>
                            <span className="text-[10px]">{meta.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* Canvas Content */}
                <Card className="border bg-card overflow-hidden">
                  <div className="max-h-[36rem] overflow-y-auto">
                    {canvasBlocks.length === 0 ? (
                      <div className="flex flex-col items-center gap-4 p-12 text-center">
                        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10">
                          <Sparkles className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="text-base font-semibold">Start building this session</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Add blocks from the palette above, or drag content from the left panel to build your learning experience.
                        </p>
                        <Button variant="outline" className="rounded-xl gap-1.5 mt-2" size="sm" onClick={() => setShowBlockPalette(true)}>
                          <Plus className="h-4 w-4" />Add First Block
                        </Button>
                      </div>
                    ) : (
                      <div className="p-3 space-y-2">
                        {canvasBlocks.map((block, index) => {
                          const meta = BLOCK_META[block.type];
                          return (
                            <div key={block.id} className={cn("group flex items-center gap-2 rounded-xl border p-3 transition-all hover:shadow-sm hover:border-primary/20", meta.color)}>
                              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-60 transition-opacity cursor-grab shrink-0">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-background/80 text-base shadow-sm">
                                {meta.icon}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{block.title}</p>
                                <p className="text-[11px] text-muted-foreground">{meta.label}{block.meta ? ` · ${block.meta}` : ""}</p>
                              </div>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                {block.entityId && block.type !== "question_block" && (
                                  <>
                                    {isMaterialBlock(block) && (
                                      <>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => moveBlock(index, -1)}>
                                          <ArrowUp className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => moveBlock(index, 1)}>
                                          <ArrowDown className="h-3 w-3" />
                                        </Button>
                                      </>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => removeBlock(block)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Drop zone hint */}
                        <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 p-4 text-center mt-2">
                          <p className="text-xs text-muted-foreground">Drop content here or click Add Block</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div>
                <Card className="border bg-card overflow-hidden">
                  <div className="max-h-[36rem] overflow-y-auto">
                    <div className="p-4 space-y-5">
                      {/* Session Properties */}
                      <section>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                          <Settings className="h-3 w-3" />Properties
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-[11px]">Session Type</Label>
                            <select
                              value={session.sessionType}
                              onChange={(e) => updateSession(sessionId, { sessionType: e.target.value as any })}
                              className="w-full h-8 rounded-lg border bg-background px-2.5 text-xs mt-1"
                            >
                              {(["lesson", "revision", "practice", "quiz", "exam", "homework", "mixed"] as const).map((t) => (
                                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label className="text-[11px]">Description</Label>
                            <textarea
                              value={session.description}
                              onChange={(e) => updateSession(sessionId, { description: e.target.value })}
                              rows={2}
                              placeholder="Session description..."
                              className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-xs resize-none mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-[11px]">Duration (minutes)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={session.durationMinutes}
                              onChange={(e) => updateSession(sessionId, { durationMinutes: Number(e.target.value) })}
                              className="h-8 rounded-lg text-xs mt-1"
                            />
                          </div>
                        </div>
                      </section>

                      <div className="border-t" />

                      {/* Access & Pricing */}
                      <section>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                          <DollarSign className="h-3 w-3" />Access & Pricing
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-[11px]">Price (USD)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={session.price}
                              onChange={(e) => updateSession(sessionId, { price: Number(e.target.value) })}
                              className="h-8 rounded-lg text-xs mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-[11px]">Access Status</Label>
                            <select
                              value={session.accessStatus}
                              onChange={(e) => updateSession(sessionId, { accessStatus: e.target.value as any })}
                              className="w-full h-8 rounded-lg border bg-background px-2.5 text-xs mt-1"
                            >
                              <option value="locked">Locked</option>
                              <option value="unlocked">Unlocked</option>
                              <option value="scheduled">Scheduled</option>
                            </select>
                          </div>
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={session.isFreePreview}
                              onChange={(e) => updateSession(sessionId, { isFreePreview: e.target.checked })}
                              className="rounded"
                            />
                            Free Preview
                          </label>
                        </div>
                      </section>

                      <div className="border-t" />

                      {/* Release Schedule */}
                      <section>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />Release Schedule
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-[11px]">Open At</Label>
                            <Input
                              type="datetime-local"
                              value={session.openAt}
                              onChange={(e) => updateSession(sessionId, { openAt: e.target.value })}
                              className="h-8 rounded-lg text-xs mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-[11px]">Close At</Label>
                            <Input
                              type="datetime-local"
                              value={session.closeAt}
                              onChange={(e) => updateSession(sessionId, { closeAt: e.target.value })}
                              className="h-8 rounded-lg text-xs mt-1"
                            />
                          </div>
                        </div>
                      </section>

                      <div className="border-t" />

                      {/* Completion Rules */}
                      <section>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                          <Check className="h-3 w-3" />Completion Rules
                        </h4>
                        <div className="space-y-2">
                          {[
                            { label: "Watch 80% of video content", active: true },
                            { label: "Answer all practice questions", active: false },
                            { label: "Score 60%+ on quiz", active: false },
                            { label: "Submit homework", active: false },
                          ].map((rule) => (
                            <label key={rule.label} className="flex items-center gap-2 text-xs cursor-pointer">
                              <input type="checkbox" defaultChecked={rule.active} className="rounded" />
                              <span className={rule.active ? "" : "text-muted-foreground"}>{rule.label}</span>
                            </label>
                          ))}
                        </div>
                      </section>

                      <div className="border-t" />

                      {/* Rewards */}
                      <section>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                          <Trophy className="h-3 w-3" />Rewards
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[11px]">XP</Label>
                            <Input type="number" min="0" defaultValue="50" className="h-8 rounded-lg text-xs mt-1" />
                          </div>
                          <div>
                            <Label className="text-[11px]">Coins</Label>
                            <Input type="number" min="0" defaultValue="10" className="h-8 rounded-lg text-xs mt-1" />
                          </div>
                        </div>
                      </section>

                      <div className="border-t" />

                      {/* Preview & Publish */}
                      <section className="space-y-2">
                        <Button variant="outline" className="w-full rounded-xl text-xs h-9 gap-1.5">
                          <Eye className="h-3.5 w-3.5" />Preview as Student
                        </Button>
                        {session.status === "draft" ? (
                          <Button onClick={() => publishSession(sessionId)} className="w-full rounded-xl gradient-brand border-0 text-white text-xs h-9 gap-1.5 shadow-md">
                            <Send className="h-3.5 w-3.5" />Publish Session
                          </Button>
                        ) : (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-500/5 p-3 text-center">
                            <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 border-0">
                              <Check className="me-1 h-3 w-3" />Published
                            </Badge>
                          </div>
                        )}
                      </section>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════════════ TIMELINE TAB ═══════════════════ */}
          <TabsContent value="timeline" className="mt-4">
            <Card className="border bg-card p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-5">
                <Clock className="h-4 w-4 text-primary" />Session Timeline
              </h3>
              {canvasBlocks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No blocks yet. Add content in the Build tab to see the timeline.</p>
              ) : (
                <div className="relative ps-8 space-y-0">
                  {/* Timeline line */}
                  <div className="absolute start-3 top-0 bottom-0 w-px bg-border" />

                  {canvasBlocks.map((block, index) => {
                    const meta = BLOCK_META[block.type];
                    const estimatedMin = estimateBlockMinutes(block);
                    return (
                      <div key={block.id} className="relative pb-6 last:pb-0">
                        {/* Timeline dot */}
                        <div className={cn("absolute -start-5 top-1 grid h-6 w-6 place-items-center rounded-full border-2 bg-background text-xs", meta.color.split(" ")[0])}>
                          <span className="text-[10px]">{meta.icon}</span>
                        </div>

                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{block.title}</p>
                            <p className="text-[11px] text-muted-foreground">{meta.label}{block.meta ? ` · ${block.meta}` : ""}</p>
                          </div>
                          <Badge variant="outline" className="rounded-full text-[10px] px-2 py-0 shrink-0">~{estimatedMin}min</Badge>
                        </div>
                      </div>
                    );
                  })}

                  {/* Total */}
                  <div className="relative pt-2">
                    <div className="absolute -start-5 top-3 grid h-6 w-6 place-items-center rounded-full bg-primary text-white text-[10px]">
                      <Check className="h-3 w-3" />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <p className="text-sm font-semibold">Session Complete</p>
                      <Badge className="rounded-full bg-primary/10 text-primary border-0 text-[10px]">
                        ~{canvasBlocks.reduce((a, b) => a + estimateBlockMinutes(b), 0)} min total
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ═══════════════════ COVERAGE TAB ═══════════════════ */}
          <TabsContent value="coverage" className="mt-4">
            <div className="space-y-4">
              {/* Coverage Summary */}
              <Card className="border bg-card p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Target className="h-4 w-4 text-primary" />Course Coverage
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium">Overall Coverage</span>
                      <span className="font-bold text-primary">{coverageSummary.coveragePercent}%</span>
                    </div>
                    <Progress value={coverageSummary.coveragePercent} className="h-2.5 rounded-full" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Chapters", total: coverageSummary.chapters.total, covered: coverageSummary.chapters.covered, icon: BookOpen, cls: "text-blue-600" },
                    { label: "Lessons", total: coverageSummary.lessons.total, covered: coverageSummary.lessons.covered, icon: Play, cls: "text-emerald-600" },
                    { label: "Concepts", total: coverageSummary.concepts.total, covered: coverageSummary.concepts.covered, icon: Brain, cls: "text-violet-600" },
                    { label: "Atomic Concepts", total: coverageSummary.atomicConcepts.total, covered: coverageSummary.atomicConcepts.covered, icon: Zap, cls: "text-amber-600" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border p-3.5">
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className={cn("h-4 w-4", item.cls)} />
                        <span className="text-xs font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold">{item.covered}</span>
                        <span className="text-xs text-muted-foreground">/ {item.total}</span>
                      </div>
                      <Progress value={item.total > 0 ? (item.covered / item.total) * 100 : 0} className="h-1.5 rounded-full mt-2" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Concept Cards */}
              <Card className="border bg-card p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Brain className="h-4 w-4 text-violet-500" />Concept Coverage Detail
                </h3>
                {treeNodes.filter((n) => n.type === "concept" && !n.isHidden).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No concepts defined in content tree.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {treeNodes.filter((n) => n.type === "concept" && !n.isHidden).sort((a, b) => a.order - b.order).map((concept) => {
                      const atomics = treeNodes.filter((n) => n.parentId === concept.id && n.type === "atomic_concept");
                      const coveredAtomics = atomics.filter((a) => a.coverageStatus === "covered" || a.coverageStatus === "extra");
                      return (
                        <div key={concept.id} className={cn("rounded-xl border p-3 transition-colors", concept.coverageStatus === "covered" ? "border-emerald-200 bg-emerald-500/5" : concept.coverageStatus === "partial" ? "border-amber-200 bg-amber-500/5" : "border-muted")}>
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-medium truncate">{concept.title}</p>
                            <CoverageChip status={concept.coverageStatus} />
                          </div>
                          <p className="text-[11px] text-muted-foreground">{coveredAtomics.length}/{atomics.length} atomic concepts</p>
                          <Progress value={atomics.length > 0 ? (coveredAtomics.length / atomics.length) * 100 : 0} className="h-1 rounded-full mt-1.5" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════════ SETTINGS TAB ═══════════════════ */}
          <TabsContent value="settings" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Pricing & Access */}
              <Card className="border bg-card p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <DollarSign className="h-4 w-4 text-primary" />Pricing & Access
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Price</Label>
                      <Input type="number" min="0" value={session.price} onChange={(e) => updateSession(sessionId, { price: Number(e.target.value) })} className="rounded-xl mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Currency</Label>
                      <select value={session.currency} onChange={(e) => updateSession(sessionId, { currency: e.target.value })} className="w-full h-10 rounded-xl border bg-background px-3 text-sm mt-1">
                        <option value="USD">USD</option>
                        <option value="EGP">EGP</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Access Status</Label>
                    <div className="flex gap-2 mt-1.5">
                      {(["locked", "unlocked", "scheduled"] as const).map((a) => (
                        <button
                          key={a}
                          onClick={() => updateSession(sessionId, { accessStatus: a })}
                          className={cn(
                            "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                            session.accessStatus === a ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent",
                          )}
                        >
                          {a === "locked" ? <Lock className="h-3 w-3" /> : a === "unlocked" ? <Unlock className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {a.charAt(0).toUpperCase() + a.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={session.isFreePreview} onChange={(e) => updateSession(sessionId, { isFreePreview: e.target.checked })} className="rounded" />
                    Mark as Free Preview
                  </label>
                </div>
              </Card>

              {/* Target Students */}
              <Card className="border bg-card p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-violet-500" />Target Students
                </h3>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Students", desc: "Available to everyone enrolled" },
                    { value: "country", label: "By Country", desc: "Restrict to specific countries" },
                    { value: "group", label: "By Group", desc: "Available to student groups only" },
                    { value: "weak_students", label: "Weak Students", desc: "Extra support for struggling students" },
                    { value: "scholarship", label: "Scholarship", desc: "Free access for scholarship holders" },
                  ].map((opt) => (
                    <div key={opt.value} className="flex items-center gap-3 rounded-xl border p-3 hover:bg-accent/30 transition-colors">
                      <input type="radio" name="target" defaultChecked={opt.value === "all"} className="rounded-full" />
                      <div>
                        <p className="text-sm font-medium">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Prerequisites */}
              <Card className="border bg-card p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Link2 className="h-4 w-4 text-amber-500" />Prerequisites
                </h3>
                <p className="text-sm text-muted-foreground mb-3">Sessions that must be completed before this one unlocks.</p>
                <div className="rounded-xl border-2 border-dashed p-6 text-center">
                  <MapPin className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No prerequisites set. Students can access this session freely.</p>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs mt-3 gap-1">
                    <Plus className="h-3 w-3" />Add Prerequisite
                  </Button>
                </div>
              </Card>

              {/* Schedule */}
              <Card className="border bg-card p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-blue-500" />Schedule
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Open Date & Time</Label>
                    <Input type="datetime-local" value={session.openAt} onChange={(e) => updateSession(sessionId, { openAt: e.target.value })} className="rounded-xl mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Close Date & Time</Label>
                    <Input type="datetime-local" value={session.closeAt} onChange={(e) => updateSession(sessionId, { closeAt: e.target.value })} className="rounded-xl mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Estimated Duration (minutes)</Label>
                    <Input type="number" min="0" value={session.durationMinutes} onChange={(e) => updateSession(sessionId, { durationMinutes: Number(e.target.value) })} className="rounded-xl mt-1" />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════════ ANALYTICS TAB ═══════════════════ */}
          <TabsContent value="analytics" className="mt-4">
            <Card className="flex flex-col items-center gap-5 border bg-gradient-to-br from-primary/5 via-card to-violet-500/5 p-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Session Analytics</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Detailed engagement metrics, completion rates, quiz performance, and student progress analytics will appear here.
              </p>
              <div className="grid gap-3 sm:grid-cols-3 w-full max-w-lg mt-2">
                {[
                  { label: "Completion Rate", mock: "78%", icon: Check },
                  { label: "Avg. Quiz Score", mock: "85%", icon: ClipboardList },
                  { label: "Engagement", mock: "92%", icon: TrendingUp },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border p-4 text-center bg-background/50">
                    <m.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-xl font-bold">{m.mock}</p>
                    <p className="text-[11px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
              <Badge variant="outline" className="rounded-full mt-2">Coming Soon</Badge>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

/* ── Helper Components ── */

function TreeBranch({ node, nodes, depth }: { node: ContentTreeNode; nodes: ContentTreeNode[]; depth: number }) {
  const [open, setOpen] = useState(depth < 1);
  const children = nodes.filter((n) => n.parentId === node.id).sort((a, b) => a.order - b.order);
  const hasChildren = children.length > 0;
  const typeColors: Record<string, string> = {
    chapter: "text-blue-500", lesson: "text-emerald-500", concept: "text-violet-500", atomic_concept: "text-amber-500",
  };

  return (
    <div>
      <button
        onClick={() => hasChildren && setOpen(!open)}
        className={cn("flex items-center gap-1.5 w-full rounded-lg px-1.5 py-1 text-xs hover:bg-accent/50 transition-colors text-start")}
        style={{ paddingLeft: `${depth * 12 + 6}px` }}
      >
        {hasChildren ? (
          open ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", typeColors[node.type] ? `bg-current ${typeColors[node.type]}` : "bg-muted-foreground")} />
        <span className="truncate flex-1">{node.title}</span>
        <CoverageChip status={node.coverageStatus} />
      </button>
      {open && children.map((child) => (
        <TreeBranch key={child.id} node={child} nodes={nodes} depth={depth + 1} />
      ))}
    </div>
  );
}

function CoverageChip({ status }: { status: string }) {
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
      {status.replace("_", " ")}
    </span>
  );
}

function LibraryItem({
  material, isLinked, sessionId, onLinkSegment, onUnlinkSegment,
}: {
  material: TeacherMaterial; isLinked: boolean; sessionId: string;
  onLinkSegment: (materialId: string, segmentId: string) => void;
  onUnlinkSegment: (materialId: string, segmentId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const icons: Record<string, typeof Video> = { video: Video, pdf: FileText, image: Image, attachment: FileText, notes: StickyNote };
  const Icon = icons[material.type] || FileText;
  const colors: Record<string, string> = { video: "text-blue-500", pdf: "text-rose-500", image: "text-emerald-500", attachment: "text-amber-500", notes: "text-violet-500" };
  const segments = material.type === "video" ? material.segments || [] : [];
  const hasSegments = segments.length > 0;

  return (
    <div className="mb-1">
      <div className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition-colors", isLinked ? "border-primary/30 bg-primary/5" : "hover:bg-accent/50")}>
        <Icon className={cn("h-3 w-3 shrink-0", colors[material.type])} />
        <span className="truncate flex-1">{material.title}</span>
        {isLinked && <Check className="h-3 w-3 text-primary shrink-0" />}
        {material.videoDuration && <span className="text-[10px] text-muted-foreground shrink-0">{material.videoDuration}</span>}
        {hasSegments && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 rounded p-0.5 hover:bg-accent transition-colors"
            title={`${segments.length} segment${segments.length === 1 ? "" : "s"}`}
          >
            {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </button>
        )}
      </div>
      {hasSegments && expanded && (
        <div className="ms-4 mt-1 space-y-1">
          {segments.map((seg) => {
            const segLinked = seg.linkedSessionIds?.includes(sessionId) ?? false;
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => (segLinked ? onUnlinkSegment(material.id, seg.id) : onLinkSegment(material.id, seg.id))}
                className={cn(
                  "flex items-center gap-1.5 w-full rounded-md border px-2 py-1 text-[11px] text-start transition-colors",
                  segLinked ? "border-primary/30 bg-primary/5" : "hover:bg-accent/50",
                )}
              >
                <Play className="h-2.5 w-2.5 text-blue-400 shrink-0" />
                <span className="truncate flex-1">{seg.title || "Untitled segment"}</span>
                {segLinked && <Check className="h-2.5 w-2.5 text-primary shrink-0" />}
                <span className="text-muted-foreground shrink-0">{formatSeconds(seg.startTime)}–{formatSeconds(seg.endTime)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function QuestionItem({ question, isLinked }: { question: TeacherQuestion; isLinked: boolean }) {
  const typeColors: Record<string, string> = { mcq: "text-blue-500", essay: "text-violet-500", calculation: "text-emerald-500" };
  const diffColors: Record<string, string> = { easy: "text-emerald-500", medium: "text-amber-500", hard: "text-rose-500" };
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs mb-1 transition-colors", isLinked ? "border-primary/30 bg-primary/5" : "hover:bg-accent/50")}>
      <HelpCircle className={cn("h-3 w-3 shrink-0", typeColors[question.type])} />
      <span className="truncate flex-1">{question.text}</span>
      {isLinked && <Check className="h-3 w-3 text-primary shrink-0" />}
      <span className={cn("text-[9px] font-medium shrink-0", diffColors[question.difficulty])}>{question.difficulty}</span>
    </div>
  );
}

