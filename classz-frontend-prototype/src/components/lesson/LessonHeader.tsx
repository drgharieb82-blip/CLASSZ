import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

interface LessonHeaderProps {
  courseName: string;
  chapterName: string;
  lessonTitle: string;
  lessonDescription: string;
  lessonNumber: number;
  totalLessons: number;
  progress: number;
}

export function LessonHeader({
  courseName, chapterName, lessonTitle, lessonDescription,
  lessonNumber, totalLessons, progress,
}: LessonHeaderProps) {
  return (
    <div className="space-y-3">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link to="/student" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/student/courses" className="hover:text-foreground transition-colors">My Courses</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="hover:text-foreground transition-colors">{courseName}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="hover:text-foreground transition-colors">{chapterName}</span>
      </nav>

      <div>
        <p className="text-xs font-medium text-primary">Lesson {lessonNumber} of {totalLessons}</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{lessonTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{lessonDescription}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full gradient-brand transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">{progress}%</span>
      </div>
    </div>
  );
}
