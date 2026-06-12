import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { TeacherCourseOverviewItem } from "./api";

export function TeacherCourseOverview({ courses }: { courses: TeacherCourseOverviewItem[] }) {
  const { t } = useTranslation();

  return (
    <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A855F7]">{t("teacherDashboard.coursePerformance")}</p>
          <h2 className="mt-2 font-[Poppins] text-2xl font-semibold text-[#F8FAFC]">{t("teacherDashboard.courseOverview")}</h2>
        </div>
        <BarChart3 className="h-6 w-6 text-[#3B82F6]" aria-hidden="true" />
      </div>

      <div className="mt-5 space-y-3">
        {courses.length === 0 ? (
          <p className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.06] p-5 text-sm text-[#94A3B8]">
            {t("teacherDashboard.courseEmpty")}
          </p>
        ) : (
          courses.map((course) => {
            const load = Math.min(100, course.lessons_count * 12 + course.quizzes_count * 8 + course.assignments_count * 8);
            return (
              <article key={course.id} className="rounded-[20px] border border-white/10 bg-white/[0.06] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-[Poppins] text-lg font-semibold text-[#F8FAFC]">{course.title}</h3>
                    <p className="mt-1 text-sm text-[#94A3B8]">
                      {course.subject} • {course.grade}
                    </p>
                  </div>
                  <span className={`rounded-2xl px-3 py-1 text-xs font-semibold ${course.is_published ? "bg-[#10B981]/10 text-[#A7F3D0]" : "bg-[#F59E0B]/10 text-[#FDE68A]"}`}>
                    {course.is_published ? t("common.published") : t("common.draft")}
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#3B82F6]" style={{ width: `${load}%` }} />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-[#CBD5E1]">
                  <span>{t("teacherDashboard.courseMeta", { lessons: course.lessons_count, quizzes: course.quizzes_count, assignments: course.assignments_count })}</span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
