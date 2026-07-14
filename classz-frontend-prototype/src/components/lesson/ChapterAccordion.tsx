import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LessonItem } from "./LessonItem";

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

interface ChapterAccordionProps {
  chapters: ChapterData[];
  defaultOpen?: string[];
  onLessonClick?: (lessonId: string) => void;
}

export function ChapterAccordion({ chapters, defaultOpen, onLessonClick }: ChapterAccordionProps) {
  const completedCount = (ch: ChapterData) => ch.lessons.filter((l) => l.status === "completed").length;

  return (
    <Accordion type="multiple" defaultValue={defaultOpen} className="space-y-1">
      {chapters.map((ch) => (
        <AccordionItem key={ch.id} value={ch.id} className="border-0">
          <AccordionTrigger className="rounded-xl px-3 py-2.5 text-[13px] hover:bg-accent/60 hover:no-underline [&[data-state=open]]:bg-accent/40">
            <div className="flex flex-1 items-center gap-2 pe-2">
              <span className="min-w-0 truncate font-semibold">{ch.title}</span>
              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                {completedCount(ch)}/{ch.lessons.length}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-1 pt-0.5 ps-1">
            <div className="space-y-0.5">
              {ch.lessons.map((lesson, idx) => (
                <LessonItem
                  key={lesson.id}
                  title={lesson.title}
                  duration={lesson.duration}
                  status={lesson.status}
                  index={idx + 1}
                  onClick={() => onLessonClick?.(lesson.id)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
