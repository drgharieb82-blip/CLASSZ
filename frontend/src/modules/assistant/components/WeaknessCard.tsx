import { AlertTriangle } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { StudentWeakness } from "../types";

type WeaknessCardProps = {
  weakness?: StudentWeakness;
};

const severityClass = {
  low: "ui-badge-success",
  medium: "ui-badge-warning",
  high: "ui-badge-error",
};

export function WeaknessCard({ weakness }: WeaknessCardProps) {
  const severity = weakness?.severity ?? "medium";

  return (
    <Card interactive className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold text-slate-950 dark:text-white">
              {weakness?.conceptName ?? "Concept weakness"}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Score: {weakness?.score ?? 0}%
            </p>
          </div>
        </div>
        <span className={`ui-badge ${severityClass[severity]}`}>{severity}</span>
      </div>
    </Card>
  );
}
