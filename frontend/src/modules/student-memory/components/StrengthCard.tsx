import { CheckCircle2 } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { StudentStrength } from "../types";

type StrengthCardProps = {
  strength: StudentStrength;
};

export function StrengthCard({ strength }: StrengthCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{strength.subject}</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-slate-950 dark:text-white">{strength.conceptName}</h3>
          </div>
        </div>
        <span className="ui-badge ui-badge-success">{strength.masteryLevel}%</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{strength.evidence}</p>
    </Card>
  );
}
