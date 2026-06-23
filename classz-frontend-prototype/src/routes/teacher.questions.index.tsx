import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  BookOpen, Check, ChevronDown, ChevronUp, Clock, Copy, Edit3, Eye,
  HelpCircle, Layers, Pencil, Plus, Sparkles, Trash2, Upload,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { useTeacherQuestionStore, type TeacherQuestion, type AnswerData } from "@/lib/teacher/teacher-question-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { useContentTreeStore } from "@/lib/teacher/content-tree-store";
import { TYPE_LABELS, TYPE_COLORS, DIFF_COLORS, CATEGORY_MAP, TYPE_TO_CATEGORY, ALL_TYPE_OPTIONS } from "@/components/question/question-bank-shared";

export const Route = createFileRoute("/teacher/questions/")({
  component: QuestionBankPage,
});

const PAGE_SIZE = 15;

function QuestionBankPage() {
  const questions = useTeacherQuestionStore((s) => s.questions);
  const courses = useTeacherCourseStore((s) => s.courses);
  const allTreeNodes = useContentTreeStore((s) => s.nodes);
  const deleteQuestion = useTeacherQuestionStore((s) => s.deleteQuestion);
  const publishQuestion = useTeacherQuestionStore((s) => s.publishQuestion);
  const duplicateQuestion = useTeacherQuestionStore((s) => s.duplicateQuestion);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const treeChapters = useMemo(() => {
    const seen = new Map<string, string>();
    for (const n of allTreeNodes) { if (n.type === "chapter") seen.set(n.id, n.title); }
    return seen;
  }, [allTreeNodes]);
  const treeLessons = useMemo(() => {
    const seen = new Map<string, string>();
    for (const n of allTreeNodes) { if (n.type === "lesson") seen.set(n.id, n.title); }
    return seen;
  }, [allTreeNodes]);
  const treeConcepts = useMemo(() => {
    const seen = new Map<string, string>();
    for (const n of allTreeNodes) { if (n.type === "concept") seen.set(n.id, n.title); }
    return seen;
  }, [allTreeNodes]);
  const treeAtomics = useMemo(() => {
    const seen = new Map<string, string>();
    for (const n of allTreeNodes) { if (n.type === "atomic_concept") seen.set(n.id, n.title); }
    return seen;
  }, [allTreeNodes]);

  const uniqueSources = useMemo(() => {
    const s = new Set<string>();
    for (const q of questions) { if (q.sourceLabel) s.add(q.sourceLabel); else if (q.source) s.add(q.source); }
    return [...s].sort();
  }, [questions]);

  const filterOptions = useMemo<FilterOption[]>(() => [
    { key: "type", label: "Type", options: ALL_TYPE_OPTIONS },
    { key: "category", label: "Category", options: Object.keys(CATEGORY_MAP).map((c) => ({ value: c, label: c })) },
    { key: "difficulty", label: "Difficulty", options: [{ value: "easy", label: "Easy" }, { value: "medium", label: "Medium" }, { value: "hard", label: "Hard" }, { value: "advanced", label: "Advanced" }] },
    { key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }] },
    { key: "course", label: "Course", options: courses.map((c) => ({ value: c.id, label: c.title })) },
    { key: "chapter", label: "Chapter", options: [{ value: "__unclassified", label: "Unclassified" }, ...[...treeChapters.entries()].map(([id, t]) => ({ value: id, label: t }))] },
    { key: "lesson", label: "Lesson", options: [...treeLessons.entries()].map(([id, t]) => ({ value: id, label: t })) },
    { key: "concept", label: "Concept", options: [...treeConcepts.entries()].map(([id, t]) => ({ value: id, label: t })) },
    { key: "atomic", label: "Atomic Concept", options: [...treeAtomics.entries()].map(([id, t]) => ({ value: id, label: t })) },
    ...(uniqueSources.length > 0 ? [{ key: "source", label: "Source", options: uniqueSources.map((s) => ({ value: s, label: s })) }] : []),
    { key: "time", label: "Est. Time", options: [{ value: "lt1", label: "< 1 min" }, { value: "1to3", label: "1–3 min" }, { value: "3to5", label: "3–5 min" }, { value: "gt5", label: "> 5 min" }] },
    { key: "usage", label: "Usage", options: [{ value: "used", label: "Used" }, { value: "unused", label: "Unused" }, { value: "quiz", label: "In Quiz" }, { value: "exam", label: "In Exam" }, { value: "homework", label: "In Homework" }, { value: "session", label: "In Session" }] },
  ], [courses, treeChapters, treeLessons, treeConcepts, treeAtomics, uniqueSources]);

  const filtered = useMemo(() => {
    let r = [...questions];
    if (search) { const q = search.toLowerCase(); r = r.filter((qn) => qn.text.toLowerCase().includes(q) || qn.publicCode.includes(q) || (qn.concept || "").toLowerCase().includes(q) || (qn.title || "").toLowerCase().includes(q)); }
    if (filters.type) r = r.filter((q) => q.type === filters.type);
    if (filters.category) { const types = CATEGORY_MAP[filters.category]; if (types) r = r.filter((q) => types.includes(q.type as any)); }
    if (filters.difficulty) r = r.filter((q) => q.difficulty === filters.difficulty);
    if (filters.status) r = r.filter((q) => q.status === filters.status);
    if (filters.course) r = r.filter((q) => q.courseId === filters.course);
    if (filters.chapter) {
      if (filters.chapter === "__unclassified") r = r.filter((q) => (!q.chapterIds || q.chapterIds.length === 0) && !q.chapterId);
      else r = r.filter((q) => (q.chapterIds || []).includes(filters.chapter) || q.chapterId === filters.chapter);
    }
    if (filters.lesson) r = r.filter((q) => (q.lessonIds || []).includes(filters.lesson));
    if (filters.concept) r = r.filter((q) => (q.conceptIds || []).includes(filters.concept));
    if (filters.atomic) r = r.filter((q) => (q.atomicConceptIds || []).includes(filters.atomic));
    if (filters.source) r = r.filter((q) => (q.sourceLabel || q.source) === filters.source);
    if (filters.time) {
      r = r.filter((q) => {
        const s = q.estimatedTimeSeconds || 0;
        if (filters.time === "lt1") return s > 0 && s < 60;
        if (filters.time === "1to3") return s >= 60 && s <= 180;
        if (filters.time === "3to5") return s > 180 && s <= 300;
        if (filters.time === "gt5") return s > 300;
        return true;
      });
    }
    if (filters.usage) {
      const u = filters.usage;
      if (u === "used") r = r.filter((q) => ((q.quizIds || []).length + (q.examIds || []).length + (q.homeworkIds || []).length + (q.sessionIds || []).length) > 0);
      else if (u === "unused") r = r.filter((q) => ((q.quizIds || []).length + (q.examIds || []).length + (q.homeworkIds || []).length + (q.sessionIds || []).length) === 0);
      else if (u === "quiz") r = r.filter((q) => (q.quizIds || []).length > 0);
      else if (u === "exam") r = r.filter((q) => (q.examIds || []).length > 0);
      else if (u === "homework") r = r.filter((q) => (q.homeworkIds || []).length > 0);
      else if (u === "session") r = r.filter((q) => (q.sessionIds || []).length > 0);
    }
    return r;
  }, [questions, search, filters]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c.title])), [courses]);

  // Stats
  const published = questions.filter((q) => q.status === "published").length;
  const drafts = questions.filter((q) => q.status === "draft").length;
  const usedInAssess = questions.filter((q) => ((q.quizIds || []).length + (q.examIds || []).length + (q.homeworkIds || []).length) > 0).length;
  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const q of questions) { const c = TYPE_TO_CATEGORY[q.type] || "Other"; m[c] = (m[c] || 0) + 1; }
    return m;
  }, [questions]);

  return (
    <DashPage role="teacher" title="Question Bank" subtitle="Create and manage questions for quizzes and exams" icon={ROLES.teacher.icon}>
      {/* Stats */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <Card className="flex items-center gap-2 border bg-card px-3 py-2"><Layers className="h-4 w-4 text-primary shrink-0" /><span className="text-sm font-bold">{questions.length}</span><span className="text-xs text-muted-foreground">Total</span></Card>
          <Card className="flex items-center gap-2 border bg-card px-3 py-2"><Eye className="h-4 w-4 text-emerald-500 shrink-0" /><span className="text-sm font-bold">{published}</span><span className="text-xs text-muted-foreground">Published</span></Card>
          <Card className="flex items-center gap-2 border bg-card px-3 py-2"><Clock className="h-4 w-4 text-amber-500 shrink-0" /><span className="text-sm font-bold">{drafts}</span><span className="text-xs text-muted-foreground">Drafts</span></Card>
          <Card className="flex items-center gap-2 border bg-card px-3 py-2"><BookOpen className="h-4 w-4 text-violet-500 shrink-0" /><span className="text-sm font-bold">{usedInAssess}</span><span className="text-xs text-muted-foreground">In Assessments</span></Card>
        </div>
        <Button asChild className="rounded-xl gradient-brand border-0 text-white ms-auto" size="sm">
          <Link to="/teacher/questions/create"><Plus className="me-1.5 h-4 w-4" /> Create Question</Link>
        </Button>
      </div>

      {/* Category breakdown */}
      {questions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(CATEGORY_MAP).map(([cat]) => {
            const count = catCounts[cat] || 0;
            if (count === 0) return null;
            return (
              <button key={cat} onClick={() => { setFilters((f) => f.category === cat ? { ...f, category: "" } : { ...f, category: cat }); setPage(1); }}
                className={cn("rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors", filters.category === cat ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>
                {cat} <span className="opacity-60 ms-0.5">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} filters={filterOptions} activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }} onClearFilters={() => { setFilters({}); setPage(1); }} totalResults={total} placeholder="Search by text, concept, title, or code..." />

      {total === 0 && questions.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No questions yet</h2>
          <p className="text-sm text-muted-foreground">Build your question bank for quizzes and exams.</p>
          <Button asChild className="rounded-xl gradient-brand border-0 text-white"><Link to="/teacher/questions/create"><Plus className="me-1.5 h-4 w-4" /> Create Question</Link></Button>
        </Card>
      ) : total === 0 ? (
        <Card className="border bg-card p-8 text-center"><p className="text-muted-foreground">No questions match your filters.</p></Card>
      ) : (
        <div className="space-y-2">
          {paginated.map((q) => {
            const isOpen = expandedId === q.id;
            const label = TYPE_LABELS[q.type] || q.type.replace(/_/g, " ");
            return (
              <Card key={q.id} className={cn("border bg-card overflow-hidden transition-colors", isOpen && "border-primary/20")}>
                <div className="flex items-start gap-3 px-5 py-4">
                  <Badge variant="outline" className={cn("mt-0.5 rounded-full text-xs shrink-0", TYPE_COLORS[q.type])}>{label}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium line-clamp-2">{q.text}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className={cn("font-medium", DIFF_COLORS[q.difficulty])}>{q.difficulty}</span>
                      {q.concept && <span>· {q.concept}</span>}
                      <span>· {q.publicCode}</span>
                      {q.tags && q.tags.length > 0 && <span>· {q.tags.slice(0, 3).join(", ")}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="outline" className={cn("rounded-full text-xs", q.status === "published" ? "border-emerald-300 text-emerald-600" : q.status === "archived" ? "border-slate-300 text-slate-500" : "border-amber-300 text-amber-600")}>{q.status}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title={isOpen ? "Collapse" : "Preview"} onClick={() => setExpandedId(isOpen ? null : q.id)}>
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="Edit"><Link to="/teacher/questions/$questionId/edit" params={{ questionId: q.id }}><Edit3 className="h-3.5 w-3.5" /></Link></Button>
                    {q.status === "draft" && <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => publishQuestion(q.id)} title="Publish"><Upload className="h-3.5 w-3.5 text-emerald-600" /></Button>}
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => duplicateQuestion(q.id)} title="Duplicate"><Copy className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => deleteQuestion(q.id)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>

                {/* Expanded preview */}
                <div className={cn("grid transition-all duration-300 ease-in-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <div className="border-t px-5 py-4 space-y-5">
                      <QuestionPreview q={q} courseName={courseMap.get(q.courseId)} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </DashPage>
  );
}

/* ═══════════════════ Expanded Preview ═══════════════════ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{children}</h4>;
}

function Field({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  const display = value === undefined || value === null || value === "" ? null : String(value);
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <span className={cn("font-medium", mono && "font-mono", !display && "text-muted-foreground italic")}>{display || "—"}</span>
    </div>
  );
}

function QuestionPreview({ q, courseName }: { q: TeacherQuestion; courseName?: string }) {
  const ad = q.answerData;
  const links = q.academicLinks || [];
  const qzCount = (q.quizIds || []).length;
  const exCount = (q.examIds || []).length;
  const hwCount = (q.homeworkIds || []).length;
  const sesCount = (q.sessionIds || []).length;
  const totalUse = qzCount + exCount + hwCount + sesCount;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Left column */}
      <div className="space-y-5">
        {/* Question */}
        <div>
          <SectionTitle>Question</SectionTitle>
          {q.title && <p className="text-xs font-semibold mb-1">{q.title}</p>}
          <p className="text-sm whitespace-pre-wrap">{q.text}</p>
          {q.instructions && <p className="text-xs text-muted-foreground italic mt-1.5">{q.instructions}</p>}
          {q.questionImages && q.questionImages.length > 0 && <p className="text-[11px] text-muted-foreground mt-1">{q.questionImages.length} image(s) attached</p>}
        </div>

        {/* Answer */}
        <div>
          <SectionTitle>Answer</SectionTitle>
          <AnswerPreview q={q} ad={ad} />
        </div>

        {/* Solution */}
        <div>
          <SectionTitle>Solution</SectionTitle>
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

      {/* Right column */}
      <div className="space-y-5">
        {/* Classification */}
        <div>
          <SectionTitle>Classification</SectionTitle>
          {courseName || (q.concept) || links.length > 0 ? (
            <div className="space-y-1">
              {courseName && <Field label="Course" value={courseName} />}
              {q.concept && <Field label="Concept" value={q.concept} />}
              {q.atomicConcept && <Field label="Atomic" value={q.atomicConcept} />}
              {links.length > 0 && <Field label="Academic links" value={`${links.length} link(s)`} />}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Not classified</p>
          )}
        </div>

        {/* Metadata */}
        <div>
          <SectionTitle>Metadata</SectionTitle>
          <div className="space-y-1">
            <Field label="Code" value={q.publicCode} mono />
            <Field label="Type" value={q.type.replace(/_/g, " ")} />
            <Field label="Difficulty" value={q.difficulty} />
            <Field label="Est. time" value={q.estimatedTimeSeconds ? `${Math.round(q.estimatedTimeSeconds / 60)} min` : undefined} />
            <Field label="Source" value={q.sourceLabel || q.source} />
            <Field label="Points" value={q.points} />
            {q.tags && q.tags.length > 0 && (
              <div className="flex items-baseline gap-2 text-xs">
                <span className="text-muted-foreground w-24 shrink-0">Tags</span>
                <div className="flex flex-wrap gap-1">{q.tags.map((t) => <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{t}</span>)}</div>
              </div>
            )}
            <Field label="Created" value={new Date(q.createdAt).toLocaleString()} />
            {q.updatedAt !== q.createdAt && <Field label="Updated" value={new Date(q.updatedAt).toLocaleString()} />}
          </div>
        </div>

        {/* Usage */}
        <div>
          <SectionTitle>Usage</SectionTitle>
          {totalUse > 0 || (q.useCount || 0) > 0 ? (
            <div className="space-y-1">
              {qzCount > 0 && <Field label="Quizzes" value={qzCount} />}
              {exCount > 0 && <Field label="Exams" value={exCount} />}
              {hwCount > 0 && <Field label="Homework" value={hwCount} />}
              {sesCount > 0 && <Field label="Sessions" value={sesCount} />}
              <Field label="Total uses" value={q.useCount || totalUse} />
              {(q.wrongRate || 0) > 0 && <Field label="Wrong rate" value={`${Math.round((q.wrongRate || 0) * 100)}%`} />}
              {(q.averageTimeSeconds || 0) > 0 && <Field label="Avg. time" value={`${q.averageTimeSeconds}s`} />}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Not used yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ Type-specific answer preview ═══════════════════ */

function AnswerPreview({ q, ad }: { q: TeacherQuestion; ad?: AnswerData }) {
  // Legacy MCQ via choices field
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
  // Legacy essay via modelAnswer field
  if (q.type === "essay") {
    const model = ad?.kind === "essay" ? ad.modelAnswer : q.modelAnswer;
    return model ? <p className="text-xs border rounded-lg px-3 py-2 bg-muted/30 line-clamp-4">{model}</p> : <p className="text-xs text-muted-foreground italic">Manual grading required</p>;
  }
  // Legacy calculation via correctAnswer field
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

  // Generic fallback for any type with answerData
  if (ad) return <p className="text-xs text-muted-foreground">Type: {ad.kind} — answer configured</p>;
  return <p className="text-xs text-muted-foreground italic">No answer data</p>;
}
