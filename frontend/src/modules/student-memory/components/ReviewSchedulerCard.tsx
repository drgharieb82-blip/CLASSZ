import { CalendarClock, ListChecks } from "lucide-react";
import { clsx } from "clsx";

import { Card } from "../../../components/ui/Card";
import type { ReviewPriority, ReviewSession } from "../types";

type ReviewSchedulerCardProps = {
  session: ReviewSession;
};

const priorityClass: Record<ReviewPriority, string> = {
  Low: "ui-badge-success",
  Medium: "ui-badge-warning",
  High: "ui-badge-error",
  Critical: "ui-badge-error",
};

function formatDate(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function ReviewSchedulerCard({ session }: ReviewSchedulerCardProps) {
  const primaryReason = session.tasks[0]?.reason ?? "Review timing is based on memory history and current learning signals.";

  return (
    <Card interactive className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
            <CalendarClock className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              {formatDate(session.scheduledAt)}
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">
              {session.estimatedMinutes} min review session
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{primaryReason}</p>
          </div>
        </div>
        <span className={clsx("ui-badge w-fit", priorityClass[session.priority])}>{session.priority}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ui-badge ui-badge-neutral">
          <ListChecks className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
          {session.tasks.length} tasks
        </span>
        <span className="ui-badge ui-badge-neutral">{session.estimatedMinutes} minutes</span>
      </div>

      <div className="mt-5 space-y-3">
        {session.tasks.map((task) => (
          <div key={`${session.id}-${task.conceptId}`} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-slate-950 dark:text-white">{task.conceptName}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{task.reason}</p>
              </div>
              <span className={clsx("ui-badge w-fit", priorityClass[task.urgency])}>{task.urgency}</span>
            </div>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              {task.durationMinutes} min
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
