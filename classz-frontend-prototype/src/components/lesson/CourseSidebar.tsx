import { Award } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChapterAccordion } from "./ChapterAccordion";

interface LessonData {
  id: string;
  title: string;
  duration: string;
  status: "completed" | "active" | "available" | "locked";
}

interface ChapterData {
  id: string;
  title: string;
  lessons: LessonData[];
}

interface CourseSidebarProps {
  courseName: string;
  courseEmoji: string;
  courseColor: string;
  courseProgress: number;
  chapters: ChapterData[];
  activeChapterId?: string;
  onLessonClick?: (lessonId: string) => void;
}

export function CourseSidebar({
  courseName, courseEmoji, courseColor, courseProgress,
  chapters, activeChapterId, onLessonClick,
}: CourseSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b p-4">
        <div className="flex items-center gap-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${courseColor} text-lg shadow`}>
            {courseEmoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{courseName}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full gradient-brand" style={{ width: `${courseProgress}%` }} />
              </div>
              <span className="text-[11px] tabular-nums text-muted-foreground">{courseProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 pt-3 pb-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sessions</p>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="py-1">
          <ChapterAccordion
            chapters={chapters}
            defaultOpen={activeChapterId ? [activeChapterId] : undefined}
            onLessonClick={onLessonClick}
          />
        </div>
      </ScrollArea>

      <div className="shrink-0 border-t p-4">
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
          <Award className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-semibold">Course Certificate</p>
            <p className="text-[11px] text-muted-foreground">Complete all lessons to earn</p>
          </div>
        </div>
      </div>
    </div>
  );
}
