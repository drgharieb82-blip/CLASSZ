import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpen } from "lucide-react";
import { useParams } from "react-router-dom";

import { ChapterLessonTree } from "../chapters/ChapterLessonTree";
import { LessonContent } from "../lessons/LessonContent";
import { findLesson, getCourse } from "./api";

export function CourseDetailsPage() {
  const { courseId, lessonId } = useParams();

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId ?? ""),
    enabled: Boolean(courseId),
  });

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  if (isError || !course || !courseId) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        Course details could not be loaded.
      </section>
    );
  }

  const selectedLesson = findLesson(course, lessonId);

  return (
    <div className="space-y-6">
      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#A855F7]">
              {course.subject} / {course.grade}
            </p>
            <h1 className="mt-3 font-[Poppins] text-4xl font-semibold text-[#F8FAFC]">{course.title}</h1>
            <p className="mt-3 max-w-3xl leading-7 text-[#CBD5E1]">
              {course.description ?? "This course is ready for chapters, lessons, and content blocks."}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#10B981]/15 px-4 py-2 text-sm font-semibold text-[#10B981]">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            {course.is_published ? "Published" : "Draft"}
          </span>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside>
          <ChapterLessonTree
            courseId={course.id}
            chapters={[...(course.chapters ?? [])].sort((first, second) => first.position - second.position)}
            activeLessonId={selectedLesson?.id}
          />
        </aside>
        <LessonContent lesson={selectedLesson} />
      </div>
    </div>
  );
}
