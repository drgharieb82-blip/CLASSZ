import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  ASSESSMENT_TYPE_LABELS,
  createAssessmentPreset,
  type ShowPolicy,
  type AssessmentRewards,
  type AssessmentSettings,
  type AssessmentType,
} from "@/lib/teacher/teacher-assessment-store";
import {
  useTeacherQuestionStore,
  type QuestionDifficulty,
  type QuestionStatus,
  type QuestionType,
} from "@/lib/teacher/teacher-question-store";

export const Route = createFileRoute("/teacher/assessments/create")({
  component: TeacherAssessmentsCreatePage,
});

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

type AssessmentDraft = {
  assessmentType: AssessmentType | null;
  title: string;
  subtitle: string;
  description: string;
  instructions: string;
  thumbnail: string;
  tags: string;
  questionIds: string[];
  settings: AssessmentSettings;
  rewards: AssessmentRewards;
};

function TeacherAssessmentsCreatePage() {
  const questions = useTeacherQuestionStore((state) => state.questions);
  const [activeStep, setActiveStep] = useState<(typeof ASSESSMENT_CREATE_STEPS)[number]>("Type");
  const [draft, setDraft] = useState<AssessmentDraft>({
    assessmentType: null,
    title: "",
    subtitle: "",
    description: "",
    instructions: "",
    thumbnail: "",
    tags: "",
    questionIds: [],
    settings: {},
    rewards: {},
  });
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] = useState<QuestionType | "all">("all");
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState<QuestionDifficulty | "all">("all");
  const [questionStatusFilter, setQuestionStatusFilter] = useState<QuestionStatus | "all">("all");

  const handleAssessmentTypeSelect = (assessmentType: AssessmentType) => {
    const preset = createAssessmentPreset(assessmentType);

    setDraft((current) => ({
      ...current,
      assessmentType,
      settings: preset.settings,
      rewards: preset.rewards,
    }));
  };

  const updateDraftField = <Field extends keyof AssessmentDraft>(field: Field, value: AssessmentDraft[Field]) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateDraftSettings = <Field extends keyof AssessmentSettings>(field: Field, value: AssessmentSettings[Field]) => {
    setDraft((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [field]: value,
      },
    }));
  };

  const filteredQuestions = questions.filter((question) => {
    const query = questionSearch.trim().toLowerCase();
    const matchesSearch = !query
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

  return (
    <DashPage
      role="teacher"
      title="Create Assessment"
      subtitle="Build quizzes, homework, exams, assignments and assessments from Question Bank."
      icon={ClipboardList}
    >
      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
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
                    <span className="text-sm font-medium">{step}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className="border bg-card p-5">
          {activeStep === "Type" ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold">Choose assessment type</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start with the format you want to build. Presets will prepare the default rules.
                </p>
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
              <div>
                <h2 className="text-sm font-semibold">Assessment identity</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add the title, description, and supporting details teachers and students will see later.
                </p>
              </div>

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
                  Search your question bank, filter the results, and attach only question IDs to this assessment.
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

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
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
                                {question.type.replace(/_/g, " ")}
                              </Badge>
                              <Badge variant="outline" className="rounded-full capitalize">
                                {question.difficulty}
                              </Badge>
                              <Badge variant="outline" className="rounded-full capitalize">
                                {question.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{question.publicCode}</span>
                            </div>

                            <p className="mt-3 text-sm font-medium">{question.title || question.text}</p>
                            {question.title ? (
                              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{question.text}</p>
                            ) : null}
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
                      <p className="text-sm text-muted-foreground">
                        Select questions from the list to build the assessment.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedQuestions.map((question, index) => (
                          <div key={question.id} className="rounded-xl border bg-card p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Question {index + 1}</p>
                                <p className="mt-1 text-sm font-medium">{question.title || question.text}</p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleQuestionSelection(question.id)}
                                className="shrink-0"
                              >
                                Remove
                              </Button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="outline" className="rounded-full">
                                {question.type.replace(/_/g, " ")}
                              </Badge>
                              <Badge variant="outline" className="rounded-full capitalize">
                                {question.difficulty}
                              </Badge>
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
              <div>
                <h2 className="text-sm font-semibold">Assessment settings</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Configure timing, attempts, grading, and answer visibility for this assessment.
                </p>
              </div>

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
                        updateDraftSettings(
                          option.key as keyof AssessmentSettings,
                          event.target.checked as AssessmentSettings[keyof AssessmentSettings],
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">{activeStep}</h2>
              <p className="text-sm text-muted-foreground">
                Step content placeholder
              </p>
            </div>
          )}
        </Card>

        <Card className="border bg-card p-5">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">Assessment summary</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Type</p>
                <p className="mt-1 font-medium">
                  {draft.assessmentType ? ASSESSMENT_TYPE_LABELS[draft.assessmentType] : "Not selected yet"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">Name</p>
                <p className="mt-1 font-medium">{draft.title || "Untitled assessment"}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">Questions</p>
                <p className="mt-1 font-medium">{draft.questionIds.length} selected</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">Duration</p>
                <p className="mt-1 font-medium">
                  {draft.settings.durationMinutes ? `${draft.settings.durationMinutes} minutes` : "Not set"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">Attempts</p>
                <p className="mt-1 font-medium">{draft.settings.attemptLimit ?? "Not set"}</p>
              </div>

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
            </div>
          </div>
        </Card>
      </div>
    </DashPage>
  );
}
