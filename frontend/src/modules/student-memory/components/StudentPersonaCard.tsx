import { UserRoundCog } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { StudentPersona } from "../types";

type StudentPersonaCardProps = {
  persona: StudentPersona;
};

export function StudentPersonaCard({ persona }: StudentPersonaCardProps) {
  return (
    <Card className="p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
          <UserRoundCog className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{persona.learningStyle} learning style</p>
          <h3 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">{persona.personaName}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{persona.recommendedTeachingApproach}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Strength traits</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {persona.strengthTraits.map((trait) => (
              <span key={trait.id} className="ui-badge ui-badge-success">
                {trait.name}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Risk traits</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {persona.riskTraits.map((trait) => (
              <span key={trait.id} className="ui-badge ui-badge-warning">
                {trait.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
