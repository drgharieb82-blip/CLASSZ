import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { SectionHeader } from "../../components/ui/SectionHeader";
import type { TeacherCourseOverviewItem } from "./api";

export function TeacherCourseOverview({ courses }: { courses: TeacherCourseOverviewItem[] }) {
  const { t } = useTranslation();

  return (
    <Card className="p-5 sm:p-6">
      <SectionHeader
        eyebrow={t("teacherDashboard.coursePerformance")}
        title={t("teacherDashboard.courseOverview")}
        icon={<BarChart3 className="h-6 w-6 text-teal-600 dark:text-teal-300" aria-hidden="true" />}
      />

      <div className="mt-5 space-y-3">
        {courses.length === 0 ? (
          <EmptyState description={t("teacherDashboard.courseEmpty")} />
        ) : (
          courses.map((course) => {
            const load = Math.min(100, course.lessons_count * 12 + course.quizzes_count * 8 + course.assignments_count * 8);
            return (
              <article
                key={course.id}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition duration-200 hover:border-teal-500/35 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-teal-300/35 dark:hover:bg-white/[0.07]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-950 dark:text-white">{course.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {course.subject} - {course.grade}
                    </p>
                  </div>
                  <span className={course.is_published ? "ui-badge ui-badge-success" : "ui-badge ui-badge-warning"}>
                    {course.is_published ? t("common.published") : t("common.draft")}
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-full rounded-full bg-teal-500 transition-all duration-500 dark:bg-teal-300" style={{ width: `${load}%` }} />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <span>
                    {t("teacherDashboard.courseMeta", {
                      lessons: course.lessons_count,
                      quizzes: course.quizzes_count,
                      assignments: course.assignments_count,
                    })}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </Card>
  );
}
