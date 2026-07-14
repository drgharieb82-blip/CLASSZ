import { Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Clock,
  Copy,
  Edit3,
  Eye,
  HelpCircle,
  Layers,
  Trash2,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useTeacherQuestionStore, type AnswerData, type TeacherQuestion } from "@/lib/teacher/teacher-question-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { useTeacherChapterStore } from "@/lib/teacher/teacher-chapter-store";
import { useTeacherLessonStore } from "@/lib/teacher/teacher-lesson-store";
import { useTeacherConceptStore } from "@/lib/teacher/teacher-concept-store";
import { useTeacherAtomicConceptStore } from "@/lib/teacher/teacher-atomic-concept-store";
import {
  ALL_TYPE_OPTIONS,
  CATEGORY_MAP,
  DIFF_COLORS,
  TYPE_COLORS,
  TYPE_LABELS,
  TYPE_TO_CATEGORY,
} from "@/components/question/question-bank-shared";

type WorkspaceMode = "manage" | "picker";
type SortKey = "updatedAt" | "createdAt" | "publicCode" | "title" | "difficulty" | "usage" | "estimatedTimeSeconds";
type SortOrder = "asc" | "desc";

interface TeacherQuestionBankWorkspaceProps {
  mode?: WorkspaceMode;
  attachedQuestionIds?: string[];
  onAttachedQuestionIdsChange?: (questionIds: string[]) => void;
  showInsights?: boolean;
  createAction?: React.ReactNode;
  emptyAction?: React.ReactNode;
}

const DEFAULT_PAGE_SIZE = 100;
const ROW_HEIGHT = 88;
const VIEWPORT_HEIGHT = 560;
const OVERSCAN = 6;

const difficultyRank: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  advanced: 4,
};

const sortOptions: Array<{ value: `${SortKey}:${SortOrder}`; label: string }> = [
  { value: "updatedAt:desc", label: "Updated newest" },
  { value: "updatedAt:asc", label: "Updated oldest" },
  { value: "createdAt:desc", label: "Created newest" },
  { value: "createdAt:asc", label: "Created oldest" },
  { value: "publicCode:asc", label: "Code A-Z" },
  { value: "publicCode:desc", label: "Code Z-A" },
  { value: "title:asc", label: "Title A-Z" },
  { value: "title:desc", label: "Title Z-A" },
  { value: "difficulty:asc", label: "Difficulty easiest" },
  { value: "difficulty:desc", label: "Difficulty hardest" },
  { value: "usage:desc", label: "Most used" },
  { value: "usage:asc", label: "Least used" },
  { value: "estimatedTimeSeconds:desc", label: "Longest estimated time" },
  { value: "estimatedTimeSeconds:asc", label: "Shortest estimated time" },
];

function usageCount(question: TeacherQuestion) {
  return (
    (question.quizIds || []).length
    + (question.examIds || []).length
    + (question.homeworkIds || []).length
    + (question.sessionIds || []).length
    + (question.assessmentIds || []).length
    + (question.assignmentIds || []).length
  );
}

function compareQuestions(left: TeacherQuestion, right: TeacherQuestion, sortBy: SortKey, sortOrder: SortOrder) {
  const direction = sortOrder === "asc" ? 1 : -1;

  if (sortBy === "difficulty") {
    return (difficultyRank[left.difficulty] - difficultyRank[right.difficulty]) * direction;
  }

  if (sortBy === "usage") {
    return (usageCount(left) - usageCount(right)) * direction;
  }

  if (sortBy === "estimatedTimeSeconds") {
    return ((left.estimatedTimeSeconds || 0) - (right.estimatedTimeSeconds || 0)) * direction;
  }

  if (sortBy === "createdAt" || sortBy === "updatedAt") {
    return (new Date(left[sortBy]).getTime() - new Date(right[sortBy]).getTime()) * direction;
  }

  const leftValue = sortBy === "title"
    ? (left.title || left.text || "").toLowerCase()
    : (left.publicCode || "").toLowerCase();
  const rightValue = sortBy === "title"
    ? (right.title || right.text || "").toLowerCase()
    : (right.publicCode || "").toLowerCase();

  return leftValue.localeCompare(rightValue) * direction;
}

export function TeacherQuestionBankWorkspace({
  mode = "manage",
  attachedQuestionIds = [],
  onAttachedQuestionIdsChange,
  showInsights = true,
  createAction,
  emptyAction,
}: TeacherQuestionBankWorkspaceProps) {
  const questions = useTeacherQuestionStore((state) => state.questions);
  const publishQuestion = useTeacherQuestionStore((state) => state.publishQuestion);
  const duplicateQuestion = useTeacherQuestionStore((state) => state.duplicateQuestion);
  const deleteQuestion = useTeacherQuestionStore((state) => state.deleteQuestion);
  const courses = useTeacherCourseStore((state) => state.courses);
  const allChapters = useTeacherChapterStore((state) => state.chapters);
  const allLessons = useTeacherLessonStore((state) => state.lessons);
  const allConcepts = useTeacherConceptStore((state) => state.concepts);
  const allAtomicConcepts = useTeacherAtomicConceptStore((state) => state.atomicConcepts);
  const treeNodes = useMemo(() => [
    ...allChapters.map((c) => ({ id: c.id, type: "chapter" as const, title: c.title })),
    ...allLessons.map((l) => ({ id: l.id, type: "lesson" as const, title: l.title })),
    ...allConcepts.map((c) => ({ id: c.id, type: "concept" as const, title: c.title })),
    ...allAtomicConcepts.map((a) => ({ id: a.id, type: "atomic_concept" as const, title: a.title })),
  ], [allChapters, allLessons, allConcepts, allAtomicConcepts]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<SortKey>("updatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(questions[0]?.id ?? null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [scrollTop, setScrollTop] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course.title])), [courses]);
  const chapterMap = useMemo(() => new Map(treeNodes.filter((node) => node.type === "chapter").map((node) => [node.id, node.title])), [treeNodes]);
  const lessonMap = useMemo(() => new Map(treeNodes.filter((node) => node.type === "lesson").map((node) => [node.id, node.title])), [treeNodes]);
  const conceptMap = useMemo(() => new Map(treeNodes.filter((node) => node.type === "concept").map((node) => [node.id, node.title])), [treeNodes]);
  const atomicMap = useMemo(() => new Map(treeNodes.filter((node) => node.type === "atomic_concept").map((node) => [node.id, node.title])), [treeNodes]);

  const uniqueSources = useMemo(() => {
    const values = new Set<string>();
    for (const question of questions) {
      if (question.sourceLabel) values.add(question.sourceLabel);
      else if (question.source) values.add(question.source);
    }
    return [...values].sort();
  }, [questions]);

  const filterOptions = useMemo<FilterOption[]>(() => [
    { key: "type", label: "Type", options: ALL_TYPE_OPTIONS },
    { key: "category", label: "Category", options: Object.keys(CATEGORY_MAP).map((category) => ({ value: category, label: category })) },
    { key: "difficulty", label: "Difficulty", options: [{ value: "easy", label: "Easy" }, { value: "medium", label: "Medium" }, { value: "hard", label: "Hard" }, { value: "advanced", label: "Advanced" }] },
    { key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }] },
    { key: "course", label: "Course", options: courses.map((course) => ({ value: course.id, label: course.title })) },
    { key: "chapter", label: "Chapter", options: [{ value: "__unclassified", label: "Unclassified" }, ...[...chapterMap.entries()].map(([id, title]) => ({ value: id, label: title }))] },
    { key: "lesson", label: "Lesson", options: [...lessonMap.entries()].map(([id, title]) => ({ value: id, label: title })) },
    { key: "concept", label: "Concept", options: [...conceptMap.entries()].map(([id, title]) => ({ value: id, label: title })) },
    { key: "atomic", label: "Atomic Concept", options: [...atomicMap.entries()].map(([id, title]) => ({ value: id, label: title })) },
    ...(uniqueSources.length > 0 ? [{ key: "source", label: "Source", options: uniqueSources.map((source) => ({ value: source, label: source })) }] : []),
    { key: "time", label: "Est. Time", options: [{ value: "lt1", label: "< 1 min" }, { value: "1to3", label: "1-3 min" }, { value: "3to5", label: "3-5 min" }, { value: "gt5", label: "> 5 min" }] },
    { key: "usage", label: "Usage", options: [{ value: "used", label: "Used" }, { value: "unused", label: "Unused" }, { value: "quiz", label: "In Quiz" }, { value: "exam", label: "In Exam" }, { value: "homework", label: "In Homework" }, { value: "session", label: "In Session" }, { value: "assessment", label: "In Assessment" }] },
  ], [atomicMap, chapterMap, conceptMap, courses, lessonMap, uniqueSources]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const question of questions) {
      const category = TYPE_TO_CATEGORY[question.type] || "Other";
      counts[category] = (counts[category] || 0) + 1;
    }
    return counts;
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSearch = !query
        || question.text.toLowerCase().includes(query)
        || (question.title || "").toLowerCase().includes(query)
        || question.publicCode.toLowerCase().includes(query)
        || (question.concept || "").toLowerCase().includes(query);
      if (!matchesSearch) return false;

      if (filters.type && question.type !== filters.type) return false;
      if (filters.category) {
        const types = CATEGORY_MAP[filters.category];
        if (types && !types.includes(question.type)) return false;
      }
      if (filters.difficulty && question.difficulty !== filters.difficulty) return false;
      if (filters.status && question.status !== filters.status) return false;
      if (filters.course && question.courseId !== filters.course) return false;
      if (filters.chapter) {
        if (filters.chapter === "__unclassified") {
          if (((question.chapterIds || []).length > 0) || question.chapterId) return false;
        } else if (!(question.chapterIds || []).includes(filters.chapter) && question.chapterId !== filters.chapter) {
          return false;
        }
      }
      if (filters.lesson && !(question.lessonIds || []).includes(filters.lesson)) return false;
      if (filters.concept && !(question.conceptIds || []).includes(filters.concept)) return false;
      if (filters.atomic && !(question.atomicConceptIds || []).includes(filters.atomic)) return false;
      if (filters.source && (question.sourceLabel || question.source) !== filters.source) return false;
      if (filters.time) {
        const seconds = question.estimatedTimeSeconds || 0;
        if (filters.time === "lt1" && !(seconds > 0 && seconds < 60)) return false;
        if (filters.time === "1to3" && !(seconds >= 60 && seconds <= 180)) return false;
        if (filters.time === "3to5" && !(seconds > 180 && seconds <= 300)) return false;
        if (filters.time === "gt5" && !(seconds > 300)) return false;
      }
      if (filters.usage) {
        if (filters.usage === "used" && usageCount(question) === 0) return false;
        if (filters.usage === "unused" && usageCount(question) > 0) return false;
        if (filters.usage === "quiz" && (question.quizIds || []).length === 0) return false;
        if (filters.usage === "exam" && (question.examIds || []).length === 0) return false;
        if (filters.usage === "homework" && (question.homeworkIds || []).length === 0) return false;
        if (filters.usage === "session" && (question.sessionIds || []).length === 0) return false;
        if (filters.usage === "assessment" && (question.assessmentIds || []).length === 0) return false;
      }
      return true;
    });
  }, [filters, questions, search]);

  const sortedQuestions = useMemo(
    () => [...filteredQuestions].sort((left, right) => compareQuestions(left, right, sortBy, sortOrder)),
    [filteredQuestions, sortBy, sortOrder],
  );

  const total = sortedQuestions.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pagedQuestions = sortedQuestions.slice(pageStart, pageStart + pageSize);

  const activePreviewQuestion = useMemo(
    () => questions.find((question) => question.id === activePreviewId) || pagedQuestions[0] || null,
    [activePreviewId, pagedQuestions, questions],
  );

  const attachedQuestions = useMemo(
    () => attachedQuestionIds.map((id) => questions.find((question) => question.id === id)).filter(Boolean) as TeacherQuestion[],
    [attachedQuestionIds, questions],
  );

  const selectedCount = checkedIds.size;
  const selectedAttachedCount = [...checkedIds].filter((id) => attachedQuestionIds.includes(id)).length;
  const allPageChecked = pagedQuestions.length > 0 && pagedQuestions.every((question) => checkedIds.has(question.id));

  const visibleStart = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + OVERSCAN * 2;
  const visibleEnd = Math.min(pagedQuestions.length, visibleStart + visibleCount);
  const visibleRows = pagedQuestions.slice(visibleStart, visibleEnd);
  const topSpacerHeight = visibleStart * ROW_HEIGHT;
  const bottomSpacerHeight = Math.max(0, (pagedQuestions.length - visibleEnd) * ROW_HEIGHT);

  const publishedCount = questions.filter((question) => question.status === "published").length;
  const draftCount = questions.filter((question) => question.status === "draft").length;
  const inAssessmentCount = questions.filter((question) => (question.assessmentIds || []).length > 0).length;
  const tableGridClass = mode === "picker"
    ? "grid grid-cols-[48px_minmax(360px,2.8fr)_120px_120px_120px_80px_120px] items-center gap-3"
    : "grid grid-cols-[48px_minmax(0,1.7fr)_110px_110px_110px_90px_130px] items-center gap-3";
  const tableMinWidthClass = mode === "picker" ? "min-w-[1180px]" : "min-w-[980px]";

  const attachQuestions = (questionIds: string[]) => {
    if (!onAttachedQuestionIdsChange) return;
    onAttachedQuestionIdsChange([...new Set([...attachedQuestionIds, ...questionIds])]);
  };

  const openPreview = (questionId: string) => {
    setActivePreviewId(questionId);
    setIsPreviewOpen(true);
  };

  const detachQuestions = (questionIds: string[]) => {
    if (!onAttachedQuestionIdsChange) return;
    onAttachedQuestionIdsChange(attachedQuestionIds.filter((id) => !questionIds.includes(id)));
  };

  const toggleChecked = (questionId: string) => {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const togglePageSelection = () => {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (allPageChecked) {
        for (const question of pagedQuestions) next.delete(question.id);
      } else {
        for (const question of pagedQuestions) next.add(question.id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {showInsights && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Card className="flex items-center gap-2 border bg-card px-3 py-2">
              <Layers className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm font-bold">{questions.length}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </Card>
            <Card className="flex items-center gap-2 border bg-card px-3 py-2">
              <Eye className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="text-sm font-bold">{publishedCount}</span>
              <span className="text-xs text-muted-foreground">Published</span>
            </Card>
            <Card className="flex items-center gap-2 border bg-card px-3 py-2">
              <Clock className="h-4 w-4 shrink-0 text-amber-500" />
              <span className="text-sm font-bold">{draftCount}</span>
              <span className="text-xs text-muted-foreground">Drafts</span>
            </Card>
            <Card className="flex items-center gap-2 border bg-card px-3 py-2">
              <HelpCircle className="h-4 w-4 shrink-0 text-violet-500" />
              <span className="text-sm font-bold">{inAssessmentCount}</span>
              <span className="text-xs text-muted-foreground">In Assessments</span>
            </Card>
          </div>
          {createAction ? <div className="ms-auto">{createAction}</div> : null}
        </div>
      )}

      {questions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(CATEGORY_MAP).map(([category]) => {
            const count = categoryCounts[category] || 0;
            if (count === 0) return null;
            const isActive = filters.category === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setFilters((current) => ({ ...current, category: isActive ? "" : category }));
                  setPage(1);
                }}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  isActive ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent",
                )}
              >
                {category} <span className="ms-0.5 opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <FilterBar
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              filters={filterOptions}
              activeFilters={filters}
              onFilterChange={(key, value) => {
                setFilters((current) => ({ ...current, [key]: value }));
                setPage(1);
              }}
              onClearFilters={() => {
                setFilters({});
                setPage(1);
              }}
              totalResults={total}
              placeholder="Search by text, concept, title, or code..."
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground" htmlFor="question-bank-sort">
              Sort
            </label>
            <select
              id="question-bank-sort"
              value={`${sortBy}:${sortOrder}`}
              onChange={(event) => {
                const [nextSortBy, nextSortOrder] = event.target.value.split(":") as [SortKey, SortOrder];
                setSortBy(nextSortBy);
                setSortOrder(nextSortOrder);
              }}
              className="h-9 rounded-xl border border-input bg-background px-3 text-xs"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={String(pageSize)}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="h-9 rounded-xl border border-input bg-background px-3 text-xs"
            >
              {[25, 50, 100, 200].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        </div>

        {total === 0 && questions.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No questions yet</h2>
            <p className="text-sm text-muted-foreground">Build your question bank for quizzes and assessments.</p>
            {emptyAction || createAction || null}
          </Card>
        ) : total === 0 ? (
          <Card className="border bg-card p-8 text-center">
            <p className="text-muted-foreground">No questions match your filters.</p>
          </Card>
        ) : (
          <div className={cn("grid gap-4", mode === "manage" && "xl:grid-cols-[minmax(0,1fr)_320px]")}>
            <Card className="overflow-hidden border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">
                    {mode === "picker" ? "Question Bank picker" : "Question Bank"}
                  </p>
                  <Badge variant="outline" className="rounded-full">
                    {total.toLocaleString()} matches
                  </Badge>
                  {mode === "picker" ? (
                    <Badge variant="outline" className="rounded-full">
                      {attachedQuestionIds.length} attached
                    </Badge>
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
                <Badge variant="outline" className="rounded-full">
                  {selectedCount} checked
                </Badge>
                {mode === "picker" ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-xl"
                      disabled={selectedCount === 0}
                      onClick={() => attachQuestions([...checkedIds])}
                    >
                      Attach checked
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      disabled={selectedAttachedCount === 0}
                      onClick={() => detachQuestions([...checkedIds].filter((id) => attachedQuestionIds.includes(id)))}
                    >
                      Remove attached
                    </Button>
                  </>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-xs text-muted-foreground"
                  disabled={selectedCount === 0}
                  onClick={() => setCheckedIds(new Set())}
                >
                  Clear checked
                </Button>
              </div>

              <div className="overflow-x-auto">
                <div className={tableMinWidthClass}>
                  <div className={cn(tableGridClass, "border-b px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground")}>
                    <label className="flex items-center justify-center">
                      <input type="checkbox" className="rounded" checked={allPageChecked} onChange={togglePageSelection} />
                    </label>
                    <span>Question</span>
                    <span>Type</span>
                    <span>Difficulty</span>
                    <span>Status</span>
                    <span>Usage</span>
                    <span className="text-end">Actions</span>
                  </div>

                  <div
                    ref={listRef}
                    className="overflow-y-auto"
                    style={{ height: VIEWPORT_HEIGHT }}
                    onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
                  >
                    <div style={{ height: topSpacerHeight }} />
                    {visibleRows.map((question) => {
                      const isChecked = checkedIds.has(question.id);
                      const isAttached = attachedQuestionIds.includes(question.id);
                      const label = TYPE_LABELS[question.type] || question.type.replace(/_/g, " ");

                      return (
                        <div
                          key={question.id}
                          className={cn(
                            tableGridClass,
                            "border-b px-4 py-3 transition-colors",
                            isChecked && "bg-primary/5",
                            activePreviewQuestion?.id === question.id && "bg-accent/40",
                          )}
                          style={{ height: ROW_HEIGHT }}
                        >
                          <label className="flex items-center justify-center">
                            <input type="checkbox" className="rounded" checked={isChecked} onChange={() => toggleChecked(question.id)} />
                          </label>

                          <button
                            type="button"
                            className="min-w-0 text-start"
                            onClick={() => (mode === "picker" ? openPreview(question.id) : setActivePreviewId(question.id))}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="line-clamp-1 text-sm font-medium">{question.title || question.text}</p>
                              {isAttached ? (
                                <Badge variant="outline" className="rounded-full border-primary text-[10px] text-primary">
                                  Attached
                                </Badge>
                              ) : null}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-mono">{question.publicCode}</span>
                              {question.concept ? <span>{question.concept}</span> : null}
                              {question.tags.length > 0 ? <span>{question.tags.slice(0, 2).join(", ")}</span> : null}
                            </div>
                          </button>

                          <div>
                            <Badge variant="outline" className={cn("rounded-full text-xs", TYPE_COLORS[question.type])}>
                              {label}
                            </Badge>
                          </div>

                          <div className={cn("text-xs font-medium capitalize", DIFF_COLORS[question.difficulty])}>
                            {question.difficulty}
                          </div>

                          <div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-full text-xs",
                                question.status === "published"
                                  ? "border-emerald-300 text-emerald-600"
                                  : question.status === "archived"
                                    ? "border-slate-300 text-slate-500"
                                    : "border-amber-300 text-amber-600",
                              )}
                            >
                              {question.status}
                            </Badge>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {usageCount(question)}
                          </div>

                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg"
                              onClick={() => (mode === "picker" ? openPreview(question.id) : setActivePreviewId(question.id))}
                              title="Preview"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                            {mode === "picker" ? (
                              <Button
                                type="button"
                                variant={isAttached ? "outline" : "default"}
                                size="sm"
                                className="h-7 rounded-lg px-2 text-[11px]"
                                onClick={() => (isAttached ? detachQuestions([question.id]) : attachQuestions([question.id]))}
                              >
                                {isAttached ? "Remove" : "Attach"}
                              </Button>
                            ) : (
                              <>
                                <Button asChild variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="Edit">
                                  <Link to="/teacher/questions/$questionId/edit" params={{ questionId: question.id }}>
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </Link>
                                </Button>
                                {question.status === "draft" ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg"
                                    onClick={() => publishQuestion(question.id)}
                                    title="Publish"
                                  >
                                    <Upload className="h-3.5 w-3.5 text-emerald-600" />
                                  </Button>
                                ) : null}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg"
                                  onClick={() => duplicateQuestion(question.id)}
                                  title="Duplicate"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg text-destructive"
                                  onClick={() => deleteQuestion(question.id)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ height: bottomSpacerHeight }} />
                  </div>
                </div>
              </div>

              <div className="px-4 py-3">
                <Pagination page={currentPage} pageSize={pageSize} total={total} onPageChange={setPage} />
              </div>
            </Card>

            <div className={cn("space-y-4", mode === "picker" && "w-full")}>
              {mode === "manage" ? (
              <Card className="border bg-card">
                <div className="border-b px-4 py-3">
                  <p className="text-sm font-semibold">Preview</p>
                </div>
                <div className="p-4">
                  {activePreviewQuestion ? (
                    <div className="space-y-4">
                      <QuestionPreview
                        question={activePreviewQuestion}
                        courseName={courseMap.get(activePreviewQuestion.courseId)}
                        chapterMap={chapterMap}
                        lessonMap={lessonMap}
                        conceptMap={conceptMap}
                        atomicMap={atomicMap}
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Pick a question to inspect its full details.</p>
                  )}
                </div>
              </Card>
              ) : null}

              {mode === "picker" ? (
                <Card className="border bg-card">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <p className="text-sm font-semibold">Attached questions</p>
                    <Badge variant="outline" className="rounded-full">
                      {attachedQuestions.length}
                    </Badge>
                  </div>
                  <div className="max-h-72 space-y-2 overflow-y-auto p-4">
                    {attachedQuestions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No questions attached yet.</p>
                    ) : (
                      attachedQuestions.map((question, index) => (
                        <div key={question.id} className="rounded-xl border p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">Question {index + 1}</p>
                              <p className="mt-1 text-sm font-medium">{question.publicCode}</p>
                              <p className="line-clamp-2 text-xs text-muted-foreground">
                                {question.title || question.text}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="rounded-xl"
                              onClick={() => detachQuestions([question.id])}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {mode === "picker" ? (
        <Drawer open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DrawerContent className="left-auto right-0 top-0 bottom-0 mt-0 h-screen w-full max-w-4xl rounded-none border-l border-border sm:max-w-4xl">
            {activePreviewQuestion ? (
              <div className="flex h-full flex-col">
                <DrawerHeader className="border-b px-6 py-4 text-left">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <DrawerTitle>{activePreviewQuestion.title || activePreviewQuestion.publicCode}</DrawerTitle>
                      <DrawerDescription>
                        {activePreviewQuestion.publicCode} • {TYPE_LABELS[activePreviewQuestion.type] || activePreviewQuestion.type.replace(/_/g, " ")} • {activePreviewQuestion.difficulty}
                      </DrawerDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {attachedQuestionIds.includes(activePreviewQuestion.id) ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => detachQuestions([activePreviewQuestion.id])}
                        >
                          Remove from assessment
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => attachQuestions([activePreviewQuestion.id])}
                        >
                          Attach to assessment
                        </Button>
                      )}
                    </div>
                  </div>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <Tabs defaultValue="question" className="space-y-4">
                    <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-xl bg-muted/60 p-1">
                      <TabsTrigger value="question">Question & Choices</TabsTrigger>
                      <TabsTrigger value="attachments">Attachments</TabsTrigger>
                      <TabsTrigger value="explanation">Explanation</TabsTrigger>
                      <TabsTrigger value="classification">Classification</TabsTrigger>
                    </TabsList>

                    <TabsContent value="question" className="mt-0">
                      <QuestionAndChoicesTab question={activePreviewQuestion} />
                    </TabsContent>

                    <TabsContent value="attachments" className="mt-0">
                      <AttachmentsTab question={activePreviewQuestion} />
                    </TabsContent>

                    <TabsContent value="explanation" className="mt-0">
                      <ExplanationTab question={activePreviewQuestion} />
                    </TabsContent>

                    <TabsContent value="classification" className="mt-0">
                      <ClassificationTab
                        question={activePreviewQuestion}
                        courseName={courseMap.get(activePreviewQuestion.courseId)}
                        chapterMap={chapterMap}
                        lessonMap={lessonMap}
                        conceptMap={conceptMap}
                        atomicMap={atomicMap}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <DrawerFooter className="border-t px-6 py-4 sm:flex-row sm:justify-between">
                  <div className="text-xs text-muted-foreground">
                    Status: {activePreviewQuestion.status} • Usage: {usageCount(activePreviewQuestion)}
                  </div>
                  <DrawerClose asChild>
                    <Button type="button" variant="outline" className="rounded-xl">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            ) : null}
          </DrawerContent>
        </Drawer>
      ) : null}
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border bg-card">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </Card>
  );
}

function QuestionAndChoicesTab({ question }: { question: TeacherQuestion }) {
  return (
    <div className="space-y-4">
      <InfoBlock title="Question">
        {question.title ? <p className="text-sm font-semibold">{question.title}</p> : null}
        <p className="whitespace-pre-wrap text-sm">{question.text}</p>
        {question.instructions ? <p className="text-sm italic text-muted-foreground">{question.instructions}</p> : null}
      </InfoBlock>

      <InfoBlock title="Answer & Choices">
        <AnswerPreview question={question} answerData={question.answerData} />
      </InfoBlock>
    </div>
  );
}

function AttachmentsTab({ question }: { question: TeacherQuestion }) {
  const attachmentGroups = [
    { label: "Question images", items: question.questionImages || [] },
    { label: "Choice images", items: question.choiceImages || [] },
    { label: "Solution images", items: question.solutionImages || [] },
    { label: "Attachments", items: question.attachments || [] },
  ].filter((group) => group.items.length > 0);

  return (
    <InfoBlock title="Attachments">
      {attachmentGroups.length === 0 ? (
        <p className="text-sm text-muted-foreground">No attachments added for this question.</p>
      ) : (
        <div className="space-y-4">
          {attachmentGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</p>
              <div className="space-y-2">
                {group.items.map((item, index) => (
                  <div key={`${group.label}-${index}`} className="rounded-xl border px-3 py-2 text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </InfoBlock>
  );
}

function ExplanationTab({ question }: { question: TeacherQuestion }) {
  return (
    <div className="space-y-4">
      <InfoBlock title="Hint">
        <p className="text-sm text-muted-foreground">{question.hint || "No hint added yet."}</p>
      </InfoBlock>
      <InfoBlock title="Explanation">
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{question.explanation || "No explanation added yet."}</p>
      </InfoBlock>
      <InfoBlock title="Solution">
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{question.solution || "No solution added yet."}</p>
      </InfoBlock>
      <InfoBlock title="Common mistakes">
        <p className="text-sm text-muted-foreground">
          {question.commonMistakes && question.commonMistakes.length > 0 ? question.commonMistakes.join("; ") : "No common mistakes added yet."}
        </p>
      </InfoBlock>
    </div>
  );
}

function ClassificationTab({
  question,
  courseName,
  chapterMap,
  lessonMap,
  conceptMap,
  atomicMap,
}: {
  question: TeacherQuestion;
  courseName?: string;
  chapterMap: Map<string, string>;
  lessonMap: Map<string, string>;
  conceptMap: Map<string, string>;
  atomicMap: Map<string, string>;
}) {
  const chapterNames = (question.chapterIds || []).map((id) => chapterMap.get(id)).filter(Boolean) as string[];
  if (!chapterNames.length && question.chapterId && chapterMap.has(question.chapterId)) chapterNames.push(chapterMap.get(question.chapterId)!);
  const lessonNames = (question.lessonIds || []).map((id) => lessonMap.get(id)).filter(Boolean) as string[];
  const conceptNames = (question.conceptIds || []).map((id) => conceptMap.get(id)).filter(Boolean) as string[];
  const atomicNames = (question.atomicConceptIds || []).map((id) => atomicMap.get(id)).filter(Boolean) as string[];

  return (
    <div className="space-y-4">
      <InfoBlock title="Classification">
        <div className="space-y-2">
          <Field label="Course" value={courseName || "-"} />
          <Field label="Chapter(s)" value={chapterNames.join(", ")} />
          <Field label="Lesson(s)" value={lessonNames.join(", ")} />
          <Field label="Concept(s)" value={conceptNames.length > 0 ? conceptNames.join(", ") : question.concept} />
          <Field label="Atomic(s)" value={atomicNames.length > 0 ? atomicNames.join(", ") : question.atomicConcept} />
        </div>
      </InfoBlock>

      <InfoBlock title="Metadata">
        <div className="space-y-2">
          <Field label="Code" value={question.publicCode} mono />
          <Field label="Type" value={question.type.replace(/_/g, " ")} />
          <Field label="Difficulty" value={question.difficulty} />
          <Field label="Status" value={question.status} />
          <Field label="Source" value={question.sourceLabel || question.source} />
          <Field label="Points" value={question.points} />
          <Field label="Created" value={new Date(question.createdAt).toLocaleString()} />
          <Field label="Updated" value={new Date(question.updatedAt).toLocaleString()} />
        </div>
      </InfoBlock>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</h4>;
}

function Field({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  const display = value === undefined || value === null || value === "" ? null : String(value);
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className={cn("font-medium", mono && "font-mono", !display && "text-muted-foreground italic")}>
        {display || "-"}
      </span>
    </div>
  );
}

function QuestionPreview({
  question,
  courseName,
  chapterMap,
  lessonMap,
  conceptMap,
  atomicMap,
}: {
  question: TeacherQuestion;
  courseName?: string;
  chapterMap: Map<string, string>;
  lessonMap: Map<string, string>;
  conceptMap: Map<string, string>;
  atomicMap: Map<string, string>;
}) {
  const answerData = question.answerData;
  const quizCount = (question.quizIds || []).length;
  const examCount = (question.examIds || []).length;
  const homeworkCount = (question.homeworkIds || []).length;
  const sessionCount = (question.sessionIds || []).length;
  const assessmentCount = (question.assessmentIds || []).length;
  const totalUse = quizCount + examCount + homeworkCount + sessionCount + assessmentCount;

  const chapterNames = (question.chapterIds || []).map((id) => chapterMap.get(id)).filter(Boolean) as string[];
  if (!chapterNames.length && question.chapterId && chapterMap.has(question.chapterId)) chapterNames.push(chapterMap.get(question.chapterId)!);
  const lessonNames = (question.lessonIds || []).map((id) => lessonMap.get(id)).filter(Boolean) as string[];
  const conceptNames = (question.conceptIds || []).map((id) => conceptMap.get(id)).filter(Boolean) as string[];
  const atomicNames = (question.atomicConceptIds || []).map((id) => atomicMap.get(id)).filter(Boolean) as string[];
  const hasClassification = Boolean(courseName || question.concept || chapterNames.length || lessonNames.length || conceptNames.length || atomicNames.length);

  return (
    <div className="grid gap-5 lg:grid-cols-1">
      <div className="space-y-5">
        <div>
          <SectionTitle>Question</SectionTitle>
          {question.title ? <p className="mb-1 text-xs font-semibold">{question.title}</p> : null}
          <p className="whitespace-pre-wrap text-sm">{question.text}</p>
          {question.instructions ? <p className="mt-1.5 text-xs italic text-muted-foreground">{question.instructions}</p> : null}
          {question.questionImages && question.questionImages.length > 0 ? (
            <p className="mt-1 text-[11px] text-muted-foreground">{question.questionImages.length} image(s) attached</p>
          ) : null}
        </div>

        <div>
          <SectionTitle>Answer</SectionTitle>
          <AnswerPreview question={question} answerData={answerData} />
        </div>

        <div>
          <SectionTitle>Solution</SectionTitle>
          <div className="space-y-1.5">
            {question.hint ? (
              <div className="rounded-lg border bg-amber-500/5 px-3 py-2 text-xs">
                <span className="font-medium text-amber-600">Hint:</span> {question.hint}
              </div>
            ) : null}
            {question.explanation ? (
              <div className="rounded-lg border px-3 py-2 text-xs">
                <span className="font-medium">Explanation:</span> {question.explanation}
              </div>
            ) : null}
            {question.solution ? (
              <div className="rounded-lg border px-3 py-2 text-xs">
                <span className="font-medium">Solution:</span> {question.solution}
              </div>
            ) : null}
            {(question.commonMistakes || []).length > 0 ? (
              <div className="rounded-lg border bg-rose-500/5 px-3 py-2 text-xs">
                <span className="font-medium text-rose-600">Common mistakes:</span> {question.commonMistakes!.join("; ")}
              </div>
            ) : null}
            {question.teacherNotes ? (
              <div className="rounded-lg border bg-violet-500/5 px-3 py-2 text-xs">
                <span className="font-medium text-violet-600">Teacher notes:</span> {question.teacherNotes}
              </div>
            ) : null}
            {!question.hint && !question.explanation && !question.solution ? (
              <p className="text-xs italic text-muted-foreground">No solution added yet</p>
            ) : null}
          </div>
        </div>

        <div>
          <SectionTitle>Classification</SectionTitle>
          {hasClassification ? (
            <div className="space-y-1">
              {courseName ? <Field label="Course" value={courseName} /> : null}
              {chapterNames.length > 0 ? <Field label="Chapter(s)" value={chapterNames.join(", ")} /> : null}
              {lessonNames.length > 0 ? <Field label="Lesson(s)" value={lessonNames.join(", ")} /> : null}
              {(conceptNames.length > 0 || question.concept) ? (
                <Field label="Concept(s)" value={conceptNames.length > 0 ? conceptNames.join(", ") : question.concept} />
              ) : null}
              {(atomicNames.length > 0 || question.atomicConcept) ? (
                <Field label="Atomic(s)" value={atomicNames.length > 0 ? atomicNames.join(", ") : question.atomicConcept} />
              ) : null}
            </div>
          ) : (
            <p className="text-xs italic text-muted-foreground">Not classified</p>
          )}
        </div>

        <div>
          <SectionTitle>Metadata</SectionTitle>
          <div className="space-y-1">
            <Field label="Code" value={question.publicCode} mono />
            <Field label="Type" value={question.type.replace(/_/g, " ")} />
            <Field label="Difficulty" value={question.difficulty} />
            <Field label="Status" value={question.status} />
            <Field
              label="Est. time"
              value={question.estimatedTimeSeconds
                ? (question.estimatedTimeSeconds < 60 ? `${question.estimatedTimeSeconds}s` : `${Math.round(question.estimatedTimeSeconds / 60)} min`)
                : undefined}
            />
            <Field label="Source" value={question.sourceLabel || question.source} />
            <Field label="Points" value={question.points} />
            {question.tags && question.tags.length > 0 ? (
              <div className="flex items-baseline gap-2 text-xs">
                <span className="w-24 shrink-0 text-muted-foreground">Tags</span>
                <div className="flex flex-wrap gap-1">
                  {question.tags.map((tag) => (
                    <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            <Field label="Created by" value={question.createdBy} />
            <Field label="Created" value={new Date(question.createdAt).toLocaleString()} />
            {question.updatedBy ? <Field label="Updated by" value={question.updatedBy} /> : null}
            {question.updatedAt !== question.createdAt ? <Field label="Updated" value={new Date(question.updatedAt).toLocaleString()} /> : null}
          </div>
        </div>

        <div>
          <SectionTitle>Usage</SectionTitle>
          {totalUse > 0 || (question.useCount || 0) > 0 ? (
            <div className="space-y-1">
              {quizCount > 0 ? <Field label="Quizzes" value={quizCount} /> : null}
              {examCount > 0 ? <Field label="Exams" value={examCount} /> : null}
              {homeworkCount > 0 ? <Field label="Homework" value={homeworkCount} /> : null}
              {sessionCount > 0 ? <Field label="Sessions" value={sessionCount} /> : null}
              {assessmentCount > 0 ? <Field label="Assessments" value={assessmentCount} /> : null}
              <Field label="Total uses" value={question.useCount || totalUse} />
              {(question.wrongRate || 0) > 0 ? <Field label="Wrong rate" value={`${Math.round((question.wrongRate || 0) * 100)}%`} /> : null}
              {(question.averageTimeSeconds || 0) > 0 ? <Field label="Avg. time" value={`${question.averageTimeSeconds}s`} /> : null}
            </div>
          ) : (
            <p className="text-xs italic text-muted-foreground">Not used yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AnswerPreview({ question, answerData }: { question: TeacherQuestion; answerData?: AnswerData }) {
  if ((question.type === "mcq" || question.type === "multi_select") && question.choices && question.choices.length > 0) {
    return (
      <div className="space-y-1">
        {question.choices.map((choice, index) => (
          <div
            key={choice.id}
            className={cn("flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs", choice.isCorrect && "border-emerald-300 bg-emerald-500/5")}
          >
            {choice.isCorrect ? <Check className="h-3 w-3 shrink-0 text-emerald-600" /> : null}
            <span>{String.fromCharCode(65 + index)}. {choice.text}</span>
          </div>
        ))}
      </div>
    );
  }

  if (question.type === "true_false" && answerData?.kind === "true_false") {
    return (
      <div className="flex gap-2">
        {[true, false].map((value) => (
          <span
            key={String(value)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium",
              answerData.correctBoolean === value && "border-emerald-300 bg-emerald-500/5 text-emerald-600",
            )}
          >
            {value ? "True" : "False"}
          </span>
        ))}
      </div>
    );
  }

  if (question.type === "short_answer" && answerData?.kind === "short_answer") {
    return <div className="text-xs"><span className="text-muted-foreground">Accepted:</span> {answerData.acceptedAnswers.join(", ") || "-"}</div>;
  }

  if (question.type === "essay") {
    const modelAnswer = answerData?.kind === "essay" ? answerData.modelAnswer : question.modelAnswer;
    return modelAnswer
      ? <p className="line-clamp-4 rounded-lg border bg-muted/30 px-3 py-2 text-xs">{modelAnswer}</p>
      : <p className="text-xs italic text-muted-foreground">Manual grading required</p>;
  }

  if (question.type === "calculation") {
    const correctAnswer = answerData?.kind === "calculation" ? answerData.correctAnswer : question.correctAnswer;
    const unit = answerData?.kind === "calculation" ? answerData.unit : question.unit;
    const tolerance = answerData?.kind === "calculation" ? answerData.tolerance : question.tolerance;
    const steps = answerData?.kind === "calculation" ? answerData.solutionSteps : undefined;
    return (
      <div className="space-y-1 text-xs">
        <div>
          <span className="text-muted-foreground">Answer:</span> <span className="font-mono font-semibold">{correctAnswer || "-"}</span>
          {unit ? ` ${unit}` : ""}
          {tolerance ? <span className="text-muted-foreground"> (+/- {tolerance})</span> : null}
        </div>
        {answerData?.kind === "calculation" && answerData.formulaUsed ? (
          <div><span className="text-muted-foreground">Formula:</span> {answerData.formulaUsed}</div>
        ) : null}
        {steps && steps.length > 0 ? (
          <div className="mt-1 space-y-0.5">
            {steps.map((step, index) => (
              <p key={`${index}-${step}`} className="text-muted-foreground">{index + 1}. {step}</p>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (question.type === "fill_blank" && answerData?.kind === "fill_blank") {
    return (
      <div className="space-y-1 text-xs">
        <p className="font-medium">{answerData.promptWithBlanks}</p>
        {answerData.blanks.map((blank, index) => (
          <p key={blank.id} className="text-muted-foreground">Blank {index + 1}: {blank.acceptedAnswers.join(", ")}</p>
        ))}
      </div>
    );
  }

  if (question.type === "matching" && answerData?.kind === "matching") {
    return (
      <div className="space-y-1">
        {answerData.correctPairs.map((pair) => {
          const left = answerData.leftItems.find((item) => item.id === pair.leftId);
          const right = answerData.rightItems.find((item) => item.id === pair.rightId);
          return (
            <div key={`${pair.leftId}-${pair.rightId}`} className="flex items-center gap-2 text-xs">
              <span className="font-medium">{left?.text}</span>
              <span className="text-muted-foreground">-&gt;</span>
              <span>{right?.text}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (question.type === "ordering" && answerData?.kind === "ordering") {
    return (
      <div className="space-y-0.5">
        {answerData.correctOrder.map((id, index) => {
          const item = answerData.items.find((entry) => entry.id === id);
          return <p key={id} className="text-xs">{index + 1}. {item?.text}</p>;
        })}
      </div>
    );
  }

  if (question.type === "classification" && answerData?.kind === "classification") {
    return (
      <div className="space-y-1">
        {answerData.categories.map((category) => {
          const items = answerData.items.filter((item) => answerData.correctCategoryByItem[item.id] === category.id);
          return (
            <div key={category.id} className="text-xs">
              <span className="font-medium">{category.text}:</span> {items.map((item) => item.text).join(", ") || "-"}
            </div>
          );
        })}
      </div>
    );
  }

  if (question.type === "coding" && answerData?.kind === "coding") {
    return (
      <div className="space-y-1 text-xs">
        <div><span className="text-muted-foreground">Language:</span> {answerData.language}</div>
        {answerData.starterCode ? (
          <pre className="max-h-24 overflow-x-auto rounded-lg border bg-slate-900 p-2 text-[10px] font-mono text-emerald-400">
            {answerData.starterCode}
          </pre>
        ) : null}
        <div><span className="text-muted-foreground">Test cases:</span> {answerData.testCases.length}</div>
      </div>
    );
  }

  if (question.type === "flashcard" && answerData?.kind === "flashcard") {
    return (
      <div className="space-y-1 rounded-lg border p-3 text-xs">
        <div><span className="font-medium">Front:</span> {answerData.front}</div>
        <div><span className="font-medium">Back:</span> {answerData.back}</div>
        {answerData.hint ? <div className="text-muted-foreground">Hint: {answerData.hint}</div> : null}
      </div>
    );
  }

  if (question.type === "drag_drop" && answerData?.kind === "drag_drop") {
    return <div className="text-xs text-muted-foreground">{answerData.draggableItems.length} items to {answerData.dropZones.length} zones</div>;
  }

  if (question.type === "equation_builder" && answerData?.kind === "equation_builder") {
    return <p className="text-xs font-mono">{answerData.expectedEquation}</p>;
  }

  if (question.type === "chemical_structure" && answerData?.kind === "chemical_structure") {
    return <p className="text-xs"><span className="text-muted-foreground">Structure ({answerData.representation}):</span> <span className="font-mono">{answerData.expectedStructure}</span></p>;
  }

  if (question.type === "table_completion" && answerData?.kind === "table_completion") {
    return <p className="text-xs text-muted-foreground">{answerData.columns.length} columns x {answerData.rows.length} rows, {answerData.blankCells.length} blanks</p>;
  }

  if (question.type === "file_upload" && answerData?.kind === "file_upload") {
    return <p className="text-xs text-muted-foreground">Upload: {answerData.allowedFileTypes.join(", ")} - max {answerData.maxFileSizeMB || "?"}MB</p>;
  }

  if (question.type === "passage" && answerData?.kind === "passage") {
    return <p className="line-clamp-3 text-xs">{answerData.passageText || "No passage text"}</p>;
  }

  if (question.type === "case_study" && answerData?.kind === "case_study") {
    return <p className="line-clamp-3 text-xs">{answerData.caseText || "No case text"}</p>;
  }

  if (answerData) return <p className="text-xs text-muted-foreground">Type: {answerData.kind} - answer configured</p>;
  return <p className="text-xs italic text-muted-foreground">No answer data</p>;
}
