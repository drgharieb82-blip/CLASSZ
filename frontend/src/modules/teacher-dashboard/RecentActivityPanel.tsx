import { Clock3 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { TeacherActivityItem } from "./api";

type RecentActivityPanelProps = {
  quizzes: TeacherActivityItem[];
  assignments: TeacherActivityItem[];
};

export function RecentActivityPanel({ quizzes, assignments }: RecentActivityPanelProps) {
  const { t } = useTranslation();
  const items = [...quizzes, ...assignments]
    .sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime())
    .slice(0, 8);

  return (
    <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <div className="flex items-center gap-3">
        <Clock3 className="h-5 w-5 text-[#A855F7]" aria-hidden="true" />
        <h2 className="font-[Poppins] text-2xl font-semibold text-[#F8FAFC]">{t("teacherDashboard.recentActivity")}</h2>
      </div>
      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <p className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.06] p-5 text-sm text-[#94A3B8]">
            {t("teacherDashboard.recentEmpty")}
          </p>
        ) : (
          items.map((item) => (
            <article key={`${item.activity_type}-${item.id}`} className="flex flex-col gap-2 rounded-[20px] border border-white/10 bg-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">{item.activity_type}</p>
                <h3 className="mt-1 font-semibold text-[#F8FAFC]">{item.title}</h3>
              </div>
              <time className="text-sm text-[#94A3B8]" dateTime={item.created_at}>
                {new Date(item.created_at).toLocaleDateString()}
              </time>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
