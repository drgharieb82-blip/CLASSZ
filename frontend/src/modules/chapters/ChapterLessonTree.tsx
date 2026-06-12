import { BookOpen, Lock, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

import type { Chapter, Lesson } from "../courses/api";

type ChapterLessonTreeProps = {
  courseId: string;
  chapters: Chapter[];
  activeLessonId?: string;
};

export function ChapterLessonTree({ courseId, chapters, activeLessonId }: ChapterLessonTreeProps) {
  if (chapters.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.06] p-6 text-[#94A3B8]">
        Chapters will appear here once the course structure is created.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter) => (
        <section
          key={chapter.id}
          className="rounded-[20px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.20)] backdrop-blur"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7]">
              <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
                Chapter {chapter.position + 1}
              </p>
              <h3 className="font-[Poppins] text-base font-semibold text-[#F8FAFC]">
                {chapter.title}
              </h3>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {(chapter.lessons ?? []).map((lesson) => (
              <LessonLink
                key={lesson.id}
                courseId={courseId}
                lesson={lesson}
                isActive={lesson.id === activeLessonId}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function LessonLink({
  courseId,
  lesson,
  isActive,
}: {
  courseId: string;
  lesson: Lesson;
  isActive: boolean;
}) {
  return (
    <Link
      to={`/courses/${courseId}/lessons/${lesson.id}`}
      className={[
        "flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition",
        isActive
          ? "bg-[#7C3AED]/22 text-[#F8FAFC] ring-1 ring-[#A855F7]/60"
          : "text-[#CBD5E1] hover:bg-white/[0.08]",
      ].join(" ")}
    >
      <span className="flex min-w-0 items-center gap-2">
        <PlayCircle className="h-4 w-4 shrink-0 text-[#3B82F6]" aria-hidden="true" />
        <span className="truncate">{lesson.title}</span>
      </span>
      {!lesson.is_free_preview && <Lock className="h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden="true" />}
    </Link>
  );
}
