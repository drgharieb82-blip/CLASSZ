import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseProgressCardProps {
  name: string;
  emoji: string;
  color: string;
  teacher: string;
  completedLessons: number;
  totalLessons: number;
  progress: number;
}

export function CourseProgressCard({
  name, emoji, color, teacher, completedLessons, totalLessons, progress,
}: CourseProgressCardProps) {
  return (
    <Link to="/student/course-details" className="group block">
      <div className="rounded-2xl border bg-card/70 p-4 transition-all hover:border-primary/30 hover:shadow-md">
        <div className="flex items-center gap-3">
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-lg shadow", color)}>
            {emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold group-hover:text-primary">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{teacher}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{completedLessons}/{totalLessons} lessons</span>
            <span className="font-semibold tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full gradient-brand transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
