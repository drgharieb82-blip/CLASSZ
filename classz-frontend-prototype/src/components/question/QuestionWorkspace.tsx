import { useNavigate } from "@tanstack/react-router";
import { useMemo, type ReactNode } from "react";
import { Copy, Edit3, Eye, HelpCircle, Layers, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Workspace } from "@/components/common/Workspace";
import type {
  WorkspaceAction,
  WorkspaceAdapter,
  WorkspaceColumn,
  WorkspaceFilterSchema,
  WorkspaceModeContract,
  WorkspaceQuery,
  WorkspaceResponse,
} from "@/components/common/workspace-contracts";
import { cn } from "@/lib/utils";
import { useTeacherChapterStore } from "@/lib/teacher/teacher-chapter-store";
import { useTeacherLessonStore } from "@/lib/teacher/teacher-lesson-store";
import { useTeacherConceptStore } from "@/lib/teacher/teacher-concept-store";
import { useTeacherAtomicConceptStore } from "@/lib/teacher/teacher-atomic-concept-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { useTeacherQuestionStore, type TeacherQuestion } from "@/lib/teacher/teacher-question-store";
import {
  ALL_TYPE_OPTIONS,
  CATEGORY_MAP,
  DIFF_COLORS,
  TYPE_COLORS,
  TYPE_LABELS,
  TYPE_TO_CATEGORY,
} from "./question-bank-shared";
import {
  AttachmentsTab,
  ClassificationTab,
  ExplanationTab,
  QuestionAndChoicesTab,
} from "./question-workspace-details";

type QuestionWorkspaceProps = {
  showInsights?: boolean;
  createAction?: ReactNode;
  emptyAction?: ReactNode;
};

type SortKey = "updatedAt" | "createdAt" | "publicCode" | "title" | "difficulty" | "usage" | "estimatedTimeSeconds";
type SortOrder = "asc" | "desc";

type QuestionWorkspaceRow = TeacherQuestion & {
  subtitle: string;
  [key: string]: unknown;
};

const DEFAULT_QUERY: Partial<WorkspaceQuery> = {
  mode: "browse",
  sort: { field: "updatedAt", direction: "desc" },
  pagination: {
    mode: "page",
    page: 1,
    pageSize: 100,
  },
};

const difficultyRank: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  advanced: 4,
};

const SORT_OPTIONS: Array<{ field: SortKey; direction: SortOrder; label: string }> = [
  { field: "updatedAt", direction: "desc", label: "Updated newest" },
  { field: "updatedAt", direction: "asc", label: "Updated oldest" },
  { field: "createdAt", direction: "desc", label: "Created newest" },
  { field: "createdAt", direction: "asc", label: "Created oldest" },
  { field: "publicCode", direction: "asc", label: "Code A-Z" },
  { field: "publicCode", direction: "desc", label: "Code Z-A" },
  { field: "title", direction: "asc", label: "Title A-Z" },
  { field: "title", direction: "desc", label: "Title Z-A" },
  { field: "difficulty", direction: "asc", label: "Difficulty easiest" },
  { field: "difficulty", direction: "desc", label: "Difficulty hardest" },
  { field: "usage", direction: "desc", label: "Most used" },
  { field: "usage", direction: "asc", label: "Least used" },
  { field: "estimatedTimeSeconds", direction: "desc", label: "Longest estimated time" },
  { field: "estimatedTimeSeconds", direction: "asc", label: "Shortest estimated time" },
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

export function QuestionWorkspace({
  showInsights = true,
  createAction,
  emptyAction,
}: QuestionWorkspaceProps) {
  const navigate = useNavigate();
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

  const filterSchema = useMemo<WorkspaceFilterSchema[]>(() => [
    { id: "type", label: "Type", type: "select", options: ALL_TYPE_OPTIONS },
    { id: "category", label: "Category", type: "select", options: Object.keys(CATEGORY_MAP).map((category) => ({ value: category, label: category })) },
    { id: "difficulty", label: "Difficulty", type: "select", options: [{ value: "easy", label: "Easy" }, { value: "medium", label: "Medium" }, { value: "hard", label: "Hard" }, { value: "advanced", label: "Advanced" }] },
    { id: "status", label: "Status", type: "select", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }] },
    { id: "course", label: "Course", type: "select", options: courses.map((course) => ({ value: course.id, label: course.title })) },
    { id: "chapter", label: "Chapter", type: "select", options: [{ value: "__unclassified", label: "Unclassified" }, ...[...chapterMap.entries()].map(([id, title]) => ({ value: id, label: title }))] },
    { id: "lesson", label: "Lesson", type: "select", options: [...lessonMap.entries()].map(([id, title]) => ({ value: id, label: title })) },
    { id: "concept", label: "Concept", type: "select", options: [...conceptMap.entries()].map(([id, title]) => ({ value: id, label: title })) },
    { id: "atomic", label: "Atomic Concept", type: "select", options: [...atomicMap.entries()].map(([id, title]) => ({ value: id, label: title })) },
    ...(uniqueSources.length > 0 ? [{ id: "source", label: "Source", type: "select" as const, options: uniqueSources.map((source) => ({ value: source, label: source })) }] : []),
    { id: "time", label: "Est. Time", type: "select", options: [{ value: "lt1", label: "< 1 min" }, { value: "1to3", label: "1-3 min" }, { value: "3to5", label: "3-5 min" }, { value: "gt5", label: "> 5 min" }] },
    { id: "usage", label: "Usage", type: "select", options: [{ value: "used", label: "Used" }, { value: "unused", label: "Unused" }, { value: "quiz", label: "In Quiz" }, { value: "exam", label: "In Exam" }, { value: "homework", label: "In Homework" }, { value: "session", label: "In Session" }, { value: "assessment", label: "In Assessment" }] },
  ], [atomicMap, chapterMap, conceptMap, courses, lessonMap, uniqueSources]);

  const aggregates = useMemo(() => {
    const publishedCount = questions.filter((question) => question.status === "published").length;
    const draftCount = questions.filter((question) => question.status === "draft").length;
    const inAssessmentCount = questions.filter((question) => (question.assessmentIds || []).length > 0).length;
    return [
      { id: "total", label: "Total", value: questions.length },
      { id: "published", label: "Published", value: publishedCount },
      { id: "draft", label: "Drafts", value: draftCount },
      { id: "assessments", label: "In Assessments", value: inAssessmentCount },
    ];
  }, [questions]);

  const columns = useMemo<WorkspaceColumn<QuestionWorkspaceRow>[]>(() => [
    {
      id: "question",
      label: "Question",
      width: "46%",
      render: (row) => (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="line-clamp-1 text-sm font-medium">{row.title || row.text}</p>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{row.publicCode}</span>
            {row.concept ? <span>{row.concept}</span> : null}
            {row.tags.length > 0 ? <span>{row.tags.slice(0, 2).join(", ")}</span> : null}
          </div>
        </div>
      ),
    },
    {
      id: "type",
      label: "Type",
      width: 140,
      render: (row) => (
        <Badge variant="outline" className={cn("rounded-full text-xs", TYPE_COLORS[row.type])}>
          {TYPE_LABELS[row.type] || row.type.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      id: "difficulty",
      label: "Difficulty",
      width: 120,
      render: (row) => (
        <div className={cn("text-xs font-medium capitalize", DIFF_COLORS[row.difficulty])}>
          {row.difficulty}
        </div>
      ),
    },
    {
      id: "status",
      label: "Status",
      width: 120,
      render: (row) => (
        <Badge
          variant="outline"
          className={cn(
            "rounded-full text-xs",
            row.status === "published"
              ? "border-emerald-300 text-emerald-600"
              : row.status === "archived"
                ? "border-slate-300 text-slate-500"
                : "border-amber-300 text-amber-600",
          )}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      id: "usage",
      label: "Usage",
      width: 90,
      render: (row) => <span className="text-xs text-muted-foreground">{usageCount(row)}</span>,
    },
  ], []);

  const emptyState = (
    <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
      <HelpCircle className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-lg font-semibold">No questions yet</h2>
      <p className="text-sm text-muted-foreground">Build your question bank for quizzes and assessments.</p>
      {emptyAction || createAction || null}
    </Card>
  );

  const adapter = useMemo<WorkspaceAdapter<QuestionWorkspaceRow>>(() => {
    const createSubtitle = (question: TeacherQuestion) => [
      question.publicCode,
      TYPE_LABELS[question.type] || question.type.replace(/_/g, " "),
      question.difficulty,
    ].join(" • ");

    const rowActionsFor = (question: QuestionWorkspaceRow): WorkspaceAction<QuestionWorkspaceRow>[] => {
      const actions: WorkspaceAction<QuestionWorkspaceRow>[] = [
        {
          id: "edit",
          label: "Edit",
          icon: <Edit3 className="h-3.5 w-3.5" />,
          handler: () => {
            navigate({ to: "/teacher/questions/$questionId/edit", params: { questionId: question.id } });
          },
          refreshPolicy: "none",
        },
      ];

      if (question.status === "draft") {
        actions.push({
          id: "publish",
          label: "Publish",
          icon: <Upload className="h-3.5 w-3.5 text-emerald-600" />,
          handler: () => {
            publishQuestion(question.id);
          },
          refreshPolicy: "query",
        });
      }

      actions.push(
        {
          id: "duplicate",
          label: "Duplicate",
          icon: <Copy className="h-3.5 w-3.5" />,
          handler: () => {
            duplicateQuestion(question.id);
          },
          refreshPolicy: "query",
        },
        {
          id: "delete",
          label: "Delete",
          icon: <Trash2 className="h-3.5 w-3.5" />,
          confirmation: {
            title: "Delete question?",
            message: "This question will be removed from the current teacher question store.",
            confirmLabel: "Delete",
            destructive: true,
          },
          handler: () => {
            deleteQuestion(question.id);
          },
          refreshPolicy: "query",
        },
      );

      return actions;
    };

    return {
      entity: "Question Bank",
      searchPlaceholder: "Search by text, concept, title, or code...",
      getColumns: () => columns,
      getFilters: () => filterSchema,
      getSorts: () => SORT_OPTIONS.map((option) => ({
        field: option.field,
        label: option.label,
      })),
      getRowActions: (row) => rowActionsFor(row),
      getDrawerActions: (row) => [
        {
          id: "edit-drawer",
          label: "Edit",
          icon: <Edit3 className="h-3.5 w-3.5" />,
          handler: () => {
            navigate({ to: "/teacher/questions/$questionId/edit", params: { questionId: row.id } });
          },
          refreshPolicy: "none",
        },
      ],
      getDrawerTabs: (row) => [
        {
          id: "question",
          label: "Question & Choices",
          lazy: true,
          render: () => <QuestionAndChoicesTab question={row} />,
        },
        {
          id: "attachments",
          label: "Attachments",
          lazy: true,
          render: () => <AttachmentsTab question={row} />,
        },
        {
          id: "explanation",
          label: "Explanation",
          lazy: true,
          render: () => <ExplanationTab question={row} />,
        },
        {
          id: "classification",
          label: "Classification",
          lazy: true,
          render: () => (
            <ClassificationTab
              question={row}
              courseName={courseMap.get(row.courseId)}
              chapterMap={chapterMap}
              lessonMap={lessonMap}
              conceptMap={conceptMap}
              atomicMap={atomicMap}
            />
          ),
        },
      ],
      fetchRows: async (query): Promise<WorkspaceResponse<QuestionWorkspaceRow>> => {
        const search = String(query.search || "").trim().toLowerCase();
        const activeFilters = query.filters as Record<string, string>;

        const filtered = questions.filter((question) => {
          const matchesSearch = !search
            || question.text.toLowerCase().includes(search)
            || (question.title || "").toLowerCase().includes(search)
            || question.publicCode.toLowerCase().includes(search)
            || (question.concept || "").toLowerCase().includes(search);
          if (!matchesSearch) return false;

          if (activeFilters.type && question.type !== activeFilters.type) return false;
          if (activeFilters.category) {
            const types = CATEGORY_MAP[activeFilters.category];
            if (types && !types.includes(question.type)) return false;
          }
          if (activeFilters.difficulty && question.difficulty !== activeFilters.difficulty) return false;
          if (activeFilters.status && question.status !== activeFilters.status) return false;
          if (activeFilters.course && question.courseId !== activeFilters.course) return false;
          if (activeFilters.chapter) {
            if (activeFilters.chapter === "__unclassified") {
              if (((question.chapterIds || []).length > 0) || question.chapterId) return false;
            } else if (!(question.chapterIds || []).includes(activeFilters.chapter) && question.chapterId !== activeFilters.chapter) {
              return false;
            }
          }
          if (activeFilters.lesson && !(question.lessonIds || []).includes(activeFilters.lesson)) return false;
          if (activeFilters.concept && !(question.conceptIds || []).includes(activeFilters.concept)) return false;
          if (activeFilters.atomic && !(question.atomicConceptIds || []).includes(activeFilters.atomic)) return false;
          if (activeFilters.source && (question.sourceLabel || question.source) !== activeFilters.source) return false;
          if (activeFilters.time) {
            const seconds = question.estimatedTimeSeconds || 0;
            if (activeFilters.time === "lt1" && !(seconds > 0 && seconds < 60)) return false;
            if (activeFilters.time === "1to3" && !(seconds >= 60 && seconds <= 180)) return false;
            if (activeFilters.time === "3to5" && !(seconds > 180 && seconds <= 300)) return false;
            if (activeFilters.time === "gt5" && !(seconds > 300)) return false;
          }
          if (activeFilters.usage) {
            if (activeFilters.usage === "used" && usageCount(question) === 0) return false;
            if (activeFilters.usage === "unused" && usageCount(question) > 0) return false;
            if (activeFilters.usage === "quiz" && (question.quizIds || []).length === 0) return false;
            if (activeFilters.usage === "exam" && (question.examIds || []).length === 0) return false;
            if (activeFilters.usage === "homework" && (question.homeworkIds || []).length === 0) return false;
            if (activeFilters.usage === "session" && (question.sessionIds || []).length === 0) return false;
            if (activeFilters.usage === "assessment" && (question.assessmentIds || []).length === 0) return false;
          }
          return true;
        });

        const sortField = (query.sort?.field as SortKey | undefined) || "updatedAt";
        const sortDirection = query.sort?.direction || "desc";
        const sorted = [...filtered].sort((left, right) => compareQuestions(left, right, sortField, sortDirection));
        const page = query.pagination.page || 1;
        const pageSize = query.pagination.pageSize || 100;
        const start = (page - 1) * pageSize;
        const pageRows = sorted.slice(start, start + pageSize).map((question) => ({
          ...question,
          subtitle: createSubtitle(question),
        }));

        return {
          rows: pageRows,
          totalCount: sorted.length,
          hasMore: start + pageSize < sorted.length,
          aggregates,
          availableFilters: Object.fromEntries(filterSchema.map((filter) => [filter.id, { options: filter.options || [], async: filter.type === "async-select" }])),
          availableSorts: SORT_OPTIONS.map((option) => ({
            field: option.field,
            label: option.label,
            direction: option.direction,
          })),
          pageInfo: {
            page,
            pageSize,
            nextCursor: null,
            prevCursor: null,
          },
        };
      },
      getDefaultModeContract: (): WorkspaceModeContract => ({
        mode: "browse",
        toolbarBehavior: {
          showSearch: true,
          showFilters: true,
          showSavedViews: false,
          showColumnManager: false,
          showExport: false,
          showBulkToolbar: false,
        },
        rowClickBehavior: "open-drawer",
        doubleClickBehavior: "open-drawer",
        ctaBehavior: null,
        keyboardShortcuts: [],
        drawerBehavior: {
          enabled: true,
          openOnRowClick: true,
          preserveTabOnRowChange: true,
        },
      }),
    };
  }, [
    aggregates,
    atomicMap,
    chapterMap,
    columns,
    conceptMap,
    courseMap,
    deleteQuestion,
    duplicateQuestion,
    filterSchema,
    lessonMap,
    navigate,
    publishQuestion,
    questions,
  ]);

  const headerSlot = showInsights ? (
    <div className="flex flex-wrap items-center gap-3">
      <Card className="flex items-center gap-2 border bg-card px-3 py-2">
        <Layers className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-sm font-bold">{questions.length}</span>
        <span className="text-xs text-muted-foreground">Total</span>
      </Card>
      <Card className="flex items-center gap-2 border bg-card px-3 py-2">
        <Eye className="h-4 w-4 shrink-0 text-emerald-500" />
        <span className="text-sm font-bold">{questions.filter((question) => question.status === "published").length}</span>
        <span className="text-xs text-muted-foreground">Published</span>
      </Card>
      <Card className="flex items-center gap-2 border bg-card px-3 py-2">
        <Upload className="h-4 w-4 shrink-0 text-amber-500" />
        <span className="text-sm font-bold">{questions.filter((question) => question.status === "draft").length}</span>
        <span className="text-xs text-muted-foreground">Drafts</span>
      </Card>
      <Card className="flex items-center gap-2 border bg-card px-3 py-2">
        <HelpCircle className="h-4 w-4 shrink-0 text-violet-500" />
        <span className="text-sm font-bold">{questions.filter((question) => (question.assessmentIds || []).length > 0).length}</span>
        <span className="text-xs text-muted-foreground">In Assessments</span>
      </Card>
      {createAction ? <div className="ms-auto">{createAction}</div> : null}
    </div>
  ) : createAction ? <div className="flex justify-end">{createAction}</div> : null;

  return (
    <Workspace
      adapter={adapter}
      initialQuery={DEFAULT_QUERY}
      title="Question Bank"
      emptyState={emptyState}
      headerSlot={headerSlot}
    />
  );
}
