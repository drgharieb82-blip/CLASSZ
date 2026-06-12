import { CheckCircle2, Clock3, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { GradeStatus } from "./api";

const statusStyles: Record<GradeStatus, { labelKey: string; className: string; icon: typeof Clock3 }> = {
  PENDING: {
    labelKey: "grading.status.pending",
    className: "border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#FDE68A]",
    icon: Clock3,
  },
  GRADED: {
    labelKey: "grading.status.graded",
    className: "border-[#10B981]/30 bg-[#10B981]/10 text-[#A7F3D0]",
    icon: CheckCircle2,
  },
  RETURNED: {
    labelKey: "grading.status.returned",
    className: "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#BFDBFE]",
    icon: RotateCcw,
  },
};

export function GradeStatusBadge({ status }: { status: GradeStatus }) {
  const { t } = useTranslation();
  const style = statusStyles[status];
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1 text-xs font-semibold ${style.className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {t(style.labelKey)}
    </span>
  );
}
