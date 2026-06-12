import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { findLesson, getCourse } from "../courses/api";
import { LessonContent } from "./LessonContent";

export function LessonPage() {
  const { courseId, lessonId } = useParams();

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId ?? ""),
    enabled: Boolean(courseId),
  });

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  const lesson = course ? findLesson(course, lessonId) : undefined;

  if (isError || !course || !lesson) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        Lesson could not be loaded.
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <Link to={`/courses/${course.id}`} className="text-sm font-semibold text-[#A855F7]">
        Back to {course.title}
      </Link>
      <LessonContent lesson={lesson} />
    </div>
  );
}
