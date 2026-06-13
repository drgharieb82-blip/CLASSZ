import { AlertTriangle } from "lucide-react";
import { clsx } from "clsx";

import { Card } from "../../../components/ui/Card";
import type { StudentWeakness } from "../types";

type WeaknessCardProps = {
  weakness: StudentWeakness;
};

const priorityClass = {
  low: "ui-badge-success",
  medium: "ui-badge-warning",
  high: "ui-badge-error",
};

export function WeaknessCard({ weakness }: WeaknessCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{weakness.subject}</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-slate-950 dark:text-white">{weakness.conceptName}</h3>
          </div>
        </div>
        <span className={clsx("ui-badge capitalize", priorityClass[weakness.priority])}>{weakness.priority}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{weakness.recommendedAction}</p>
    </Card>
  );
}
