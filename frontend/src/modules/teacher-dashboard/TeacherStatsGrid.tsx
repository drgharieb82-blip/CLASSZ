import { BookOpen, ClipboardList, FileText, GraduationCap, Layers, Users, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StatCard } from "../../components/ui/StatCard";
import type { TeacherDashboardSummary } from "./api";

type StatItem = {
  labelKey: string;
  value: number;
  icon: LucideIcon;
  tone: "primary" | "secondary" | "success" | "warning" | "error" | "neutral";
};

export function TeacherStatsGrid({ summary }: { summary: TeacherDashboardSummary }) {
  const { t } = useTranslation();
  const stats: StatItem[] = [
    { labelKey: "teacherDashboard.stats.courses", value: summary.total_courses, icon: BookOpen, tone: "secondary" },
    { labelKey: "teacherDashboard.stats.lessons", value: summary.total_lessons, icon: Layers, tone: "primary" },
    { labelKey: "teacherDashboard.stats.quizzes", value: summary.quizzes_count, icon: GraduationCap, tone: "success" },
    { labelKey: "teacherDashboard.stats.assignments", value: summary.assignments_count, icon: FileText, tone: "warning" },
    { labelKey: "teacherDashboard.stats.pendingGrading", value: summary.pending_grading_count, icon: ClipboardList, tone: "error" },
    { labelKey: "teacherDashboard.stats.students", value: summary.total_students, icon: Users, tone: "primary" },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {stats.map((stat) => (
        <StatCard key={stat.labelKey} label={t(stat.labelKey)} value={stat.value} icon={stat.icon} tone={stat.tone} />
      ))}
    </section>
  );
}
