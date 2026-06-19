import { Flame, Star, Award, BarChart3, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementsCardProps {
  streak: number;
  xp: number;
  weeklyRank: number;
  totalBadges: number;
  bestSubject: string;
  recentBadges: { name: string; emoji: string }[];
}

function BigStat({ icon: Icon, value, label, color, iconBg }: {
  icon: React.ElementType; value: string; label: string; color: string; iconBg: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-background/30 p-3">
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", iconBg)}>
        <Icon className={cn("h-5 w-5", color)} />
      </span>
      <div>
        <p className="text-lg font-bold tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function AchievementsCard({ streak, xp, weeklyRank, totalBadges, bestSubject, recentBadges }: AchievementsCardProps) {
  return (
    <div className="rounded-2xl border bg-card/70 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Award className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Achievements</h3>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        <BigStat icon={Flame} value={String(streak)} label="Day streak" color="text-orange-500" iconBg="bg-orange-500/10" />
        <BigStat icon={Star} value={xp.toLocaleString()} label="Total XP" color="text-amber-500" iconBg="bg-amber-500/10" />
        <BigStat icon={BarChart3} value={`#${weeklyRank}`} label="Weekly rank" color="text-primary" iconBg="bg-primary/10" />
        <BigStat icon={Award} value={String(totalBadges)} label="Total badges" color="text-fuchsia-500" iconBg="bg-fuchsia-500/10" />
        <div className="col-span-2 flex items-center gap-3 rounded-xl border bg-background/30 p-3 sm:col-span-1">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-success/10">
            <BookOpen className="h-5 w-5 text-success" />
          </span>
          <div>
            <p className="text-sm font-bold leading-tight">{bestSubject}</p>
            <p className="text-[11px] text-muted-foreground">Best subject</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t pt-3">
        <span className="text-xs text-muted-foreground">Recent badges</span>
        <div className="flex -space-x-1">
          {recentBadges.map((b) => (
            <span key={b.name} className="grid h-8 w-8 place-items-center rounded-full border-2 border-card bg-muted text-sm shadow-sm" title={b.name}>
              {b.emoji}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
