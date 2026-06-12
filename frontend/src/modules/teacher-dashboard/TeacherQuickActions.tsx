import { BookOpen, ClipboardCheck, FilePlus2, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const actions = [
  { labelKey: "teacherDashboard.actions.createCourse", href: "/courses", icon: BookOpen },
  { labelKey: "teacherDashboard.actions.createQuiz", href: "/quizzes/builder", icon: GraduationCap },
  { labelKey: "teacherDashboard.actions.createAssignment", href: "/assignments", icon: FilePlus2 },
  { labelKey: "teacherDashboard.actions.reviewGrading", href: "/grading", icon: ClipboardCheck },
];

export function TeacherQuickActions() {
  const { t } = useTranslation();

  return (
    <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#A855F7]">{t("teacherDashboard.eyebrow")}</p>
          <h1 className="mt-3 font-[Poppins] text-4xl font-semibold text-[#F8FAFC]">{t("teacherDashboard.welcome")}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#CBD5E1]">
            {t("teacherDashboard.description")}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map((action) => (
            <Link
              key={action.labelKey}
              to={action.href}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-[#F8FAFC] transition hover:border-[#A855F7]/45 hover:bg-white/[0.10]"
            >
              <action.icon className="h-4 w-4 text-[#A855F7]" aria-hidden="true" />
              {t(action.labelKey)}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
