import { BookOpenCheck } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { RevisionSuggestion } from "../types";

type RevisionCardProps = {
  revision?: RevisionSuggestion;
};

export function RevisionCard({ revision }: RevisionCardProps) {
  return (
    <Card interactive className="p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
          <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-slate-950 dark:text-white">
            {revision?.title ?? "Revision plan"}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {revision?.description ?? "Targeted revision plans will be shown here."}
          </p>
        </div>
      </div>
    </Card>
  );
}
