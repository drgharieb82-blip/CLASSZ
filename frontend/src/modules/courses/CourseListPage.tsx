import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, GraduationCap, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { listCourses } from "./api";

export function CourseListPage() {
  const { data: courses = [], isLoading, isError } = useQuery({
    queryKey: ["courses"],
    queryFn: listCourses,
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)] backdrop-blur">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#A855F7]">
              Academic Core
            </p>
            <h1 className="mt-3 font-[Poppins] text-4xl font-semibold text-[#F8FAFC]">
              Courses, chapters, lessons, and blocks
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-[#CBD5E1]">
              A clean modular structure for the learning journey. Phase 1 focuses on the academic
              foundation only, with video, quiz, payment, and live systems reserved.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] px-5 py-3 font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.35)]"
          >
            <PlusCircle className="h-5 w-5" aria-hidden="true" />
            Course API Ready
          </button>
        </div>
      </section>

      {isLoading && (
        <div className="grid gap-5 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-56 animate-pulse rounded-[20px] bg-white/[0.06]" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-6 text-[#FCA5A5]">
          Courses could not be loaded. Confirm the backend is running and reachable.
        </div>
      )}

      {!isLoading && !isError && courses.length === 0 && (
        <section className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.06] p-8 text-center shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
          <BookOpen className="mx-auto h-10 w-10 text-[#A855F7]" aria-hidden="true" />
          <h2 className="mt-4 font-[Poppins] text-2xl font-semibold text-[#F8FAFC]">No courses yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-[#94A3B8]">
            Use `POST /api/courses` to create the first course foundation, then add chapters,
            lessons, and blocks through their Phase 1 endpoints.
          </p>
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/courses/${course.id}`}
            className="group overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.06] shadow-[0_16px_40px_rgba(0,0,0,0.20)] transition hover:-translate-y-1 hover:border-[#A855F7]/60"
          >
            <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#7C3AED] via-[#3B82F6] to-[#10B981]">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <GraduationCap className="h-12 w-12 text-white" aria-hidden="true" />
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-2xl bg-[#3B82F6]/15 px-3 py-1 text-xs font-semibold text-[#93C5FD]">
                  {course.subject}
                </span>
                <span className="text-xs font-semibold text-[#94A3B8]">{course.grade}</span>
              </div>
              <h2 className="mt-4 font-[Poppins] text-xl font-semibold text-[#F8FAFC]">{course.title}</h2>
              <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#CBD5E1]">
                {course.description ?? "Course structure foundation is ready for chapters and lessons."}
              </p>
              <div className="mt-5 flex items-center justify-between text-sm font-semibold text-[#A855F7]">
                Open structure
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
