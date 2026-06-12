import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { Assignment } from "./api";
import { DeadlineBadge } from "./DeadlineBadge";

export function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const { t } = useTranslation();

  return (
    <Link
      to={`/assignments/${assignment.id}`}
      className="block rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)] transition hover:-translate-y-0.5 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#A855F7]">
            <FileText className="h-4 w-4" aria-hidden="true" />
            {t("assignments.assignment")}
          </p>
          <h2 className="mt-3 font-[Poppins] text-xl font-semibold text-[#F8FAFC]">{assignment.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#94A3B8]">
            {assignment.description ?? t("assignments.instructionsPlaceholder")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <DeadlineBadge deadlineAt={assignment.deadline_at} />
          <span className="rounded-2xl border border-white/10 bg-[#111827]/72 px-3 py-2 text-sm font-semibold text-[#CBD5E1]">
            {t("common.points", { count: assignment.max_points })}
          </span>
        </div>
      </div>
    </Link>
  );
}
