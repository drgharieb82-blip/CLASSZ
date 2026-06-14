import { MessagesSquare } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { PersonalTutorContext } from "../types";

type PersonalTutorContextCardProps = {
  context: PersonalTutorContext;
};

export function PersonalTutorContextCard({ context }: PersonalTutorContextCardProps) {
  return (
    <Card className="p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
          <MessagesSquare className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{context.preferredLearningStyle} learning style</p>
          <h3 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">Personal AI tutor context</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{context.studentSummary}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Key weaknesses</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {context.keyWeaknesses.map((weakness) => (
              <span key={weakness} className="ui-badge ui-badge-warning">
                {weakness}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Key strengths</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {context.keyStrengths.map((strength) => (
              <span key={strength} className="ui-badge ui-badge-success">
                {strength}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-950 dark:text-white">Next action: </span>
          {context.nextRecommendedAction}
        </p>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-950 dark:text-white">Tutor instructions: </span>
          {context.tutorInstructions}
        </p>
      </div>
    </Card>
  );
}
