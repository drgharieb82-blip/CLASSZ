import { Link } from "@tanstack/react-router";
import { Star, Clock, BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Course } from "@/lib/mock";

export function CourseCard({ course, showProgress }: { course: Course; showProgress?: boolean }) {
  return (
    <Link to="/student/course-details" className="group block">
      <Card className="card-hover h-full overflow-hidden border bg-card p-0">
        <div className={cn("relative flex h-32 items-center justify-center bg-gradient-to-br text-5xl", course.color)}>
          <span className="drop-shadow-lg">{course.emoji}</span>
          {course.tag && <Badge className="absolute end-3 top-3 rounded-full border-0 bg-white/90 text-foreground">{course.tag}</Badge>}
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{course.subject} · {course.level}</span>
            <span className="flex items-center gap-1 font-medium text-warning"><Star className="h-3.5 w-3.5 fill-warning" />{course.rating}</span>
          </div>
          <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">{course.title}</h3>
          <p className="text-sm text-muted-foreground">{course.teacher}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course.lessons} lessons</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.hours}h</span>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.students}</span>
          </div>
          {showProgress ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Progress</span><span className="font-medium">{course.progress}%</span></div>
              <Progress value={course.progress} className="h-1.5" />
            </div>
          ) : (
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-lg font-bold">${course.price}</span>
              <span className="text-sm font-medium text-primary">View course →</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
