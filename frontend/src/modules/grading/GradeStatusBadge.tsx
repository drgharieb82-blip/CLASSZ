import { CheckCircle2, Clock3, RotateCcw } from "lucide-react";

import type { GradeStatus } from "./api";

const statusStyles: Record<GradeStatus, { label: string; className: string; icon: typeof Clock3 }> = {
  PENDING: {
    label: "Pending",
    className: "border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#FDE68A]",
    icon: Clock3,
  },
  GRADED: {
    label: "Graded",
    className: "border-[#10B981]/30 bg-[#10B981]/10 text-[#A7F3D0]",
    icon: CheckCircle2,
  },
  RETURNED: {
    label: "Returned",
    className: "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#BFDBFE]",
    icon: RotateCcw,
  },
};

export function GradeStatusBadge({ status }: { status: GradeStatus }) {
  const style = statusStyles[status];
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1 text-xs font-semibold ${style.className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {style.label}
    </span>
  );
}
