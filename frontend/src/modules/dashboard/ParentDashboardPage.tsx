import { BarChart3, ClipboardList, HeartHandshake, Lightbulb, TrendingUp } from "lucide-react";

import { RoleDashboard, type DashboardPlaceholder, type DashboardStat } from "./RoleDashboard";

const stats: DashboardStat[] = [
  { label: "Child progress", value: "68%", icon: TrendingUp, tone: "primary", helperText: "Mock learning trend" },
  { label: "Weakness areas", value: "4", icon: BarChart3, tone: "warning", helperText: "Needs attention" },
  { label: "Recommendations", value: "7", icon: Lightbulb, tone: "success", helperText: "Study ideas queued" },
  { label: "Reports", value: "Soon", icon: ClipboardList, tone: "secondary", helperText: "Reporting shell ready" },
];

const placeholders: DashboardPlaceholder[] = [
  {
    title: "Child progress",
    description: "Course progress, attendance signals, and achievement snapshots will be summarized here.",
    icon: <TrendingUp className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Weakness summary",
    description: "Recurring weak concepts and recent struggle areas will be translated into parent-friendly guidance.",
    icon: <BarChart3 className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Study recommendations",
    description: "Suggested study windows, revision focus, and support actions will appear here.",
    icon: <Lightbulb className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Reports",
    description: "Progress reports and teacher updates will collect in this section when reporting arrives.",
    icon: <ClipboardList className="h-5 w-5" aria-hidden="true" />,
  },
];

export function ParentDashboardPage() {
  return (
    <RoleDashboard
      eyebrow="Parent dashboard"
      title="Welcome to your family progress view."
      description="Follow your child’s learning direction, understand weak areas, and prepare for reports without adding backend dependencies."
      stats={stats}
      sectionsTitle="Parent support modules"
      sectionsDescription="These sections establish the parent route as a focused family dashboard."
      placeholders={placeholders}
      aside={
        <div className="rounded-xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_12px_32px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/72">
          <HeartHandshake className="h-7 w-7 text-teal-600 dark:text-teal-300" aria-hidden="true" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Family support</p>
          <p className="mt-3 font-display text-3xl font-semibold leading-tight text-slate-950 dark:text-white">Clear signals</p>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Parent-facing views stay calm, scannable, and action-oriented.
          </p>
        </div>
      }
    />
  );
}
