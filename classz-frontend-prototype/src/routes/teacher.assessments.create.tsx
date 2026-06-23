import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

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

function TeacherAssessmentsCreatePage() {
  const [activeStep, setActiveStep] = useState<(typeof ASSESSMENT_CREATE_STEPS)[number]>("Type");

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
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">{activeStep}</h2>
            <p className="text-sm text-muted-foreground">
              Step content placeholder
            </p>
          </div>
        </Card>

        <Card className="border bg-card p-5">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">Assessment summary</h2>
            <p className="text-sm text-muted-foreground">
              Assessment summary placeholder
            </p>
          </div>
        </Card>
      </div>
    </DashPage>
  );
}
