import { Activity, BookMarked, CircleDollarSign, ShieldCheck } from "lucide-react";

const metrics = [
  { label: "Active roles", value: "5", icon: ShieldCheck },
  { label: "Module shells", value: "15", icon: BookMarked },
  { label: "API status", value: "Ready", icon: Activity },
  { label: "Billing", value: "Stub", icon: CircleDollarSign },
];

export function DashboardPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <section className="rounded-md border border-ink-950/10 bg-chalk/88 p-5 shadow-panel dark:border-white/10 dark:bg-white/7 sm:p-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-campus-500">
            Foundation
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight text-ink-950 dark:text-chalk">
            A modular education platform ready to grow carefully.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink-600 dark:text-ink-100">
            CLASSZ starts as a clean monolith with feature boundaries, role-aware layouts,
            API health checks, database configuration, and Docker wiring in place.
          </p>
        </div>
      </section>

      <section className="rounded-md border border-ink-950/10 bg-ink-950 p-5 text-chalk shadow-panel dark:border-white/10 dark:bg-chalk dark:text-ink-950 sm:p-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-70">Platform Mode</p>
        <div className="mt-5 space-y-4">
          {["Monolith first", "Module isolated", "Postgres ready", "JWT prepared"].map((item) => (
            <div key={item} className="flex items-center justify-between border-b border-white/12 pb-3 dark:border-ink-950/12">
              <span className="font-semibold">{item}</span>
              <span className="rounded-sm bg-campus-400 px-2 py-1 text-xs font-extrabold text-ink-950">
                on
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:col-span-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-md border border-ink-950/10 bg-white/78 p-5 dark:border-white/10 dark:bg-white/7"
          >
            <metric.icon className="h-5 w-5 text-signal-500" aria-hidden="true" />
            <p className="mt-4 text-sm font-semibold text-ink-600 dark:text-ink-300">
              {metric.label}
            </p>
            <p className="mt-2 text-3xl font-extrabold">{metric.value}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
