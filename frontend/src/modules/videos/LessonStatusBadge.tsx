import { CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";

import type { LessonStatus } from "./ChapterAccordion";

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    className: "border-[#10B981]/30 bg-[#10B981]/12 text-[#6EE7B7]",
  },
  current: {
    icon: PlayCircle,
    label: "Current",
    className: "border-[#A855F7]/40 bg-[#7C3AED]/18 text-[#E9D5FF]",
  },
  locked: {
    icon: Lock,
    label: "Locked",
    className: "border-white/10 bg-white/[0.06] text-[#94A3B8]",
  },
} satisfies Record<LessonStatus, { icon: typeof Circle; label: string; className: string }>;

export function LessonStatusBadge({ status }: { status: LessonStatus }) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-2xl border px-2.5 py-1 text-xs font-semibold",
        config.className,
      ].join(" ")}
    >
      <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}
