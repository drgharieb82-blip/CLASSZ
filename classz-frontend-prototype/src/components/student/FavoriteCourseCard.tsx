import { Heart, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteCourseCardProps {
  name: string;
  emoji: string;
  color: string;
  teacher: string;
  hoursThisWeek: number;
}

export function FavoriteCourseCard({ name, emoji, color, teacher, hoursThisWeek }: FavoriteCourseCardProps) {
  return (
    <div className="rounded-2xl border bg-card/70 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Heart className="h-4 w-4 text-pink-500" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Favorite Course</h3>
      </div>
      <p className="mb-3 text-[11px] text-muted-foreground">Most studied this week</p>
      <div className="flex items-center gap-3">
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-lg shadow", color)}>
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{teacher}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl border bg-background/30 p-3">
        <Clock className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold tabular-nums">{hoursThisWeek}h</span>
        <span className="text-xs text-muted-foreground">this week</span>
      </div>
    </div>
  );
}
