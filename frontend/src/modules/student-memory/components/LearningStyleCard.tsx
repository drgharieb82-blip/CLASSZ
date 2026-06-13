import { BrainCircuit } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import type { LearningPreference, StudentProfile } from "../types";

type LearningStyleCardProps = {
  profile: StudentProfile;
  preference?: LearningPreference;
};

export function LearningStyleCard({ profile, preference }: LearningStyleCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
          <BrainCircuit className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Learning style</p>
          <h3 className="mt-1 font-display text-lg font-semibold capitalize text-slate-950 dark:text-white">{profile.learningStyle}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Best with {preference?.bestContentType ?? "mixed"} content at {profile.preferredDifficulty} difficulty.
          </p>
        </div>
      </div>
    </Card>
  );
}
