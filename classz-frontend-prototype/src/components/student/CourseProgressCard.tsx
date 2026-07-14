import { Link } from "@tanstack/react-router";
import { ArrowRight, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";

interface CourseProgressCardProps {
  name: string;
  emoji: string;
  color: string;
  teacher: string;
  completedLessons: number;
  totalLessons: number;
  progress: number;
  lastLesson: string;
}

export function CourseProgressCard({
  name, emoji, color, teacher, completedLessons, totalLessons, progress, lastLesson,
}: CourseProgressCardProps) {
  return (
    <div className="rounded-2xl border bg-card/70 p-5 transition-all hover:border-primary/30 hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-lg shadow", color)}>
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{teacher}</p>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{completedLessons}/{totalLessons} lessons</span>
          <span className="font-semibold tabular-nums">{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full gradient-brand transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <PlayCircle className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">Last: {lastLesson}</span>
      </div>

      <GradientButton variant="outline" size="sm" asChild className="mt-3 w-full">
        <Link to="/student/courses">Resume <ArrowRight className="h-3.5 w-3.5" /></Link>
      </GradientButton>
    </div>
  );
}
