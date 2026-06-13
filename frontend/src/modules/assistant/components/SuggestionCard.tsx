import { Lightbulb } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { RevisionSuggestion } from "../types";

type SuggestionCardProps = {
  suggestion?: RevisionSuggestion;
};

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  return (
    <Card interactive className="p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
          <Lightbulb className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-slate-950 dark:text-white">
            {suggestion?.title ?? "Revision suggestion"}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {suggestion?.description ?? "Personalized assistant suggestions will appear here."}
          </p>
        </div>
      </div>
    </Card>
  );
}
