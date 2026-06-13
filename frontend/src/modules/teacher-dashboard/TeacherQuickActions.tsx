import { BookOpen, ClipboardCheck, FilePlus2, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Card } from "../../components/ui/Card";

const actions = [
  { labelKey: "teacherDashboard.actions.createCourse", href: "/courses", icon: BookOpen },
  { labelKey: "teacherDashboard.actions.createQuiz", href: "/quizzes/builder", icon: GraduationCap },
  { labelKey: "teacherDashboard.actions.createAssignment", href: "/assignments", icon: FilePlus2 },
  { labelKey: "teacherDashboard.actions.reviewGrading", href: "/grading", icon: ClipboardCheck },
];

export function TeacherQuickActions() {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden bg-slate-950 p-6 text-white dark:bg-white dark:text-slate-950 sm:p-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-300 dark:text-teal-700">{t("teacherDashboard.eyebrow")}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight">{t("teacherDashboard.welcome")}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300 dark:text-slate-600">
            {t("teacherDashboard.description")}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map((action) => (
            <Link
              key={action.labelKey}
              to={action.href}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-teal-300/45 hover:bg-white/[0.14] dark:border-slate-950/10 dark:bg-slate-950/[0.06] dark:text-slate-950 dark:hover:border-teal-600/45"
            >
              <action.icon className="h-4 w-4 text-teal-300 dark:text-teal-700" aria-hidden="true" />
              {t(action.labelKey)}
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
}
