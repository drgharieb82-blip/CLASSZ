import { Clock, PlayCircle } from "lucide-react";

import { formatDuration } from "./api";
import { ProgressBar } from "./ProgressBar";

type ContinueLearningCardProps = {
  title: string;
  progressPercent: number;
  lastPositionSeconds: number;
};

export function ContinueLearningCard({
  title,
  progressPercent,
  lastPositionSeconds,
}: ContinueLearningCardProps) {
  return (
    <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)] backdrop-blur">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#A855F7]">
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            Continue learning
          </p>
          <h2 className="mt-3 truncate font-[Poppins] text-2xl font-semibold text-[#F8FAFC]">{title}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-[#94A3B8]">
            <Clock className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
            Resume from {formatDuration(lastPositionSeconds)}
          </p>
        </div>
        <div className="w-full md:max-w-xs">
          <ProgressBar value={progressPercent} label="Lesson progress" />
        </div>
      </div>
    </section>
  );
}
