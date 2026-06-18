import { createFileRoute } from "@tanstack/react-router";
import { Crown, Flame, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { GlowCard } from "@/components/premium/GlowCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { leaderboard } from "@/lib/mock";

export const Route = createFileRoute("/student/leaderboard")({
  component: LeaderboardPage,
});

const changeIcon = { up: TrendingUp, down: TrendingDown, same: Minus };
const changeColor = { up: "text-success", down: "text-destructive", same: "text-muted-foreground" };

function LeaderboardPage() {
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const order = [1, 0, 2];
  return (
    <DashPage role="student" title="Leaderboard" subtitle="Compete with learners across CLASSZ" icon={ROLES.student.icon}>
      <div className="grid grid-cols-3 items-end gap-3 sm:gap-6">
        {order.map((oi, pos) => {
          const u = top3[oi];
          const heights = ["h-28", "h-36", "h-24"];
          return (
            <GlowCard key={u.rank} glow={oi === 0} className="text-center">
              <div className="flex flex-col items-center p-4">
                {oi === 0 && <Crown className="mb-1 h-6 w-6 text-warning" />}
                <Avatar className="h-12 w-12 border-2 border-primary/40">
                  <AvatarFallback className="gradient-brand text-white">{u.avatar}</AvatarFallback>
                </Avatar>
                <p className="mt-2 truncate text-sm font-semibold">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.xp.toLocaleString()} XP</p>
                <div className={cn("mt-3 w-full rounded-t-xl gradient-brand", heights[pos])} />
                <span className="mt-1 text-lg font-bold">#{u.rank}</span>
              </div>
            </GlowCard>
          );
        })}
      </div>

      <GlowCard>
        <div className="divide-y divide-border/60 p-2">
          {rest.map((u) => {
            const Ch = changeIcon[u.change as keyof typeof changeIcon];
            return (
              <div key={u.rank} className={cn("flex items-center gap-4 rounded-xl px-3 py-3", u.me && "gradient-brand-soft")}>
                <span className="w-6 text-center font-bold text-muted-foreground">{u.rank}</span>
                <Avatar className="h-9 w-9"><AvatarFallback className="bg-accent text-xs">{u.avatar}</AvatarFallback></Avatar>
                <span className="flex-1 truncate text-sm font-medium">{u.name}{u.me && " (You)"}</span>
                <span className="flex items-center gap-1 text-xs text-warning"><Flame className="h-3.5 w-3.5" />{u.streak}</span>
                <span className="w-20 text-end text-sm font-semibold">{u.xp.toLocaleString()}</span>
                <Ch className={cn("h-4 w-4", changeColor[u.change as keyof typeof changeColor])} />
              </div>
            );
          })}
        </div>
      </GlowCard>
    </DashPage>
  );
}
