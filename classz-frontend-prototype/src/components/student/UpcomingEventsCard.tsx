import { CalendarDays, ClipboardList, FileText, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpcomingEvent {
  type: "quiz" | "assignment" | "live";
  title: string;
  course: string;
  when: string;
}

interface UpcomingEventsCardProps {
  items: UpcomingEvent[];
}

const typeConfig = {
  quiz: { icon: ClipboardList, color: "text-violet-300", bg: "bg-violet-500/15", border: "border-violet-500/20" },
  assignment: { icon: FileText, color: "text-emerald-300", bg: "bg-emerald-500/15", border: "border-emerald-500/20" },
  live: { icon: Radio, color: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/20" },
};

export function UpcomingEventsCard({ items }: UpcomingEventsCardProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(10,14,30,0.92))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
            <CalendarDays className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">Upcoming Events</h3>
            <p className="mt-1 text-xs text-slate-400">Don't miss anything</p>
          </div>
        </div>
        <button className="text-xs font-medium text-violet-300 transition-colors hover:text-white">View all</button>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const cfg = typeConfig[item.type];
          const Icon = cfg.icon;
          return (
            <div
              key={`${item.type}-${item.title}`}
              className={cn(
                "flex items-center gap-3 rounded-2xl border bg-white/[0.03] px-3 py-3.5",
                cfg.border,
              )}
            >
              <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", cfg.bg)}>
                <Icon className={cn("h-4 w-4", cfg.color)} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="truncate text-sm text-slate-400">{item.course}</p>
              </div>
              <span className="text-sm text-slate-400">{item.when}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
