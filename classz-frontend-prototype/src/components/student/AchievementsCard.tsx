import { Flame, Star, Award } from "lucide-react";

interface Badge {
  name: string;
  emoji: string;
  date: string;
}

interface AchievementsCardProps {
  streak: number;
  xp: number;
  badges: Badge[];
}

export function AchievementsCard({ streak, xp, badges }: AchievementsCardProps) {
  return (
    <div className="rounded-2xl border bg-card/70 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Award className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Achievements</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-background/30 p-3 text-center">
          <Flame className="mx-auto h-5 w-5 text-orange-500" />
          <p className="mt-1 text-lg font-bold tabular-nums">{streak}</p>
          <p className="text-[11px] text-muted-foreground">Day streak</p>
        </div>
        <div className="rounded-xl border bg-background/30 p-3 text-center">
          <Star className="mx-auto h-5 w-5 text-amber-500" />
          <p className="mt-1 text-lg font-bold tabular-nums">{xp.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground">Total XP</p>
        </div>
        <div className="col-span-2 rounded-xl border bg-background/30 p-3 sm:col-span-1 sm:text-center">
          <div className="flex items-center gap-2 sm:flex-col sm:gap-1">
            <div className="flex -space-x-1 sm:justify-center">
              {badges.slice(0, 3).map((b) => (
                <span key={b.name} className="grid h-7 w-7 place-items-center rounded-full border-2 border-card bg-muted text-sm" title={b.name}>
                  {b.emoji}
                </span>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold sm:mt-1">{badges.length}</p>
              <p className="text-[11px] text-muted-foreground">Badges</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
