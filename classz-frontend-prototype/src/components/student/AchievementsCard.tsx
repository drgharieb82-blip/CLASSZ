import type { ElementType } from "react";
import { Award, Flame, Sparkles, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
      <span className={cn("mb-3 grid h-10 w-10 place-items-center rounded-2xl", accent)}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-4xl font-bold leading-none text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{label}</p>
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
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
          <Award className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">Achievements</h3>
          <p className="mt-1 text-xs text-slate-400">You're doing great! Keep it up!</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatTile icon={Flame} accent="bg-orange-500/15 text-orange-300" value={String(streak)} label="day streak" />
        <StatTile icon={Sparkles} accent="bg-amber-500/15 text-amber-300" value={xp.toLocaleString()} label="Total XP" />
        <StatTile icon={Trophy} accent="bg-yellow-500/15 text-yellow-200" value={`#${weeklyRank}`} label="Weekly Rank" />
        <StatTile icon={Award} accent="bg-sky-500/15 text-sky-300" value={String(totalBadges)} label="Badges Earned" />
        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 md:col-span-2">
          <span className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
            <Star className="h-5 w-5" />
          </span>
          <p className="text-3xl font-bold leading-none text-white">{bestSubject}</p>
          <p className="mt-2 text-sm text-slate-400">Best Subject</p>
          <div className="mt-4 flex items-center gap-2">
            {recentBadges.map((badge) => (
              <span
                key={badge.name}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-base"
                title={badge.name}
              >
                {badge.emoji}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
