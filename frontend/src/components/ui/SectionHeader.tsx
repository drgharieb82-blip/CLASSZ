import { type ReactNode } from "react";
import { clsx } from "clsx";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({ eyebrow, title, description, icon, action, className }: SectionHeaderProps) {
  return (
    <div className={clsx("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-600 dark:text-teal-300">{eyebrow}</p>
        ) : null}
        <div className="mt-1 flex items-center gap-3">
          {icon}
          <h2 className="font-display text-2xl font-semibold leading-tight text-slate-950 dark:text-white">{title}</h2>
        </div>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
