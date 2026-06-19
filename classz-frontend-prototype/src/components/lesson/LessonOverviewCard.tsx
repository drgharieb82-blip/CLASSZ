import { BookOpen, Clock, FileText, Target } from "lucide-react";

interface LessonOverviewCardProps {
  objectives: string[];
  keyConcepts: string[];
  duration: string;
  contentType: string;
}

export function LessonOverviewCard({ objectives, keyConcepts, duration, contentType }: LessonOverviewCardProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card/70 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Objectives</p>
        </div>
        <ul className="space-y-1.5">
          {objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full gradient-brand" />
              {obj}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border bg-card/70 p-4">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Concepts</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {keyConcepts.map((concept) => (
            <span key={concept} className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {concept}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card/70 p-4 text-center">
          <Clock className="mx-auto mb-1.5 h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold">{duration}</p>
          <p className="text-xs text-muted-foreground">Duration</p>
        </div>
        <div className="rounded-2xl border bg-card/70 p-4 text-center">
          <FileText className="mx-auto mb-1.5 h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold">{contentType}</p>
          <p className="text-xs text-muted-foreground">Content</p>
        </div>
      </div>
    </div>
  );
}
