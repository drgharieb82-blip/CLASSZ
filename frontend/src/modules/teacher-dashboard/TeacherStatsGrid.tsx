import { BookOpen, ClipboardList, FileText, GraduationCap, Layers, Users, type LucideIcon } from "lucide-react";

import type { TeacherDashboardSummary } from "./api";

type StatItem = {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
};

export function TeacherStatsGrid({ summary }: { summary: TeacherDashboardSummary }) {
  const stats: StatItem[] = [
    { label: "Courses", value: summary.total_courses, icon: BookOpen, color: "#A855F7" },
    { label: "Lessons", value: summary.total_lessons, icon: Layers, color: "#3B82F6" },
    { label: "Quizzes", value: summary.quizzes_count, icon: GraduationCap, color: "#10B981" },
    { label: "Assignments", value: summary.assignments_count, icon: FileText, color: "#F59E0B" },
    { label: "Pending grading", value: summary.pending_grading_count, icon: ClipboardList, color: "#EF4444" },
    { label: "Students", value: summary.total_students, icon: Users, color: "#3B82F6" },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {stats.map((stat) => (
        <article key={stat.label} className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-[#94A3B8]">{stat.label}</span>
            <stat.icon className="h-5 w-5" style={{ color: stat.color }} aria-hidden="true" />
          </div>
          <p className="mt-4 font-[Poppins] text-3xl font-semibold text-[#F8FAFC]">{stat.value}</p>
        </article>
      ))}
    </section>
  );
}
