import { AlertCircle, Bell, ClipboardList, FileWarning, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";

interface AttentionItem {
  type: "quiz" | "assignment" | "homework" | "unlock";
  title: string;
  course: string;
  status: "overdue" | "due_today" | "due_tomorrow" | "new";
}

interface AttentionCardProps {
  items: AttentionItem[];
}

const itemConfig = {
  quiz: { icon: ClipboardList, iconClass: "text-rose-300 bg-rose-500/12" },
  assignment: { icon: FileWarning, iconClass: "text-amber-300 bg-amber-500/12" },
  homework: { icon: AlertCircle, iconClass: "text-yellow-200 bg-yellow-500/12" },
  unlock: { icon: Sparkles, iconClass: "text-emerald-300 bg-emerald-500/12" },
} as const;

const statusConfig = {
  overdue: { label: "Overdue", className: "bg-rose-500/12 text-rose-300 border-rose-500/20" },
  due_today: { label: "Due today", className: "bg-orange-500/12 text-orange-300 border-orange-500/20" },
  due_tomorrow: { label: "Due tomorrow", className: "bg-amber-500/12 text-amber-300 border-amber-500/20" },
  new: { label: "New", className: "bg-emerald-500/12 text-emerald-300 border-emerald-500/20" },
} as const;

export function AttentionCard({ items }: AttentionCardProps) {
  const { t } = useApp();
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-500/15 text-rose-300">
            <Bell className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-300">{t("Attention Needed")}</h3>
            <p className="mt-1 text-xs text-slate-400">{t("Important updates")}</p>
          </div>
        </div>
        <button className="text-xs font-medium text-violet-300 transition-colors hover:text-white">{t("common.viewAll")}</button>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const itemStyles = itemConfig[item.type];
          const status = statusConfig[item.status];
          const Icon = itemStyles.icon;
          return (
            <div
              key={`${item.title}-${item.course}`}
              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3.5"
            >
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", itemStyles.iconClass)}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{item.title}</p>
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
