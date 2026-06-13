import { Sparkles } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { DetectedStrength } from "../types";

type DetectedStrengthCardProps = {
  strength: DetectedStrength;
};

export function DetectedStrengthCard({ strength }: DetectedStrengthCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{strength.subject}</p>
          <h3 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">{strength.conceptName}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{strength.reinforcementAction}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ui-badge ui-badge-success">{strength.confidence}% confidence</span>
        {strength.evidence.map((item) => (
          <span key={item} className="ui-badge ui-badge-neutral">
            {item}
          </span>
        ))}
      </div>
    </Card>
  );
}
