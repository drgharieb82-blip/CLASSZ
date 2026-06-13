import { TimerReset } from "lucide-react";
import { clsx } from "clsx";

import { Card } from "../../../components/ui/Card";
import type { ForgettingCurveItem } from "../types";

type ForgettingRiskCardProps = {
  risk: ForgettingCurveItem;
};

const riskClass = {
  low: "ui-badge-success",
  medium: "ui-badge-warning",
  high: "ui-badge-error",
};

function formatDate(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function ForgettingRiskCard({ risk }: ForgettingRiskCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
            <TimerReset className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Retention {risk.retentionScore}%</p>
            <h3 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">{risk.conceptName}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{risk.recommendation}</p>
          </div>
        </div>
        <span className={clsx("ui-badge w-fit capitalize", riskClass[risk.riskLevel])}>{risk.riskLevel}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ui-badge ui-badge-neutral">Last reviewed {formatDate(risk.lastReviewedAt)}</span>
        <span className="ui-badge ui-badge-neutral">Next review {formatDate(risk.nextReviewAt)}</span>
      </div>
    </Card>
  );
}
