import { AlertTriangle, Flame, Gauge, ShieldAlert, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";

interface WeakPoint {
  concept: string;
  course: string;
  priority: "high" | "medium" | "low";
}

interface WeakPointsCardProps {
  weakPoints: WeakPoint[];
}

const priorityConfig = {
  high: {
    icon: ShieldAlert,
    badge: "High",
    badgeClass: "bg-rose-500/12 text-rose-300 border-rose-500/20",
    iconClass: "text-rose-300 bg-rose-500/12",
  },
  medium: {
    icon: Gauge,
    badge: "Medium",
    badgeClass: "bg-amber-500/12 text-amber-300 border-amber-500/20",
    iconClass: "text-amber-300 bg-amber-500/12",
  },
  low: {
    icon: Flame,
    badge: "Low",
    badgeClass: "bg-yellow-500/12 text-yellow-200 border-yellow-500/20",
    iconClass: "text-yellow-200 bg-yellow-500/12",
  },
} as const;

export function WeakPointsCard({ weakPoints }: WeakPointsCardProps) {
  const { t } = useApp();
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300">
            <TriangleAlert className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-300">{t("Weak Points")}</h3>
            <p className="mt-1 text-xs text-slate-400">{t("Focus on what matters")}</p>
          </div>
        </div>
        <button className="text-xs font-medium text-violet-300 transition-colors hover:text-white">{t("common.viewAll")}</button>
      </div>

      <div className="space-y-2.5">
        {weakPoints.map((item) => {
          const cfg = priorityConfig[item.priority];
          const Icon = cfg.icon;
          return (
            <div
              key={`${item.course}-${item.concept}`}
              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3.5"
            >
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", cfg.iconClass)}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{item.concept}</p>
                <p className="text-sm text-slate-400">{item.course}</p>
              </div>
              <span className={cn("rounded-xl border px-2.5 py-1 text-xs font-semibold", cfg.badgeClass)}>
                {t(cfg.badge)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
