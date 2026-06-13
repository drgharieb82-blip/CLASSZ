import { BookOpen } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { Concept } from "../types";

type ConceptCardProps = {
  concept: Concept;
};

export function ConceptCard({ concept }: ConceptCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{concept.subject}</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-slate-950 dark:text-white">{concept.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{concept.description}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ui-badge ui-badge-neutral">{concept.chapter}</span>
        <span className="ui-badge bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">{concept.lesson}</span>
      </div>
    </Card>
  );
}
