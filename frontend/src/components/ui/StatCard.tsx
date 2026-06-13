import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

import { Card } from "./Card";

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "primary" | "secondary" | "success" | "warning" | "error" | "neutral";
  helperText?: string;
  className?: string;
};

const toneClasses = {
  primary: "bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200",
  secondary: "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200",
  error: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200",
  neutral: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
};

export function StatCard({ label, value, icon: Icon, tone = "primary", helperText, className }: StatCardProps) {
  return (
    <Card interactive className={clsx("p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold leading-none text-slate-950 dark:text-white">{value}</p>
          {helperText ? <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{helperText}</p> : null}
        </div>
        {Icon ? (
          <span className={clsx("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", toneClasses[tone])}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </Card>
  );
}
