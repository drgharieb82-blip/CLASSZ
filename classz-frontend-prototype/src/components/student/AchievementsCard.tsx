import { Flame, Star, Award, BarChart3, BookOpen } from "lucide-react";

interface AchievementsCardProps {
  streak: number;
  xp: number;
  weeklyRank: number;
  totalBadges: number;
  bestSubject: string;
  recentBadges: { name: string; emoji: string }[];
}

function StatRow({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-background/30 p-3">
      <Icon className={`h-4 w-4 shrink-0 ${color}`} />
      <span className="flex-1 text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-bold tabular-nums">{value}</span>
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
      <div className="space-y-2">
        <StatRow icon={Flame} label="Day streak" value={String(streak)} color="text-orange-500" />
        <StatRow icon={Star} label="Total XP" value={xp.toLocaleString()} color="text-amber-500" />
        <StatRow icon={BarChart3} label="Weekly rank" value={`#${weeklyRank}`} color="text-primary" />
        <StatRow icon={Award} label="Total badges" value={String(totalBadges)} color="text-fuchsia-500" />
        <StatRow icon={BookOpen} label="Best subject" value={bestSubject} color="text-success" />
      </div>
      <div className="mt-3 flex items-center gap-1.5 pt-2">
        <span className="text-xs text-muted-foreground">Recent:</span>
        {recentBadges.map((b) => (
          <span key={b.name} className="grid h-7 w-7 place-items-center rounded-full border bg-muted text-sm" title={b.name}>
            {b.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
