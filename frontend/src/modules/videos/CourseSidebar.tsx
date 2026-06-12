import { ChapterAccordion, type ChapterItem } from "./ChapterAccordion";
import { ProgressCard } from "./ProgressCard";

type CourseSidebarProps = {
  courseTitle: string;
  progressPercent: number;
  chapters: ChapterItem[];
};

export function CourseSidebar({ courseTitle, progressPercent, chapters }: CourseSidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
      <ProgressCard courseTitle={courseTitle} progressPercent={progressPercent} />
      <ChapterAccordion chapters={chapters} />
    </aside>
  );
}
