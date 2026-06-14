import { BarChart3, CheckCircle2, ClipboardList, Clock3, HeartHandshake, Lightbulb, TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
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

const strengths = [
  { title: "Galvanic Cell", detail: "Strong accuracy in cell component questions.", value: "82%" },
  { title: "Stoichiometry", detail: "Reliable mole ratio and mass conversion practice.", value: "78%" },
];

const weaknesses = [
  { title: "Oxidation Number", detail: "Review lesson 3 and solve focused practice questions.", priority: "High" },
  { title: "Electrolysis", detail: "Watch the recap and retake the short quiz.", priority: "Medium" },
];

export function ParentDashboardPage() {
  return (
    <PageContainer>
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

      <Card className="p-6 sm:p-8">
        <SectionHeader
          eyebrow="Progress Summary"
          title="Current learning direction"
          description="A parent-friendly summary of course progress, weak areas, recommendations, and upcoming reporting."
        />
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-slate-950 p-5 text-white dark:bg-white dark:text-slate-950">
          <TrendingUp className="h-6 w-6 text-teal-300 dark:text-teal-700" aria-hidden="true" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] opacity-70">Overall progress</p>
          <p className="mt-2 font-display text-3xl font-semibold">68%</p>
          <p className="mt-2 text-sm leading-6 text-slate-300 dark:text-slate-600">Steady progress with focused revision recommended.</p>
        </Card>
        <Card className="p-5">
          <Lightbulb className="h-6 w-6 text-amber-600 dark:text-amber-300" aria-hidden="true" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Next action</p>
          <p className="mt-2 font-display text-xl font-semibold text-slate-950 dark:text-white">Short evening revision</p>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">A 25 minute practice session will fit the current study pattern.</p>
        </Card>
        <Card className="p-5">
          <ClipboardList className="h-6 w-6 text-violet-600 dark:text-violet-300" aria-hidden="true" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Reports</p>
          <p className="mt-2 font-display text-xl font-semibold text-slate-950 dark:text-white">Prepared for later phases</p>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Teacher updates and formal progress reports will appear here.</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-4">
          <Card className="p-6 sm:p-8">
            <SectionHeader
              eyebrow="Strengths"
              title="Confidence anchors"
              description="Subjects and concepts where the student is currently showing reliable understanding."
            />
          </Card>
          {strengths.map((strength) => (
            <Card key={strength.title} interactive className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-950 dark:text-white">{strength.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{strength.detail}</p>
                  </div>
                </div>
                <span className="ui-badge ui-badge-success">{strength.value}</span>
              </div>
            </Card>
          ))}
        </section>

        <section className="space-y-4">
          <Card className="p-6 sm:p-8">
            <SectionHeader
              eyebrow="Weaknesses"
              title="Support priorities"
              description="Areas where family support and teacher guidance can help most."
            />
          </Card>
          {weaknesses.map((weakness) => (
            <Card key={weakness.title} interactive className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
                    <TrendingDown className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-950 dark:text-white">{weakness.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{weakness.detail}</p>
                  </div>
                </div>
                <span className="ui-badge ui-badge-warning">{weakness.priority}</span>
              </div>
            </Card>
          ))}
        </section>
      </div>

      <Card className="p-6 sm:p-8">
        <SectionHeader
          eyebrow="Study Pattern"
          title="Best support rhythm"
          description="A simple routine summary for helping the student study consistently at home."
        />
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
              <Clock3 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-display text-xl font-semibold text-slate-950 dark:text-white">Evening sessions work best</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Average 28 minute sessions, 5 days weekly, with breaks every 25 minutes.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
