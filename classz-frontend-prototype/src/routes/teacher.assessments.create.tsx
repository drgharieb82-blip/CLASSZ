import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  ASSESSMENT_TYPE_LABELS,
  createAssessmentPreset,
  type AssessmentRewards,
  type AssessmentSettings,
  type AssessmentType,
} from "@/lib/teacher/teacher-assessment-store";

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
  settings: AssessmentSettings;
  rewards: AssessmentRewards;
};

function TeacherAssessmentsCreatePage() {
  const [activeStep, setActiveStep] = useState<(typeof ASSESSMENT_CREATE_STEPS)[number]>("Type");
  const [draft, setDraft] = useState<AssessmentDraft>({
    assessmentType: null,
    title: "",
    subtitle: "",
    description: "",
    instructions: "",
    thumbnail: "",
    tags: "",
    settings: {},
    rewards: {},
  });

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
