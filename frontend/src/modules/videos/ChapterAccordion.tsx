import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { LessonStatusBadge } from "./LessonStatusBadge";

export type LessonStatus = "completed" | "current" | "locked";

export type ChapterItem = {
  id: string;
  title: string;
  lessons: Array<{
    id: string;
    title: string;
    status: LessonStatus;
  }>;
};

export function ChapterAccordion({ chapters }: { chapters: ChapterItem[] }) {
  const [openChapterIds, setOpenChapterIds] = useState(() => new Set(chapters.map((chapter) => chapter.id)));

  function toggleChapter(chapterId: string) {
    setOpenChapterIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(chapterId)) {
        nextIds.delete(chapterId);
      } else {
        nextIds.add(chapterId);
      }

      return nextIds;
    });
  }

  return (
    <div className="space-y-3">
      {chapters.map((chapter, chapterIndex) => {
        const isOpen = openChapterIds.has(chapter.id);

        return (
          <section
            key={chapter.id}
            className="rounded-[20px] border border-white/10 bg-[#111827]/88 shadow-[0_16px_40px_rgba(0,0,0,0.20)]"
          >
            <button
              type="button"
              onClick={() => toggleChapter(chapter.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
              aria-expanded={isOpen}
            >
              <span>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
                  Chapter {chapterIndex + 1}
                </span>
                <span className="mt-1 block font-[Poppins] text-sm font-semibold text-[#F8FAFC]">
                  {chapter.title}
                </span>
              </span>
              <ChevronDown
                className={[
                  "h-4 w-4 shrink-0 text-[#94A3B8] transition",
                  isOpen ? "rotate-180" : "",
                ].join(" ")}
                aria-hidden="true"
              />
            </button>

            {isOpen && (
              <div className="border-t border-white/10 px-3 py-3">
                {chapter.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className={[
                      "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm",
                      lesson.status === "current" ? "bg-[#7C3AED]/18 text-[#F8FAFC]" : "text-[#CBD5E1]",
                    ].join(" ")}
                  >
                    <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                    <LessonStatusBadge status={lesson.status} />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
