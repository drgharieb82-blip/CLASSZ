import { ListChecks } from "lucide-react";
import { clsx } from "clsx";

import { Card } from "../../../components/ui/Card";
import type { PersonalizedRecommendation } from "../types";

type RecommendationCardProps = {
  recommendation: PersonalizedRecommendation;
};

const priorityClass = {
  low: "ui-badge-success",
  medium: "ui-badge-warning",
  high: "ui-badge-error",
};

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
            <ListChecks className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{recommendation.actionType}</p>
            <h3 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">{recommendation.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{recommendation.description}</p>
          </div>
        </div>
        <span className={clsx("ui-badge w-fit capitalize", priorityClass[recommendation.priority])}>{recommendation.priority}</span>
      </div>
      <span className="ui-badge ui-badge-neutral mt-4">{recommendation.relatedConcept}</span>
    </Card>
  );
}
