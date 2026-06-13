import { Activity, BookMarked, CircleDollarSign, ShieldCheck } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { StatCard } from "../../components/ui/StatCard";

const metrics = [
  { label: "Active roles", value: "5", icon: ShieldCheck, tone: "primary" },
  { label: "Module shells", value: "15", icon: BookMarked, tone: "secondary" },
  { label: "API status", value: "Ready", icon: Activity, tone: "success" },
  { label: "Billing", value: "Stub", icon: CircleDollarSign, tone: "warning" },
] as const;

export function DashboardPage() {
  return (
    <PageContainer className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <Card className="p-6 sm:p-8">
        <SectionHeader
          eyebrow="Foundation"
          title="A modular education platform ready to grow carefully."
          description="CLASSZ starts as a clean monolith with feature boundaries, role-aware layouts, API health checks, database configuration, and Docker wiring in place."
        />
      </Card>

      <Card className="bg-slate-950 p-6 text-white dark:bg-white dark:text-slate-950 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-70">Platform Mode</p>
        <div className="mt-5 space-y-4">
          {["Monolith first", "Module isolated", "Postgres ready", "JWT prepared"].map((item) => (
            <div key={item} className="flex items-center justify-between border-b border-white/12 pb-3 last:border-0 dark:border-slate-950/12">
              <span className="font-semibold">{item}</span>
              <span className="ui-badge bg-teal-300 text-slate-950">on</span>
            </div>
          ))}
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:col-span-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            tone={metric.tone}
          />
        ))}
      </section>
    </PageContainer>
  );
}
