import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { DashPage } from "@/components/common/DashPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ASSESSMENT_TYPE_LABELS,
  createAssessmentPreset,
  useTeacherAssessmentStore,
  type AssessmentRewards,
  type AssessmentSettings,
  type AssessmentType,
  type AssessmentVisibility,
  type ShowPolicy,
  type TeacherAssessment,
} from "@/lib/teacher/teacher-assessment-store";
import { useTeacherChapterStore } from "@/lib/teacher/teacher-chapter-store";
import { useContentTreeStore } from "@/lib/teacher/content-tree-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { useTeacherLessonStore } from "@/lib/teacher/teacher-lesson-store";
import {
  useTeacherQuestionStore,
  type QuestionDifficulty,
  type QuestionStatus,
  type QuestionType,
} from "@/lib/teacher/teacher-question-store";
import { useTeacherSessionStore } from "@/lib/teacher/teacher-session-store";

const ASSESSMENT_CREATE_STEPS = [
  "Type",
  "Identity",
  "Questions",
  "Settings",
  "Availability",
  "Rewards",
  "Academic Linking",
  "Preview",
  "Publish",
] as const;

const ASSESSMENT_TYPE_OPTIONS: AssessmentType[] = [
  "practice_quiz",
  "session_quiz",
  "revision_quiz",
  "homework",
  "exam",
  "mock_exam",
  "final_exam",
  "placement_test",
  "diagnostic_test",
  "assignment",
  "project",
  "research",
  "presentation",
  "adaptive_assessment",
  "custom",
];

const QUESTION_OPTIONAL_TYPES: AssessmentType[] = [
  "assignment",
  "project",
  "research",
  "presentation",
  "custom",
];

const TEMPLATE_CONFIG = {
  chapter_quiz: {
    label: "Chapter Quiz",
    type: "practice_quiz" as AssessmentType,
    description: "Fast formative checkpoint with shuffled questions.",
  },
  homework: {
    label: "Homework",
    type: "homework" as AssessmentType,
    description: "Take-home practice with due date and late submission support.",
  },
  weekly_exam: {
    label: "Weekly Exam",
    type: "exam" as AssessmentType,
    description: "Timed weekly assessment with score and pass threshold.",
  },
  final_exam: {
    label: "Final Exam",
    type: "final_exam" as AssessmentType,
    description: "High-stakes final with strict timer and no answer reveal.",
  },
  diagnostic: {
    label: "Diagnostic",
    type: "diagnostic_test" as AssessmentType,
    description: "Measure understanding gaps before instruction.",
  },
  assignment: {
    label: "Assignment",
    type: "assignment" as AssessmentType,
    description: "Manual review workflow with instructions or uploads.",
  },
  custom: {
    label: "Custom",
    type: "custom" as AssessmentType,
    description: "Start from a blank assessment and configure everything.",
  },
} as const;

export type AssessmentTemplateKey = keyof typeof TEMPLATE_CONFIG;

type AssessmentDraft = {
  assessmentType: AssessmentType | null;
  title: string;
  subtitle: string;
  description: string;
  instructions: string;
  thumbnail: string;
  tags: string;
  questionIds: string[];
  courseIds: string[];
  chapterIds: string[];
  lessonIds: string[];
  conceptIds: string[];
  atomicConceptIds: string[];
  sessionIds: string[];
  visibility: AssessmentVisibility;
  settings: AssessmentSettings;
  rewards: AssessmentRewards;
};

type AcademicLinkRow = {
  courseId: string;
  chapterId: string;
  lessonId: string;
  conceptId: string;
  atomicConceptId: string;
  sessionId: string;
};

const createEmptyDraft = (): AssessmentDraft => ({
  assessmentType: null,
  title: "",
  subtitle: "",
  description: "",
  instructions: "",
  thumbnail: "",
  tags: "",
  questionIds: [],
  courseIds: [],
  chapterIds: [],
  lessonIds: [],
  conceptIds: [],
  atomicConceptIds: [],
  sessionIds: [],
  visibility: "enrolled_only",
  settings: {},
  rewards: {},
});

function buildDraftFromAssessment(assessment: TeacherAssessment): AssessmentDraft {
  return {
    assessmentType: assessment.assessmentType,
    title: assessment.title || "",
    subtitle: assessment.subtitle || "",
    description: assessment.description || "",
    instructions: assessment.instructions || "",
    thumbnail: assessment.thumbnail || "",
    tags: (assessment.tags || []).join(", "),
    questionIds: assessment.questionIds || [],
    courseIds: assessment.courseIds || [],
    chapterIds: assessment.chapterIds || [],
    lessonIds: assessment.lessonIds || [],
    conceptIds: assessment.conceptIds || [],
    atomicConceptIds: assessment.atomicConceptIds || [],
    sessionIds: assessment.sessionIds || [],
    visibility: assessment.visibility || "enrolled_only",
    settings: { ...assessment.settings },
    rewards: { ...assessment.rewards },
  };
}

function buildTemplateDraft(templateKey?: AssessmentTemplateKey): AssessmentDraft {
  if (!templateKey) return createEmptyDraft();
  const template = TEMPLATE_CONFIG[templateKey];
  const preset = createAssessmentPreset(template.type);
  return {
    ...createEmptyDraft(),
    assessmentType: template.type,
    title: template.label,
    description: template.description,
    settings: preset.settings,
    rewards: preset.rewards,
  };
}

function buildAcademicRowsFromDraft(draft: AssessmentDraft): AcademicLinkRow[] {
  const rowCount = Math.max(
    draft.courseIds.length,
    draft.chapterIds.length,
    draft.lessonIds.length,
    draft.conceptIds.length,
    draft.atomicConceptIds.length,
    draft.sessionIds.length,
    1,
  );

  return Array.from({ length: rowCount }, (_, index) => ({
    courseId: draft.courseIds[index] || "",
    chapterId: draft.chapterIds[index] || "",
    lessonId: draft.lessonIds[index] || "",
    conceptId: draft.conceptIds[index] || "",
    atomicConceptId: draft.atomicConceptIds[index] || "",
    sessionId: draft.sessionIds[index] || "",
  }));
}

function SummaryRow({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  const display = value === undefined || value === null || value === "" ? "—" : String(value);
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className={cn("font-medium", mono && "font-mono", display === "—" && "text-muted-foreground")}>
        {display}
      </span>
    </div>
  );
}

export function AssessmentWorkspace({
  assessmentId,
  template,
}: {
  assessmentId?: string;
  template?: AssessmentTemplateKey;
}) {
  const navigate = useNavigate();
  const assessments = useTeacherAssessmentStore((state) => state.assessments);
  const createAssessment = useTeacherAssessmentStore((state) => state.createAssessment);
  const updateAssessment = useTeacherAssessmentStore((state) => state.updateAssessment);
  const questions = useTeacherQuestionStore((state) => state.questions);
  const courses = useTeacherCourseStore((state) => state.courses);
  const chapters = useTeacherChapterStore((state) => state.chapters);
  const lessons = useTeacherLessonStore((state) => state.lessons);
  const sessions = useTeacherSessionStore((state) => state.sessions);
  const treeNodes = useContentTreeStore((state) => state.nodes);
  const existingAssessment = assessments.find((assessment) => assessment.id === assessmentId);

  const [activeStep, setActiveStep] = useState<(typeof ASSESSMENT_CREATE_STEPS)[number]>("Type");
  const [draft, setDraft] = useState<AssessmentDraft>(() =>
    existingAssessment ? buildDraftFromAssessment(existingAssessment) : buildTemplateDraft(template),
  );
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] = useState<QuestionType | "all">("all");
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState<QuestionDifficulty | "all">("all");
  const [questionStatusFilter, setQuestionStatusFilter] = useState<QuestionStatus | "all">("all");
  const [academicRows, setAcademicRows] = useState<AcademicLinkRow[]>(() =>
    buildAcademicRowsFromDraft(existingAssessment ? buildDraftFromAssessment(existingAssessment) : buildTemplateDraft(template)),
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (existingAssessment) {
      const nextDraft = buildDraftFromAssessment(existingAssessment);
      setDraft(nextDraft);
      setAcademicRows(buildAcademicRowsFromDraft(nextDraft));
      return;
    }

    if (!assessmentId) {
      const nextDraft = buildTemplateDraft(template);
      setDraft(nextDraft);
      setAcademicRows(buildAcademicRowsFromDraft(nextDraft));
    }
  }, [assessmentId, existingAssessment, template]);

  const pageTitle = assessmentId ? "Edit Assessment" : "Create Assessment";
  const pageSubtitle = assessmentId
    ? "Update settings, questions, rewards, and academic links without changing the current architecture."
    : "Build quizzes, homework, exams, assignments and assessments from Question Bank.";

  const updateDraftField = <Field extends keyof AssessmentDraft>(field: Field, value: AssessmentDraft[Field]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateDraftSettings = <Field extends keyof AssessmentSettings>(
    field: Field,
    value: AssessmentSettings[Field],
  ) => {
    setDraft((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [field]: value,
      },
    }));
  };

  const updateDraftRewards = <Field extends keyof AssessmentRewards>(
    field: Field,
    value: AssessmentRewards[Field],
  ) => {
    setDraft((current) => ({
      ...current,
      rewards: {
        ...current.rewards,
        [field]: value,
      },
    }));
  };

  const handleAssessmentTypeSelect = (assessmentType: AssessmentType) => {
    const preset = createAssessmentPreset(assessmentType);
    setDraft((current) => ({
      ...current,
      assessmentType,
      settings: {
        ...preset.settings,
        ...current.settings,
      },
      rewards: {
        ...preset.rewards,
        ...current.rewards,
      },
    }));
  };

  const filteredQuestions = questions.filter((question) => {
    const query = questionSearch.trim().toLowerCase();
    const matchesSearch =
      !query
      || question.text.toLowerCase().includes(query)
      || (question.title || "").toLowerCase().includes(query)
      || question.publicCode.toLowerCase().includes(query)
      || question.concept.toLowerCase().includes(query);
    const matchesType = questionTypeFilter === "all" || question.type === questionTypeFilter;
    const matchesDifficulty = questionDifficultyFilter === "all" || question.difficulty === questionDifficultyFilter;
    const matchesStatus = questionStatusFilter === "all" || question.status === questionStatusFilter;
    return matchesSearch && matchesType && matchesDifficulty && matchesStatus;
  });

  const selectedQuestions = draft.questionIds
    .map((questionId) => questions.find((question) => question.id === questionId))
    .filter((question): question is NonNullable<typeof question> => Boolean(question));

  const toggleQuestionSelection = (questionId: string) => {
    setDraft((current) => ({
      ...current,
      questionIds: current.questionIds.includes(questionId)
        ? current.questionIds.filter((existingQuestionId) => existingQuestionId !== questionId)
        : [...current.questionIds, questionId],
    }));
  };

  const updateAcademicRow = (
    rowIndex: number,
    field: keyof AcademicLinkRow,
    value: string,
  ) => {
    setAcademicRows((current) =>
      current.map((row, index) => {
        if (index !== rowIndex) return row;
        if (field === "courseId") {
          return { courseId: value, chapterId: "", lessonId: "", conceptId: "", atomicConceptId: "", sessionId: "" };
        }
        if (field === "chapterId") {
          return { ...row, chapterId: value, lessonId: "", conceptId: "", atomicConceptId: "", sessionId: "" };
        }
        if (field === "lessonId") {
          return { ...row, lessonId: value, conceptId: "", atomicConceptId: "" };
        }
        if (field === "conceptId") {
          return { ...row, conceptId: value, atomicConceptId: "" };
        }
        return { ...row, [field]: value };
      }),
    );
  };

  const addAcademicRow = () => {
    setAcademicRows((current) => [
      ...current,
      { courseId: "", chapterId: "", lessonId: "", conceptId: "", atomicConceptId: "", sessionId: "" },
    ]);
  };

  const normalizedAcademicRows = academicRows.filter((row) =>
    row.courseId || row.chapterId || row.lessonId || row.conceptId || row.atomicConceptId || row.sessionId,
  );

  const publishAllowsNoQuestions = Boolean(
    draft.assessmentType
    && QUESTION_OPTIONAL_TYPES.includes(draft.assessmentType)
    && (draft.instructions.trim() || draft.settings.fileUploadAllowed),
  );

  const validationMessages = [
    !draft.assessmentType ? "No assessment type selected." : null,
    !draft.title.trim() ? "Missing name." : null,
    !draft.description.trim() ? "Missing description." : null,
  ].filter((message): message is string => Boolean(message));

  const publishValidationMessages = [
    ...validationMessages,
    draft.questionIds.length === 0 && !publishAllowsNoQuestions
      ? "Publishing blocked: no questions selected."
      : null,
    draft.questionIds.length === 0 && publishAllowsNoQuestions
      ? "Questions are optional for this assessment because instructions or file upload are enabled."
      : null,
  ].filter((message): message is string => Boolean(message));

  const rewardsConfigured = Boolean(
    draft.rewards.xpReward
    || draft.rewards.passScoreBonus
    || draft.rewards.perfectScoreBonus
    || draft.rewards.maxRetakeXp
    || draft.rewards.walletCoinsReward,
  );

  const academicLinkCount = normalizedAcademicRows.length;

  const saveAssessment = (status: "draft" | "published") => {
    const issues = status === "published"
      ? publishValidationMessages.filter(
        (message) =>
          message !== "Questions are optional for this assessment because instructions or file upload are enabled.",
      )
      : validationMessages;

    if (issues.length > 0 || !draft.assessmentType) {
      const nextError = issues[0] ?? "Complete the required fields before continuing.";
      setSubmitError(nextError);
      toast.error(nextError);
      setActiveStep("Publish");
      return;
    }

    const courseIds = [...new Set(normalizedAcademicRows.map((row) => row.courseId).filter(Boolean))];
    const chapterIds = [...new Set(normalizedAcademicRows.map((row) => row.chapterId).filter(Boolean))];
    const lessonIds = [...new Set(normalizedAcademicRows.map((row) => row.lessonId).filter(Boolean))];
    const conceptIds = [...new Set(normalizedAcademicRows.map((row) => row.conceptId).filter(Boolean))];
    const atomicConceptIds = [...new Set(normalizedAcademicRows.map((row) => row.atomicConceptId).filter(Boolean))];
    const sessionIds = [...new Set(normalizedAcademicRows.map((row) => row.sessionId).filter(Boolean))];

    const payload = {
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      description: draft.description.trim(),
      instructions: draft.instructions.trim(),
      thumbnail: draft.thumbnail.trim(),
      tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      assessmentType: draft.assessmentType,
      questionIds: draft.questionIds,
      courseIds,
      chapterIds,
      lessonIds,
      conceptIds,
      atomicConceptIds,
      sessionIds,
      settings: draft.settings,
      rewards: {
        ...draft.rewards,
        allowRetakeXp: typeof draft.rewards.maxRetakeXp === "number" && draft.rewards.maxRetakeXp > 0,
      },
      visibility: draft.visibility,
      updatedBy: "Teacher",
      status,
    };

    if (existingAssessment) {
      updateAssessment(existingAssessment.id, payload);
      toast.success(status === "published" ? "Assessment published." : "Draft updated.");
    } else {
      createAssessment({
        ...payload,
        createdBy: "Teacher",
      });
      toast.success(status === "published" ? "Assessment published." : "Draft saved.");
    }

    setSubmitError(null);
    sessionStorage.setItem("classz-content-studio-tab", "assessments");
    navigate({ to: "/teacher/content-studio" });
  };

  if (assessmentId && !existingAssessment) {
    return (
      <DashPage
        role="teacher"
        title="Assessment Not Found"
        subtitle="The requested assessment could not be loaded."
        icon={ClipboardList}
      >
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Choose another assessment from the Assessment Engine.
          </p>
          <Button asChild>
            <Link to="/teacher/content-studio">Back to Content Studio</Link>
          </Button>
        </Card>
      </DashPage>
    );
  }

  return (
    <DashPage role="teacher" title={pageTitle} subtitle={pageSubtitle} icon={ClipboardList}>
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link
          to="/teacher/content-studio"
          className="font-medium text-foreground transition-colors hover:text-primary"
          onClick={() => sessionStorage.setItem("classz-content-studio-tab", "assessments")}
        >
          Content Studio
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>Assessment Engine</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{pageTitle}</span>
      </div>

      <Link
        to="/teacher/content-studio"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => sessionStorage.setItem("classz-content-studio-tab", "assessments")}
      >
        ← Back to Assessment Engine
      </Link>

      {existingAssessment?.status === "published" ? (
        <Card className="border-amber-300 bg-amber-500/5 p-4 text-sm text-amber-700">
          Changes affect future attempts only.
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        <Card className="border bg-card p-5">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Build flow</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Move step by step and fill each section when ready.
              </p>
            </div>

            <div className="space-y-2">
              {ASSESSMENT_CREATE_STEPS.map((step, index) => {
                const isActive = step === activeStep;
                const hasIssue = step === "Publish"
                  && publishValidationMessages.some((message) => !message.includes("optional"));

                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setActiveStep(step)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">{step}</span>
                    {hasIssue ? (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] text-destructive">
                        Warn
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className="border bg-card p-5">
          {activeStep === "Type" ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-semibold">Choose assessment type</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start with a template or pick a type directly.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(TEMPLATE_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDraft(buildTemplateDraft(key as AssessmentTemplateKey))}
                    className="rounded-2xl border p-4 text-left transition-colors hover:bg-accent"
                  >
                    <p className="text-sm font-semibold">{config.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{config.description}</p>
                    <p className="mt-3 text-[11px] font-medium text-primary">Create From Template</p>
                  </button>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {ASSESSMENT_TYPE_OPTIONS.map((assessmentType) => {
                  const isSelected = draft.assessmentType === assessmentType;

                  return (
                    <button
                      key={assessmentType}
                      type="button"
                      onClick={() => handleAssessmentTypeSelect(assessmentType)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-colors",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-accent",
                      )}
                    >
                      <p className="text-sm font-semibold">{ASSESSMENT_TYPE_LABELS[assessmentType]}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {assessmentType.replace(/_/g, " ")}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : activeStep === "Identity" ? (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold">Assessment identity</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="assessment-name">Name *</Label>
                  <Input
                    id="assessment-name"
                    value={draft.title}
                    onChange={(event) => updateDraftField("title", event.target.value)}
                    placeholder="Assessment name"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="assessment-subtitle">Subtitle</Label>
                  <Input
                    id="assessment-subtitle"
                    value={draft.subtitle}
                    onChange={(event) => updateDraftField("subtitle", event.target.value)}
                    placeholder="Short supporting line"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="assessment-description">Description *</Label>
                  <Textarea
                    id="assessment-description"
                    value={draft.description}
                    onChange={(event) => updateDraftField("description", event.target.value)}
                    placeholder="Describe the purpose and scope of this assessment"
                    rows={5}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="assessment-instructions">Instructions</Label>
                  <Textarea
                    id="assessment-instructions"
                    value={draft.instructions}
                    onChange={(event) => updateDraftField("instructions", event.target.value)}
                    placeholder="Instructions students should read before starting"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessment-thumbnail">Thumbnail URL</Label>
                  <Input
                    id="assessment-thumbnail"
                    value={draft.thumbnail}
                    onChange={(event) => updateDraftField("thumbnail", event.target.value)}
                    placeholder="https://example.com/cover.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessment-tags">Tags</Label>
                  <Input
                    id="assessment-tags"
                    value={draft.tags}
                    onChange={(event) => updateDraftField("tags", event.target.value)}
                    placeholder="midterm, algebra, timed"
                  />
                </div>
              </div>
            </div>
          ) : activeStep === "Questions" ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-semibold">Manual question selection</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Search your question bank and attach only question IDs to this assessment.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2 xl:col-span-4">
                  <Label htmlFor="question-search">Search</Label>
                  <Input
                    id="question-search"
                    value={questionSearch}
                    onChange={(event) => setQuestionSearch(event.target.value)}
                    placeholder="Search by text, concept, title, or code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question-type-filter">Type</Label>
                  <select
                    id="question-type-filter"
                    value={questionTypeFilter}
                    onChange={(event) => setQuestionTypeFilter(event.target.value as QuestionType | "all")}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="all">All types</option>
                    {Array.from(new Set(questions.map((question) => question.type))).map((questionType) => (
                      <option key={questionType} value={questionType}>
                        {questionType.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question-difficulty-filter">Difficulty</Label>
                  <select
                    id="question-difficulty-filter"
                    value={questionDifficultyFilter}
                    onChange={(event) => setQuestionDifficultyFilter(event.target.value as QuestionDifficulty | "all")}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="all">All difficulties</option>
                    {["easy", "medium", "hard", "advanced"].map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question-status-filter">Status</Label>
                  <select
                    id="question-status-filter"
                    value={questionStatusFilter}
                    onChange={(event) => setQuestionStatusFilter(event.target.value as QuestionStatus | "all")}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="all">All statuses</option>
                    {["draft", "published", "archived"].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Available questions</p>
                    <p className="text-xs text-muted-foreground">{filteredQuestions.length} matches</p>
                  </div>
                  <div className="max-h-[28rem] space-y-2 overflow-y-auto">
                    {filteredQuestions.length === 0 ? (
                      <Card className="border-dashed p-6 text-center text-sm text-muted-foreground">
                        No questions match the current search and filters.
                      </Card>
                    ) : (
                      filteredQuestions.map((question) => {
                        const isSelected = draft.questionIds.includes(question.id);

                        return (
                          <button
                            key={question.id}
                            type="button"
                            onClick={() => toggleQuestionSelection(question.id)}
                            className={cn(
                              "w-full rounded-2xl border p-4 text-left transition-colors",
                              isSelected
                                ? "border-primary bg-primary/10"
                                : "border-border hover:bg-accent",
                            )}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="rounded-full">
                                {question.publicCode}
                              </Badge>
                              <Badge variant="outline" className="rounded-full">
                                {question.type.replace(/_/g, " ")}
                              </Badge>
                              <Badge variant="outline" className="rounded-full capitalize">
                                {question.difficulty}
                              </Badge>
                            </div>
                            <p className="mt-3 text-sm font-medium">{question.title || question.text}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{question.text}</p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <Card className="border bg-muted/20 p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Selected questions</p>
                      <Badge variant="secondary" className="rounded-full">
                        {selectedQuestions.length}
                      </Badge>
                    </div>
                    {selectedQuestions.length === 0 ? (
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p>No questions selected yet.</p>
                        <Button type="button" variant="outline" size="sm" onClick={() => setActiveStep("Questions")}>
                          Select Questions
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedQuestions.map((question, index) => (
                          <div key={question.id} className="rounded-xl border bg-card p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Question {index + 1}</p>
                                <p className="mt-1 text-sm font-medium">{question.publicCode}</p>
                                <p className="text-xs text-muted-foreground">
                                  {question.type.replace(/_/g, " ")} · {question.difficulty}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleQuestionSelection(question.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          ) : activeStep === "Settings" ? (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold">Assessment settings</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="settings-duration">Duration (minutes)</Label>
                  <Input
                    id="settings-duration"
                    type="number"
                    min="0"
                    value={draft.settings.durationMinutes ?? ""}
                    onChange={(event) => updateDraftSettings("durationMinutes", event.target.value ? Number(event.target.value) : undefined)}
                    placeholder="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-attempts">Attempts</Label>
                  <Input
                    id="settings-attempts"
                    type="number"
                    min="1"
                    value={draft.settings.attemptLimit ?? ""}
                    onChange={(event) => updateDraftSettings("attemptLimit", event.target.value ? Number(event.target.value) : undefined)}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-total-score">Total score</Label>
                  <Input
                    id="settings-total-score"
                    type="number"
                    min="0"
                    value={draft.settings.totalScore ?? ""}
                    onChange={(event) => updateDraftSettings("totalScore", event.target.value ? Number(event.target.value) : undefined)}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-passing-score">Passing score</Label>
                  <Input
                    id="settings-passing-score"
                    type="number"
                    min="0"
                    value={draft.settings.passingScorePercent ?? ""}
                    onChange={(event) => updateDraftSettings("passingScorePercent", event.target.value ? Number(event.target.value) : undefined)}
                    placeholder="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-show-answers">Show answers policy</Label>
                  <select
                    id="settings-show-answers"
                    value={draft.settings.showAnswersPolicy ?? "after_submit"}
                    onChange={(event) => updateDraftSettings("showAnswersPolicy", event.target.value as ShowPolicy)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="immediately">Immediately</option>
                    <option value="after_submit">After submit</option>
                    <option value="after_due_date">After due date</option>
                    <option value="never">Never</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-show-explanations">Show explanations policy</Label>
                  <select
                    id="settings-show-explanations"
                    value={draft.settings.showExplanationPolicy ?? "after_submit"}
                    onChange={(event) => updateDraftSettings("showExplanationPolicy", event.target.value as ShowPolicy)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="immediately">Immediately</option>
                    <option value="after_submit">After submit</option>
                    <option value="after_due_date">After due date</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { key: "hasStrictTimer", label: "Strict timer" },
                  { key: "shuffleQuestions", label: "Shuffle questions" },
                  { key: "shuffleChoices", label: "Shuffle choices" },
                  { key: "manualReviewRequired", label: "Manual review" },
                  { key: "autoGradeAllowed", label: "Auto grade" },
                  { key: "fileUploadAllowed", label: "File upload allowed" },
                ].map((option) => (
                  <label
                    key={option.key}
                    className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm"
                  >
                    <span>{option.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(draft.settings[option.key as keyof AssessmentSettings])}
                      onChange={(event) =>
                        updateDraftSettings(option.key as keyof AssessmentSettings, event.target.checked as never)
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : activeStep === "Availability" ? (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold">Availability</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="availability-start">Start at</Label>
                  <Input
                    id="availability-start"
                    type="datetime-local"
                    value={draft.settings.startAt ?? ""}
                    onChange={(event) => updateDraftSettings("startAt", event.target.value || undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability-end">End at</Label>
                  <Input
                    id="availability-end"
                    type="datetime-local"
                    value={draft.settings.endAt ?? ""}
                    onChange={(event) => updateDraftSettings("endAt", event.target.value || undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability-due-date">Due date</Label>
                  <Input
                    id="availability-due-date"
                    type="datetime-local"
                    value={draft.settings.dueDate ?? ""}
                    onChange={(event) => updateDraftSettings("dueDate", event.target.value || undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability-visibility">Visibility</Label>
                  <select
                    id="availability-visibility"
                    value={draft.visibility}
                    onChange={(event) => updateDraftField("visibility", event.target.value as AssessmentVisibility)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="private">Private</option>
                    <option value="course">Course</option>
                    <option value="enrolled_only">Enrolled only</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm">
                <span>Late submission</span>
                <input
                  type="checkbox"
                  checked={Boolean(draft.settings.allowLateSubmission)}
                  onChange={(event) => updateDraftSettings("allowLateSubmission", event.target.checked)}
                />
              </label>
            </div>
          ) : activeStep === "Rewards" ? (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold">Rewards</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rewards-xp">XP reward</Label>
                  <Input
                    id="rewards-xp"
                    type="number"
                    min="0"
                    value={draft.rewards.xpReward ?? ""}
                    onChange={(event) => updateDraftRewards("xpReward", event.target.value ? Number(event.target.value) : undefined)}
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rewards-pass-bonus">Pass bonus</Label>
                  <Input
                    id="rewards-pass-bonus"
                    type="number"
                    min="0"
                    value={draft.rewards.passScoreBonus ?? ""}
                    onChange={(event) => updateDraftRewards("passScoreBonus", event.target.value ? Number(event.target.value) : undefined)}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rewards-perfect-bonus">Perfect bonus</Label>
                  <Input
                    id="rewards-perfect-bonus"
                    type="number"
                    min="0"
                    value={draft.rewards.perfectScoreBonus ?? ""}
                    onChange={(event) => updateDraftRewards("perfectScoreBonus", event.target.value ? Number(event.target.value) : undefined)}
                    placeholder="25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rewards-retake-xp">Retake XP</Label>
                  <Input
                    id="rewards-retake-xp"
                    type="number"
                    min="0"
                    value={draft.rewards.maxRetakeXp ?? ""}
                    onChange={(event) => updateDraftRewards("maxRetakeXp", event.target.value ? Number(event.target.value) : undefined)}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rewards-wallet-coins">Wallet coins</Label>
                  <Input
                    id="rewards-wallet-coins"
                    type="number"
                    min="0"
                    value={draft.rewards.walletCoinsReward ?? ""}
                    onChange={(event) => updateDraftRewards("walletCoinsReward", event.target.value ? Number(event.target.value) : undefined)}
                    placeholder="0"
                  />
                </div>
              </div>

              {!rewardsConfigured ? (
                <Card className="border-dashed p-4 text-sm text-muted-foreground">
                  No rewards configured yet. Add XP or bonuses if you want to motivate students.
                </Card>
              ) : null}
            </div>
          ) : activeStep === "Academic Linking" ? (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold">Academic linking</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {academicRows.map((row, rowIndex) => {
                  const rowChapters = row.courseId
                    ? chapters.filter((chapter) => chapter.courseId === row.courseId)
                    : [];
                  const rowLessons = row.chapterId
                    ? lessons.filter((lesson) => lesson.chapterIds.includes(row.chapterId))
                    : [];
                  const rowConcepts = row.lessonId
                    ? treeNodes.filter((node) => node.type === "concept" && node.parentId === row.lessonId)
                    : [];
                  const rowAtomicConcepts = row.conceptId
                    ? treeNodes.filter((node) => node.type === "atomic_concept" && node.parentId === row.conceptId)
                    : [];
                  const rowSessions = row.courseId
                    ? sessions.filter(
                      (session) =>
                        session.courseId === row.courseId
                        && (!row.chapterId || session.chapterId === row.chapterId),
                    )
                    : [];

                  return (
                    <div key={`academic-row-${rowIndex}`} className="grid gap-4 rounded-2xl border p-4 md:grid-cols-2 xl:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Course</Label>
                        <select
                          value={row.courseId}
                          onChange={(event) => updateAcademicRow(rowIndex, "courseId", event.target.value)}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">No course</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Chapter</Label>
                        <select
                          value={row.chapterId}
                          onChange={(event) => updateAcademicRow(rowIndex, "chapterId", event.target.value)}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">{row.courseId ? "No chapter" : "No chapter available"}</option>
                          {rowChapters.map((chapter) => (
                            <option key={chapter.id} value={chapter.id}>
                              {chapter.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Lesson</Label>
                        <select
                          value={row.lessonId}
                          onChange={(event) => updateAcademicRow(rowIndex, "lessonId", event.target.value)}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">{row.chapterId ? "No lesson" : "No lesson available"}</option>
                          {rowLessons.map((lesson) => (
                            <option key={lesson.id} value={lesson.id}>
                              {lesson.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Concept</Label>
                        <select
                          value={row.conceptId}
                          onChange={(event) => updateAcademicRow(rowIndex, "conceptId", event.target.value)}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">{row.lessonId ? "No concept" : "No concept available"}</option>
                          {rowConcepts.map((concept) => (
                            <option key={concept.id} value={concept.id}>
                              {concept.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Atomic Concept</Label>
                        <select
                          value={row.atomicConceptId}
                          onChange={(event) => updateAcademicRow(rowIndex, "atomicConceptId", event.target.value)}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">{row.conceptId ? "No atomic concept" : "No atomic concept available"}</option>
                          {rowAtomicConcepts.map((atomicConcept) => (
                            <option key={atomicConcept.id} value={atomicConcept.id}>
                              {atomicConcept.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Session</Label>
                        <select
                          value={row.sessionId}
                          onChange={(event) => updateAcademicRow(rowIndex, "sessionId", event.target.value)}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">{row.courseId ? "No session" : "No session available"}</option>
                          {rowSessions.map((session) => (
                            <option key={session.id} value={session.id}>
                              {session.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button type="button" variant="outline" size="sm" onClick={addAcademicRow}>
                Add new row
              </Button>

              {academicLinkCount === 0 ? (
                <Card className="border-dashed p-4 text-sm text-muted-foreground">
                  No academic mapping yet. Add one if you want this assessment linked into the course structure.
                </Card>
              ) : null}
            </div>
          ) : activeStep === "Preview" ? (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold">Preview</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Type</p>
                  <p className="mt-2 text-lg font-semibold">
                    {draft.assessmentType ? ASSESSMENT_TYPE_LABELS[draft.assessmentType] : "Not selected"}
                  </p>
                </Card>
                <Card className="border bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Title</p>
                  <p className="mt-2 text-lg font-semibold">{draft.title || "Untitled assessment"}</p>
                </Card>
                <Card className="border bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Description</p>
                  <p className="mt-2 text-sm text-muted-foreground">{draft.description || "No description yet"}</p>
                </Card>
                <Card className="border bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Questions count</p>
                  <p className="mt-2 text-lg font-semibold">{draft.questionIds.length}</p>
                </Card>
                <Card className="border bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Duration</p>
                  <p className="mt-2 text-lg font-semibold">
                    {draft.settings.durationMinutes ? `${draft.settings.durationMinutes} min` : "Not set"}
                  </p>
                </Card>
                <Card className="border bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Score</p>
                  <p className="mt-2 text-lg font-semibold">{draft.settings.totalScore ?? "Not set"}</p>
                </Card>
                <Card className="border bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">XP</p>
                  <p className="mt-2 text-lg font-semibold">{draft.rewards.xpReward ?? "Not set"}</p>
                </Card>
                <Card className="border bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Attempts</p>
                  <p className="mt-2 text-lg font-semibold">{draft.settings.attemptLimit ?? "Not set"}</p>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold">Save or publish</h2>
              <Card className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-sm font-medium">Draft validation</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {validationMessages.length === 0 ? (
                    <li>Ready to save as draft.</li>
                  ) : (
                    validationMessages.map((message) => <li key={message}>{message}</li>)
                  )}
                </ul>
              </Card>
              <Card className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-sm font-medium">Publish validation</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {publishValidationMessages.length === 0 ? (
                    <li>Ready to publish.</li>
                  ) : (
                    publishValidationMessages.map((message) => <li key={message}>{message}</li>)
                  )}
                </ul>
              </Card>
              {submitError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {submitError}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => saveAssessment("draft")}>
                  {existingAssessment ? "Update Draft" : "Save Draft"}
                </Button>
                <Button type="button" variant="outline" onClick={() => saveAssessment("published")}>
                  {existingAssessment ? "Update & Publish" : "Publish Assessment"}
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="border bg-card p-5">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">Assessment summary</h2>
            <div className="space-y-3 text-sm">
              <SummaryRow label="Type" value={draft.assessmentType ? ASSESSMENT_TYPE_LABELS[draft.assessmentType] : "Not selected yet"} />
              <SummaryRow label="Name" value={draft.title || "Untitled assessment"} />
              <SummaryRow label="Questions" value={`${draft.questionIds.length} selected`} />
              <SummaryRow label="Duration" value={draft.settings.durationMinutes ? `${draft.settings.durationMinutes} minutes` : "Not set"} />
              <SummaryRow label="Attempts" value={draft.settings.attemptLimit ?? "Not set"} />
              <SummaryRow label="Total score" value={draft.settings.totalScore ?? "Not set"} />
              <SummaryRow label="XP reward" value={draft.rewards.xpReward ?? "Not set"} />
              <SummaryRow label="Visibility" value={draft.visibility.replace(/_/g, " ")} />
              <SummaryRow label="Academic links" value={academicLinkCount} />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Description</p>
                <p className="mt-1 text-muted-foreground">
                  {draft.description || "Add a description to explain the assessment scope."}
                </p>
              </div>
              {draft.tags ? (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Tags</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {draft.tags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                      .map((tag) => (
                        <Badge key={tag} variant="outline" className="rounded-full">
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="button" size="sm" onClick={() => saveAssessment("draft")}>
                  {existingAssessment ? "Update Draft" : "Save Draft"}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => saveAssessment("published")}>
                  Publish
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashPage>
  );
}
