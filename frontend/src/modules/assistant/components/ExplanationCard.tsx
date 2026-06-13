import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { clsx } from "clsx";
import type { ReactNode } from "react";

import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import type { QuestionExplanation } from "../types";

type ExplanationCardProps = {
  explanation: QuestionExplanation | null;
  loading?: boolean;
};

const difficultyClasses = {
  easy: "ui-badge-success",
  medium: "ui-badge-warning",
  hard: "ui-badge-error",
};

export function ExplanationCard({ explanation, loading = false }: ExplanationCardProps) {
  if (loading) {
    return <LoadingSkeleton lines={5} />;
  }

  if (!explanation) {
    return (
      <EmptyState
        title="No explanation available"
        description="Structured answer explanations will appear here when the assistant service returns question feedback."
        icon={<HelpCircle className="h-5 w-5" aria-hidden="true" />}
      />
    );
  }

  return (
    <Card className="p-5">
      <SectionHeader
        eyebrow="Answer explanation"
        title={explanation.questionTitle}
        icon={<HelpCircle className="h-5 w-5 text-teal-600 dark:text-teal-300" aria-hidden="true" />}
        action={
          <span className={clsx("ui-badge capitalize", difficultyClasses[explanation.difficulty])}>
            {explanation.difficulty}
          </span>
        }
      />

      <div className="mt-5 grid gap-3">
        <AnswerBlock label="Selected answer" value={explanation.selectedAnswer} tone="wrong" />
        <AnswerBlock label="Correct answer" value={explanation.correctAnswer} tone="correct" />
      </div>

      <div className="mt-5 grid gap-4">
        <ExplanationBlock
          title="Why selected answer is wrong"
          description={explanation.wrongExplanation}
          icon={<XCircle className="h-5 w-5" aria-hidden="true" />}
          tone="wrong"
        />
        <ExplanationBlock
          title="Why correct answer is correct"
          description={explanation.correctExplanation}
          icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
          tone="correct"
        />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Related concept</p>
        <p className="mt-2 font-display text-base font-semibold text-slate-950 dark:text-white">{explanation.relatedConcept}</p>
      </div>
    </Card>
  );
}

function AnswerBlock({ label, value, tone }: { label: string; value: string; tone: "wrong" | "correct" }) {
  return (
    <div
      className={clsx(
        "rounded-xl border p-4",
        tone === "wrong"
          ? "border-rose-200 bg-rose-50/80 dark:border-rose-400/20 dark:bg-rose-400/10"
          : "border-emerald-200 bg-emerald-50/80 dark:border-emerald-400/20 dark:bg-emerald-400/10",
      )}
    >
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}

function ExplanationBlock({
  title,
  description,
  icon,
  tone,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  tone: "wrong" | "correct";
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <span
        className={clsx(
          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          tone === "wrong"
            ? "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200"
            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}
