import { Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  Layers,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTeacherAssessmentStore, ASSESSMENT_TYPE_LABELS, createAssessmentPreset, type AssessmentStatus, type AssessmentType, type TeacherAssessment } from "@/lib/teacher/teacher-assessment-store";
import { useTeacherChapterStore } from "@/lib/teacher/teacher-chapter-store";
import { useContentTreeStore, type ContentTreeNode } from "@/lib/teacher/content-tree-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { useTeacherLessonStore } from "@/lib/teacher/teacher-lesson-store";
import { useTeacherQuestionStore, type TeacherQuestion } from "@/lib/teacher/teacher-question-store";
import { useTeacherSessionStore } from "@/lib/teacher/teacher-session-store";
import { cn } from "@/lib/utils";
import { AssessmentWorkspace } from "@/components/teacher/AssessmentWorkspace";

const TYPE_OPTIONS = Object.entries(ASSESSMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];
const VISIBILITY_OPTIONS = [
  { value: "private", label: "Private" },
  { value: "course", label: "Course" },
  { value: "enrolled_only", label: "Enrolled Only" },
  { value: "public", label: "Public" },
];
const QUESTION_OPTIONAL_TYPES: AssessmentType[] = ["assignment", "project", "research", "presentation", "custom"];
const TEMPLATE_PRESETS: Array<{ key: string; label: string; description: string; type: AssessmentType }> = [
  { key: "chapter_quiz", label: "Chapter Quiz", description: "Fast chapter checkpoint with shuffled questions.", type: "practice_quiz" },
  { key: "homework", label: "Homework", description: "Take-home practice with due dates and late handling.", type: "homework" },
  { key: "weekly_exam", label: "Weekly Exam", description: "Timed assessment with score and passing rule.", type: "exam" },
  { key: "final_exam", label: "Final Exam", description: "Strict timer and no answer reveal by default.", type: "final_exam" },
  { key: "diagnostic", label: "Diagnostic", description: "Measure gaps before or after instruction.", type: "diagnostic_test" },
  { key: "assignment", label: "Assignment", description: "Manual review workflow with instructions or uploads.", type: "assignment" },
  { key: "custom", label: "Custom", description: "Start from a blank draft and configure everything.", type: "custom" },
];

export function AssessmentEngineTab({ courseId }: { courseId: string }) {
  const allAssessments = useTeacherAssessmentStore((state) => state.assessments);
  const createAssessment = useTeacherAssessmentStore((state) => state.createAssessment);
  const deleteAssessment = useTeacherAssessmentStore((state) => state.deleteAssessment);
  const publishAssessment = useTeacherAssessmentStore((state) => state.publishAssessment);
  const unpublishAssessment = useTeacherAssessmentStore((state) => state.unpublishAssessment);
  const archiveAssessment = useTeacherAssessmentStore((state) => state.archiveAssessment);
  const duplicateAssessment = useTeacherAssessmentStore((state) => state.duplicateAssessment);
  const questions = useTeacherQuestionStore((state) => state.questions);
  const courses = useTeacherCourseStore((state) => state.courses);
  const chapters = useTeacherChapterStore((state) => state.chapters);
  const lessons = useTeacherLessonStore((state) => state.lessons);
  const treeNodes = useContentTreeStore((state) => state.nodes);
  const sessions = useTeacherSessionStore((state) => state.sessions);
  const assessments = useMemo(
    () => allAssessments.filter((assessment) => (assessment.courseIds || []).includes(courseId) || (assessment.courseIds || []).length === 0),
    [allAssessments, courseId],
  );

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [builderView, setBuilderView] = useState<{ mode: "list" } | { mode: "create" } | { mode: "edit"; assessmentId: string }>({ mode: "list" });

  const filterOptions: FilterOption[] = [
    { key: "type", label: "Type", options: TYPE_OPTIONS },
    { key: "status", label: "Status", options: STATUS_OPTIONS },
    { key: "visibility", label: "Visibility", options: VISIBILITY_OPTIONS },
    {
      key: "course",
      label: "Course",
      options: courses
        .filter((course) => assessments.some((assessment) => (assessment.courseIds || []).includes(course.id)))
        .map((course) => ({ value: course.id, label: course.title })),
    },
    {
      key: "chapter",
      label: "Chapter",
      options: chapters
        .filter((chapter) => assessments.some((assessment) => (assessment.chapterIds || []).includes(chapter.id)))
        .map((chapter) => ({ value: chapter.id, label: chapter.title })),
    },
    {
      key: "lesson",
      label: "Lesson",
      options: lessons
        .filter((lesson) => assessments.some((assessment) => (assessment.lessonIds || []).includes(lesson.id)))
        .map((lesson) => ({ value: lesson.id, label: lesson.title })),
    },
    {
      key: "concept",
      label: "Concept",
      options: treeNodes
        .filter((node) => node.type === "concept" && assessments.some((assessment) => (assessment.conceptIds || []).includes(node.id)))
        .map((node) => ({ value: node.id, label: node.title })),
    },
    {
      key: "atomic",
      label: "Atomic Concept",
      options: treeNodes
        .filter((node) => node.type === "atomic_concept" && assessments.some((assessment) => (assessment.atomicConceptIds || []).includes(node.id)))
        .map((node) => ({ value: node.id, label: node.title })),
    },
    { key: "usedInSessions", label: "Used in Sessions", options: [{ value: "yes", label: "Used in Sessions" }, { value: "no", label: "Not Used in Sessions" }] },
  ];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assessments.filter((assessment) => {
      const matchesSearch = !query
        || assessment.title.toLowerCase().includes(query)
        || assessment.publicCode.toLowerCase().includes(query)
        || (assessment.description || "").toLowerCase().includes(query)
        || (assessment.subtitle || "").toLowerCase().includes(query);
      const matchesType = !filters.type || assessment.assessmentType === filters.type;
      const matchesStatus = !filters.status || assessment.status === filters.status;
      const matchesVisibility = !filters.visibility || (assessment.visibility || "enrolled_only") === filters.visibility;
      const matchesCourse = !filters.course || (assessment.courseIds || []).includes(filters.course);
      const matchesChapter = !filters.chapter || (assessment.chapterIds || []).includes(filters.chapter);
      const matchesLesson = !filters.lesson || (assessment.lessonIds || []).includes(filters.lesson);
      const matchesConcept = !filters.concept || (assessment.conceptIds || []).includes(filters.concept);
      const matchesAtomic = !filters.atomic || (assessment.atomicConceptIds || []).includes(filters.atomic);
      const matchesSessions = !filters.usedInSessions || (filters.usedInSessions === "yes"
        ? (assessment.sessionIds || []).length > 0
        : (assessment.sessionIds || []).length === 0);
      return matchesSearch && matchesType && matchesStatus && matchesVisibility && matchesCourse && matchesChapter && matchesLesson && matchesConcept && matchesAtomic && matchesSessions;
    });
  }, [assessments, filters, search]);

  const paginated = filtered.slice((page - 1) * 10, page * 10);

  const createFromTemplate = (type: AssessmentType, label: string) => {
    const preset = createAssessmentPreset(type);
    const draft = createAssessment({
      title: label,
      description: `${label} draft`,
      assessmentType: type,
      courseIds: courseId ? [courseId] : [],
      settings: preset.settings,
      rewards: preset.rewards,
      status: "draft",
      createdBy: "Teacher",
    });
    toast.success(`${label} template created.`);
    setBuilderView({ mode: "edit", assessmentId: draft.id });
  };

  const togglePublish = (assessment: TeacherAssessment) => {
    if (assessment.status === "published") {
      unpublishAssessment(assessment.id);
      toast.success("Assessment moved back to draft.");
      return;
    }
    publishAssessment(assessment.id);
    toast.success("Assessment published.");
  };

  if (builderView.mode !== "list") {
    return (
      <AssessmentWorkspace
        embedded
        assessmentId={builderView.mode === "edit" ? builderView.assessmentId : undefined}
        defaultCourseId={courseId}
        onExit={() => setBuilderView({ mode: "list" })}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <MiniStat icon={Layers} label="Total" value={assessments.length} tone="text-primary" />
        <MiniStat icon={Eye} label="Published" value={assessments.filter((item) => item.status === "published").length} tone="text-emerald-500" />
        <MiniStat icon={Clock} label="Drafts" value={assessments.filter((item) => item.status === "draft").length} tone="text-amber-500" />
        <MiniStat icon={EyeOff} label="Archived" value={assessments.filter((item) => item.status === "archived").length} tone="text-slate-500" />
        <MiniStat icon={Sparkles} label="Active" value={assessments.filter((item) => item.status === "published" && (!item.settings.endAt || new Date(item.settings.endAt) > new Date())).length} tone="text-violet-500" />
        <div className="ms-auto flex items-center gap-2">
          <div className="flex overflow-hidden rounded-xl border">
            <button onClick={() => setViewMode("cards")} className={cn("px-2.5 py-1.5 text-xs font-medium transition-colors", viewMode === "cards" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>Cards</button>
            <button onClick={() => setViewMode("table")} className={cn("border-s px-2.5 py-1.5 text-xs font-medium transition-colors", viewMode === "table" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>Table</button>
          </div>
          <Button className="rounded-xl gradient-brand border-0 text-white" size="sm" onClick={() => setBuilderView({ mode: "create" })}>
            <Plus className="me-1.5 h-4 w-4" />Create Assessment
          </Button>
        </div>
      </div>

      <Card className="border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Templates</h2>
            <p className="text-xs text-muted-foreground">Use a preset, then open the editor to tune settings, rewards, and questions.</p>
          </div>
          <Badge variant="outline" className="rounded-full">{TEMPLATE_PRESETS.length} templates</Badge>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {TEMPLATE_PRESETS.map((template) => (
            <button key={template.key} type="button" onClick={() => createFromTemplate(template.type, template.label)} className="rounded-2xl border p-4 text-left transition-colors hover:border-primary/30 hover:bg-primary/5">
              <p className="text-sm font-semibold">{template.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
              <span className="mt-3 inline-flex text-xs font-medium text-primary">Create From Template</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setFilters((current) => ({ ...current, status: current.status === option.value ? "" : option.value }));
              setPage(1);
            }}
            className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", filters.status === option.value ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}
          >
            {option.label} Only
          </button>
        ))}
      </div>

      <FilterBar
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) => { setFilters((current) => ({ ...current, [key]: value })); setPage(1); }}
        onClearFilters={() => { setFilters({}); setSearch(""); setPage(1); }}
        totalResults={filtered.length}
        placeholder="Search assessments by title, code, subtitle, or description..."
      />

      {assessments.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No assessments yet</h2>
          <p className="max-w-md text-sm text-muted-foreground">Create quizzes, homework, exams, assignments, and assessment drafts from one premium workspace.</p>
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-xl gradient-brand border-0 text-white" onClick={() => setBuilderView({ mode: "create" })}>
              <Plus className="me-1.5 h-4 w-4" />Create Assessment
            </Button>
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => createFromTemplate("practice_quiz", "Chapter Quiz")}>Create From Template</Button>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No assessments match these filters</h2>
          <p className="text-sm text-muted-foreground">Clear filters or search for a different title, code, or academic mapping.</p>
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => { setFilters({}); setSearch(""); setPage(1); }}>Clear Filters</Button>
        </Card>
      ) : viewMode === "table" ? (
        <Card className="overflow-hidden border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">Assessment</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Questions</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Duration</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Score</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">XP</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Sessions</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((assessment) => (
                  <tr key={assessment.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="min-w-[240px]">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{assessment.title}</p>
                          <Badge variant="outline" className="rounded-full font-mono text-[10px]">{assessment.publicCode}</Badge>
                          <Badge variant="outline" className="rounded-full text-[10px]">{ASSESSMENT_TYPE_LABELS[assessment.assessmentType]}</Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{assessment.description || "No description yet."}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">By {assessment.createdBy || "Teacher"} · Created {new Date(assessment.createdAt).toLocaleDateString()} · Updated {new Date(assessment.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={assessment.status} /></td>
                    <td className="px-4 py-3 text-center">{assessment.questionIds.length}</td>
                    <td className="px-4 py-3 text-center">{assessment.settings.durationMinutes ? `${assessment.settings.durationMinutes}m` : "—"}</td>
                    <td className="px-4 py-3 text-center">{assessment.settings.totalScore ?? "—"}</td>
                    <td className="px-4 py-3 text-center">{assessment.rewards.xpReward ?? "—"}</td>
                    <td className="px-4 py-3 text-center">{(assessment.sessionIds || []).length}</td>
                    <td className="px-4 py-3 text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title="Preview"><Link to="/teacher/assessments/$assessmentId" params={{ assessmentId: assessment.id }}><ChevronDown className="h-4 w-4" /></Link></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title="Edit" onClick={() => setBuilderView({ mode: "edit", assessmentId: assessment.id })}><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title="Duplicate" onClick={() => { const duplicated = duplicateAssessment(assessment.id); if (duplicated) toast.success("Assessment duplicated as draft."); }}><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title={assessment.status === "published" ? "Unpublish" : "Publish"} onClick={() => togglePublish(assessment)}>{assessment.status === "published" ? <EyeOff className="h-4 w-4 text-amber-600" /> : <Upload className="h-4 w-4 text-emerald-600" />}</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title="Archive" onClick={() => { archiveAssessment(assessment.id); toast.success("Assessment archived."); }}><Trash2 className="h-4 w-4 text-slate-500" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginated.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              expanded={expandedId === assessment.id}
              onToggle={() => setExpandedId((current) => current === assessment.id ? null : assessment.id)}
              onEdit={() => setBuilderView({ mode: "edit", assessmentId: assessment.id })}
              onPublishToggle={() => togglePublish(assessment)}
              onDuplicate={() => { const duplicated = duplicateAssessment(assessment.id); if (duplicated) toast.success("Assessment duplicated as draft."); }}
              onArchive={() => { archiveAssessment(assessment.id); toast.success("Assessment archived."); }}
              onDelete={() => { deleteAssessment(assessment.id); toast.success("Assessment deleted."); setExpandedId((current) => current === assessment.id ? null : current); }}
              questions={questions}
              courses={courses}
              chapters={chapters}
              lessons={lessons}
              treeNodes={treeNodes}
              sessions={sessions}
            />
          ))}
        </div>
      )}

      <Pagination page={page} pageSize={10} total={filtered.length} onPageChange={setPage} />
    </div>
  );
}

function AssessmentCard({
  assessment,
  expanded,
  onToggle,
  onEdit,
  onPublishToggle,
  onDuplicate,
  onArchive,
  onDelete,
  questions,
  courses,
  chapters,
  lessons,
  treeNodes,
  sessions,
}: {
  assessment: TeacherAssessment;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onPublishToggle: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
  questions: TeacherQuestion[];
  courses: Array<{ id: string; title: string }>;
  chapters: Array<{ id: string; title: string }>;
  lessons: Array<{ id: string; title: string }>;
  treeNodes: ContentTreeNode[];
  sessions: Array<{ id: string; title: string }>;
}) {
  const linkedQuestions = assessment.questionIds.map((questionId) => questions.find((question) => question.id === questionId)).filter(Boolean) as TeacherQuestion[];
  const missingFields = [
    !assessment.title.trim() ? "Missing name" : null,
    !(assessment.description || "").trim() ? "Missing description" : null,
    assessment.questionIds.length === 0 ? "No questions selected" : null,
  ].filter(Boolean) as string[];
  const allowsQuestionlessPublish = QUESTION_OPTIONAL_TYPES.includes(assessment.assessmentType) && (((assessment.instructions || "").trim().length > 0) || Boolean(assessment.settings.fileUploadAllowed));
  const academicNames = [
    ...courses.filter((course) => (assessment.courseIds || []).includes(course.id)).map((course) => course.title),
    ...chapters.filter((chapter) => (assessment.chapterIds || []).includes(chapter.id)).map((chapter) => chapter.title),
    ...lessons.filter((lesson) => (assessment.lessonIds || []).includes(lesson.id)).map((lesson) => lesson.title),
    ...treeNodes.filter((node) => (assessment.conceptIds || []).includes(node.id) || (assessment.atomicConceptIds || []).includes(node.id)).map((node) => node.title),
  ];
  const linkedSessions = sessions.filter((session) => (assessment.sessionIds || []).includes(session.id));

  return (
    <Card className="overflow-hidden border bg-card transition-colors hover:border-primary/20">
      <div className="p-5">
        <div className="flex flex-wrap items-start gap-3">
          <button type="button" onClick={onToggle} className="mt-1 rounded-full border p-1.5 transition-colors hover:bg-accent">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full font-mono text-[10px]">{assessment.publicCode}</Badge>
              <Badge variant="outline" className="rounded-full text-[10px]">{ASSESSMENT_TYPE_LABELS[assessment.assessmentType]}</Badge>
              <StatusBadge status={assessment.status} />
              <Badge variant="outline" className="rounded-full text-[10px] capitalize">{(assessment.visibility || "enrolled_only").replace(/_/g, " ")}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">{assessment.title}</h3>
              {missingFields.length > 0 ? <Badge variant="outline" className="rounded-full border-amber-300 text-[10px] text-amber-700">Publishing blocked</Badge> : null}
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{assessment.description || "Draft not published yet. Add a description to explain the assessment clearly."}</p>
            <div className="mt-3 grid gap-2 text-[11px] text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
              <span>{assessment.questionIds.length} questions</span>
              <span>{assessment.settings.durationMinutes ? `${assessment.settings.durationMinutes} min` : "No duration"}</span>
              <span>{assessment.settings.totalScore ?? "No score"} total score</span>
              <span>{assessment.rewards.xpReward ?? "No XP"} XP</span>
              <span>{assessment.settings.attemptLimit ?? "No attempt limit"} attempts</span>
              <span>{academicNames.length} academic links</span>
              <span>{linkedSessions.length} sessions</span>
              <span>By {assessment.createdBy || "Teacher"}</span>
              <span>Created {new Date(assessment.createdAt).toLocaleDateString()}</span>
              <span>Updated {new Date(assessment.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Button asChild variant="ghost" size="sm" className="rounded-xl"><Link to="/teacher/assessments/$assessmentId" params={{ assessmentId: assessment.id }}>Preview</Link></Button>
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={onEdit}>Edit</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onDuplicate} title="Duplicate"><Copy className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onPublishToggle} title={assessment.status === "published" ? "Unpublish" : "Publish"}>{assessment.status === "published" ? <EyeOff className="h-4 w-4 text-amber-600" /> : <Upload className="h-4 w-4 text-emerald-600" />}</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onArchive} title="Archive"><Trash2 className="h-4 w-4 text-slate-500" /></Button>
          </div>
        </div>

        <div className={cn("grid overflow-hidden transition-all duration-300 ease-out", expanded ? "mt-5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
          <div className="min-h-0 overflow-hidden">
            <div className="grid gap-4 border-t pt-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoCard title="Identity">
                    <p className="text-sm font-medium">{assessment.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{assessment.subtitle || "No subtitle"}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{assessment.description || "No description yet."}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{assessment.instructions || "No instructions configured."}</p>
                  </InfoCard>
                  <InfoCard title="Settings">
                    <InfoLine label="Duration" value={assessment.settings.durationMinutes ? `${assessment.settings.durationMinutes} min` : "Not set"} />
                    <InfoLine label="Attempts" value={assessment.settings.attemptLimit ?? "Not set"} />
                    <InfoLine label="Score" value={assessment.settings.totalScore ?? "Not set"} />
                    <InfoLine label="Passing" value={assessment.settings.passingScorePercent ? `${assessment.settings.passingScorePercent}%` : "Not set"} />
                    <InfoLine label="Shuffle" value={`${assessment.settings.shuffleQuestions ? "Questions" : "No"} / ${assessment.settings.shuffleChoices ? "Choices" : "No"}`} />
                    <InfoLine label="Answer Policy" value={assessment.settings.showAnswersPolicy || "Not set"} />
                  </InfoCard>
                  <InfoCard title="Rewards">
                    {assessment.rewards.xpReward || assessment.rewards.passScoreBonus || assessment.rewards.perfectScoreBonus || assessment.rewards.maxRetakeXp ? (
                      <>
                        <InfoLine label="XP" value={assessment.rewards.xpReward ?? "—"} />
                        <InfoLine label="Pass Bonus" value={assessment.rewards.passScoreBonus ?? "—"} />
                        <InfoLine label="Perfect Bonus" value={assessment.rewards.perfectScoreBonus ?? "—"} />
                        <InfoLine label="Retake XP" value={assessment.rewards.maxRetakeXp ?? "—"} />
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No rewards configured.</p>
                    )}
                  </InfoCard>
                  <InfoCard title="Academic Links">
                    <p className="text-sm text-muted-foreground">{academicNames.length > 0 ? academicNames.join(", ") : "No academic mapping."}</p>
                  </InfoCard>
                </div>

                <Card className="border bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Question List</p>
                    <Badge variant="outline" className="rounded-full">{linkedQuestions.length} items</Badge>
                  </div>
                  <div className="mt-3 space-y-3">
                    {linkedQuestions.length === 0 ? (
                      <Card className="border-dashed p-4 text-sm text-muted-foreground">No questions selected.</Card>
                    ) : (
                      linkedQuestions.map((question) => (
                        <div key={question.id} className="flex flex-wrap items-center gap-3 rounded-2xl border p-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="rounded-full font-mono text-[10px]">{question.publicCode}</Badge>
                              <Badge variant="outline" className="rounded-full text-[10px] capitalize">{question.type.replace(/_/g, " ")}</Badge>
                              <Badge variant="outline" className="rounded-full text-[10px] capitalize">{question.difficulty}</Badge>
                            </div>
                            <p className="mt-2 text-sm font-medium">{question.title || question.text}</p>
                            <p className="mt-1 text-xs text-muted-foreground">Points: {question.points ?? 1} · Time: {question.estimatedTimeSeconds ? `${question.estimatedTimeSeconds}s` : "—"}</p>
                          </div>
                          <Button asChild variant="outline" size="sm" className="rounded-xl"><Link to="/teacher/questions/$questionId/edit" params={{ questionId: question.id }}>Edit Question</Link></Button>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <InfoCard title="Validation">
                  {missingFields.length === 0 ? (
                    <p className="text-sm text-emerald-600">Ready to publish.</p>
                  ) : (
                    missingFields.map((field) => <p key={field} className="text-sm text-amber-700">{field}</p>)
                  )}
                  {assessment.questionIds.length === 0 && allowsQuestionlessPublish ? (
                    <p className="mt-2 text-sm text-muted-foreground">Questions are optional here because instructions or file upload are enabled.</p>
                  ) : null}
                </InfoCard>
                <InfoCard title="Analytics Placeholder">
                  <InfoLine label="Attempts" value="—" />
                  <InfoLine label="Average Score" value="—" />
                  <InfoLine label="Average Time" value="—" />
                  <InfoLine label="Success Rate" value="—" />
                  <InfoLine label="Most Wrong" value="No backend analytics yet" />
                  <InfoLine label="Weak Concepts" value="No backend analytics yet" />
                </InfoCard>
                <InfoCard title="Advanced">
                  <p className="text-sm text-muted-foreground">Archive is the safe default. Delete is reserved for advanced cleanup only.</p>
                  <Button variant="outline" size="sm" className="mt-3 rounded-xl text-destructive" onClick={onDelete}>Delete Permanently</Button>
                </InfoCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MiniStat({ icon: Icon, label, value, tone }: { icon: typeof Layers; label: string; value: number; tone: string }) {
  return (
    <Card className="flex items-center gap-2 border bg-card px-3 py-2">
      <Icon className={cn("h-4 w-4 shrink-0", tone)} />
      <span className="text-sm font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </Card>
  );
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="border bg-muted/20 p-4">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <div className="mt-2 space-y-1">{children}</div>
    </Card>
  );
}

function InfoLine({ label, value }: { label: string; value: string | number }) {
  return <p className="text-sm">{label}: <span className="text-muted-foreground">{value}</span></p>;
}

function StatusBadge({ status }: { status: AssessmentStatus }) {
  const tone = status === "published" ? "border-emerald-300 text-emerald-600" : status === "archived" ? "border-slate-300 text-slate-500" : "border-amber-300 text-amber-600";
  return <Badge variant="outline" className={cn("rounded-full text-[10px]", tone)}>{status}</Badge>;
}
