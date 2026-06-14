import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { StatCard } from "../../components/ui/StatCard";

type StatTone = "primary" | "secondary" | "success" | "warning" | "error" | "neutral";

export type DashboardStat = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: StatTone;
  helperText?: string;
};

export type DashboardPlaceholder = {
  title: string;
  description: string;
  icon: ReactNode;
};

type RoleDashboardProps = {
  eyebrow: string;
  title: string;
  description: string;
  stats: DashboardStat[];
  sectionsTitle: string;
  sectionsDescription: string;
  placeholders: DashboardPlaceholder[];
  aside?: ReactNode;
};

export function RoleDashboard({
  eyebrow,
  title,
  description,
  stats,
  sectionsTitle,
  sectionsDescription,
  placeholders,
  aside,
}: RoleDashboardProps) {
  return (
    <PageContainer>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-6 sm:p-8">
          <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        </Card>

        {aside ?? (
          <Card className="bg-slate-950 p-6 text-white dark:bg-white dark:text-slate-950 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-70">Workspace status</p>
            <p className="mt-4 font-display text-3xl font-semibold leading-tight">Ready</p>
            <p className="mt-3 text-sm leading-6 text-slate-300 dark:text-slate-600">
              This dashboard is wired for role-aware routing and prepared for future modules.
            </p>
          </Card>
        )}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <Card className="p-6 sm:p-8">
        <SectionHeader title={sectionsTitle} description={sectionsDescription} />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {placeholders.map((placeholder) => (
            <EmptyState
              key={placeholder.title}
              title={placeholder.title}
              description={placeholder.description}
              icon={placeholder.icon}
              className="h-full"
            />
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}
