import { Link } from "@tanstack/react-router";
import { PlayCircle, ArrowRight } from "lucide-react";
import { GradientButton } from "@/components/premium/GradientButton";

interface ContinueLearningCardProps {
  courseEmoji: string;
  courseName: string;
  courseColor: string;
  chapterName: string;
  lessonTitle: string;
  lessonNumber: number;
  totalLessons: number;
  progress: number;
}

export function ContinueLearningCard({
  courseEmoji, courseName, courseColor, chapterName,
  lessonTitle, lessonNumber, totalLessons, progress,
}: ContinueLearningCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card/70 backdrop-blur-xl">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className={`h-full w-full bg-gradient-to-br ${courseColor}`} />
      </div>
      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${courseColor} text-2xl shadow-lg`}>
          {courseEmoji}
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Continue Learning</p>
          </div>
          <h3 className="text-lg font-bold tracking-tight">{lessonTitle}</h3>
          <p className="text-sm text-muted-foreground">
            {courseName} · {chapterName} · Lesson {lessonNumber} of {totalLessons}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <div className="h-1.5 flex-1 max-w-xs overflow-hidden rounded-full bg-muted">
              <div className="h-full gradient-brand transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-medium tabular-nums text-muted-foreground">{progress}%</span>
          </div>
        </div>
        <GradientButton asChild className="shrink-0">
          <Link to="/student/lesson">Resume <ArrowRight className="h-4 w-4" /></Link>
        </GradientButton>
      </div>
    </div>
  );
}
