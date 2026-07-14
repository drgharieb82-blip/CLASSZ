import type { ElementType } from "react";
import { Award, Flame, Sparkles, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";

interface AchievementsCardProps {
  streak: number;
  xp: number;
  weeklyRank: number;
  totalBadges: number;
  bestSubject: string;
  recentBadges: { name: string; emoji: string }[];
}

function StatTile({
  icon: Icon,
  accent,
  value,
  label,
}: {
  icon: ElementType;
  accent: string;
  value: string;
  label: string;
}) {
  return (
    <div className="flex min-h-[148px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.03] p-5 text-center">
      <span className={cn("mb-3 grid h-10 w-10 shrink-0 place-items-center rounded-2xl", accent)}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="min-w-0 break-words text-[17.85px] font-bold leading-none text-white sm:text-[21.42px]">{value}</p>
      <p className="mt-3 min-w-0 break-words text-[9.8px] leading-[14px] text-slate-400">{label}</p>
    </div>
  );
}

export function AchievementsCard({
  streak,
  xp,
  weeklyRank,
  totalBadges,
  bestSubject,
  recentBadges,
}: AchievementsCardProps) {
  const { t } = useApp();

  return (
    <div className="min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl md:p-6">
      <div className="mb-5 flex min-w-0 flex-wrap items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
          <Award className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <h3 className="text-[11.76px] font-semibold uppercase tracking-[0.22em] text-violet-300">{t("student.achievements")}</h3>
          <p className="mt-1 break-words text-[10.08px] text-slate-400">{t("student.keepItUp")}</p>
        </div>
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile icon={Flame} accent="bg-orange-500/15 text-orange-300" value={String(streak)} label={t("student.dayStreak")} />
        <StatTile icon={Sparkles} accent="bg-amber-500/15 text-amber-300" value={xp.toLocaleString()} label={t("student.totalXp")} />
        <StatTile icon={Trophy} accent="bg-yellow-500/15 text-yellow-200" value={`#${weeklyRank}`} label={t("student.weeklyRank")} />
        <StatTile icon={Award} accent="bg-sky-500/15 text-sky-300" value={String(totalBadges)} label={t("student.badgesEarned")} />
        <div className="flex min-h-[148px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.03] p-5 text-center">
          <span className="mb-3 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
            <Star className="h-5 w-5" />
          </span>
          <p className="line-clamp-2 min-w-0 break-words text-[21px] font-bold leading-tight text-white">{bestSubject}</p>
          <p className="mt-3 min-w-0 break-words text-[9.8px] leading-[14px] text-slate-400">{t("student.bestSubject")}</p>
        </div>
        <div className="flex min-h-[148px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.03] p-5 text-center">
          <span className="mb-3 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
            <Award className="h-5 w-5" />
          </span>
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 text-[16.8px]">
            {recentBadges.map((badge) => (
              <span key={badge.name} className="inline-flex items-center justify-center" title={badge.name}>
                {badge.emoji}
              </span>
            ))}
          </div>
          <p className="mt-3 min-w-0 break-words text-[9.8px] leading-[14px] text-slate-400">{t("student.awards")}</p>
        </div>
      </div>
    </div>
  );
}
