import { TimerReset } from "lucide-react";
import { clsx } from "clsx";

import { Card } from "../../../components/ui/Card";
import type { ConceptReviewNeed, ForgettingCurvePoint, ForgettingUrgency } from "../types";

type ForgettingCurveCardProps = {
  point: ForgettingCurvePoint;
  reviewNeed?: ConceptReviewNeed;
};

const urgencyClass: Record<ForgettingUrgency, string> = {
  Low: "ui-badge-success",
  Medium: "ui-badge-warning",
  High: "ui-badge-error",
  Critical: "ui-badge-error",
};

function formatDate(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function ForgettingCurveCard({ point, reviewNeed }: ForgettingCurveCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
            <TimerReset className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Retention {point.retentionScore}%
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">{point.conceptName}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {reviewNeed?.reason ?? "A spaced review session is recommended to protect long-term retention."}
            </p>
          </div>
        </div>
        <span className={clsx("ui-badge w-fit", urgencyClass[point.urgency])}>{point.urgency}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ui-badge ui-badge-neutral">Forgetting date {formatDate(point.predictedForgettingDate)}</span>
        <span className="ui-badge ui-badge-neutral">
          Review {formatDate(reviewNeed?.recommendedReviewAt ?? point.predictedForgettingDate)}
        </span>
      </div>
    </Card>
  );
}
