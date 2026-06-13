import { type ReactNode } from "react";
import { Inbox } from "lucide-react";
import { clsx } from "clsx";

type EmptyStateProps = {
  title?: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center dark:border-white/15 dark:bg-white/[0.04]",
        className,
      )}
    >
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm dark:bg-white/10 dark:text-slate-300">
        {icon ?? <Inbox className="h-5 w-5" aria-hidden="true" />}
      </div>
      {title ? <h3 className="mt-4 font-display text-base font-semibold text-slate-950 dark:text-white">{title}</h3> : null}
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
