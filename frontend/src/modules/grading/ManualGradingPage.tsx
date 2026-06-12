import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ClipboardCheck, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";

import { listPendingGrades } from "./api";
import { PendingGradeCard } from "./PendingGradeCard";

export function ManualGradingPage() {
  const { t } = useTranslation();
  const { data: grades = [], isError, isLoading } = useQuery({
    queryKey: ["manual-grades", "pending"],
    queryFn: listPendingGrades,
  });

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  if (isError) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        {t("grading.loadError")}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#A855F7]">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              {t("grading.queueEyebrow")}
            </p>
            <h1 className="mt-3 font-[Poppins] text-4xl font-semibold text-[#F8FAFC]">{t("grading.queueTitle")}</h1>
            <p className="mt-3 max-w-2xl leading-7 text-[#CBD5E1]">
              {t("grading.queueDescription")}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-2 text-sm font-semibold text-[#FDE68A]">
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            {t("grading.pending", { count: grades.length })}
          </span>
        </div>
      </section>

      {grades.length === 0 ? (
        <section className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.06] p-8 text-center">
          <ClipboardCheck className="mx-auto h-8 w-8 text-[#A855F7]" aria-hidden="true" />
          <h2 className="mt-4 font-[Poppins] text-xl font-semibold text-[#F8FAFC]">{t("grading.emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-xl leading-7 text-[#94A3B8]">
            {t("grading.emptyDescription")}
          </p>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {grades.map((grade) => (
            <PendingGradeCard key={grade.id} grade={grade} />
          ))}
        </section>
      )}
    </div>
  );
}
