import { AlertTriangle } from "lucide-react";
import { clsx } from "clsx";

import { Card } from "../../../components/ui/Card";
import type { DetectedWeakness } from "../types";

type DetectedWeaknessCardProps = {
  weakness: DetectedWeakness;
};

const severityClass = {
  low: "ui-badge-success",
  medium: "ui-badge-warning",
  high: "ui-badge-error",
};

export function DetectedWeaknessCard({ weakness }: DetectedWeaknessCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{weakness.subject}</p>
            <h3 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">{weakness.conceptName}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{weakness.recommendedAction}</p>
          </div>
        </div>
        <span className={clsx("ui-badge w-fit capitalize", severityClass[weakness.severity])}>{weakness.severity}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ui-badge ui-badge-neutral">{weakness.confidence}% confidence</span>
        {weakness.evidence.map((item) => (
          <span key={item} className="ui-badge ui-badge-neutral">
            {item}
          </span>
        ))}
      </div>
    </Card>
  );
}
