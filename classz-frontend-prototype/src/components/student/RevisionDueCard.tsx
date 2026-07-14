import { Atom, BookMarked, CircleDot, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";

interface RevisionItem {
  lesson: string;
  course: string;
  icon: "book" | "atom" | "ring";
  status: "due_today" | "in_1_day";
}

interface RevisionDueCardProps {
  items: RevisionItem[];
}

const iconMap = {
  book: BookMarked,
  atom: Atom,
  ring: CircleDot,
} as const;

const statusMap = {
  due_today: {
    label: "Due today",
    className: "bg-rose-500/12 text-rose-300 border-rose-500/20",
  },
  in_1_day: {
    label: "In 1 day",
    className: "bg-amber-500/12 text-amber-300 border-amber-500/20",
  },
} as const;

export function RevisionDueCard({ items }: RevisionDueCardProps) {
  const { t } = useApp();
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300">
            <RefreshCcw className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">{t("Revision Due")}</h3>
            <p className="mt-1 text-xs text-slate-400">{t("Based on memory system")}</p>
          </div>
        </div>
        <button className="text-xs font-medium text-violet-300 transition-colors hover:text-white">{t("common.viewAll")}</button>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          const status = statusMap[item.status];
          return (
            <div
              key={`${item.course}-${item.lesson}`}
              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3.5"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-500/12 text-violet-300">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{item.lesson}</p>
                <p className="text-sm text-slate-400">{item.course}</p>
              </div>
              <span className={cn("rounded-xl border px-2.5 py-1 text-xs font-semibold", status.className)}>
                {t(status.label)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
