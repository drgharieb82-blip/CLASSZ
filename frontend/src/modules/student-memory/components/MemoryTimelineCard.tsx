import { CalendarClock, History } from "lucide-react";
import { clsx } from "clsx";

import { Card } from "../../../components/ui/Card";
import type { MemoryEvent } from "../types";

type MemoryTimelineCardProps = {
  event: MemoryEvent;
};

const importanceClass = {
  low: "ui-badge-success",
  medium: "ui-badge-warning",
  high: "ui-badge-error",
};

function formatEventType(eventType: MemoryEvent["eventType"]) {
  return eventType.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function formatTimelineDate(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function MemoryTimelineCard({ event }: MemoryTimelineCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
            <History className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              <time dateTime={event.timestamp}>{formatTimelineDate(event.timestamp)}</time>
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">{event.title}</h3>
            <span className="ui-badge mt-2 bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
              {formatEventType(event.eventType)}
            </span>
          </div>
        </div>
        <span className={clsx("ui-badge w-fit capitalize", importanceClass[event.importance])}>{event.importance}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{event.description}</p>
    </Card>
  );
}
