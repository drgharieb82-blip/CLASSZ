import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { CourseCard } from "@/components/common/CourseCard";
import { FloatingParticles } from "@/components/premium/FloatingParticles";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { courses, type Course } from "@/lib/mock";
import { getPublishedPublicCourses } from "@/lib/teacher/teacher-course-store";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Courses — CLASSZ" },
      { name: "description", content: "Browse 200+ premium, structured courses across math, science, languages and more on CLASSZ." },
      { property: "og:title", content: "Courses — CLASSZ" },
      { property: "og:description", content: "Browse premium, structured courses across every subject." },
    ],
  }),
  component: CoursesPage,
});

const subjects = ["All", "Math", "Physics", "Chemistry", "Biology", "English", "CS", "Arabic", "History"];

function teacherCourseToCatalog(tc: ReturnType<typeof getPublishedPublicCourses>[number]): Course {
  return {
    id: tc.id,
    publicCode: tc.publicCode,
    title: tc.title,
    subject: tc.subject,
    teacher: tc.teacherName,
    teacherCode: tc.teacherPublicCode,
    level: tc.grade,
    lessons: tc.lessonsCount,
    hours: tc.hoursCount,
    rating: tc.rating,
    students: tc.enrollmentCount,
    progress: 0,
    price: tc.price,
    color: tc.coverColor,
    emoji: tc.coverEmoji,
    tag: "",
  };
}

function CoursesPage() {
  const [subject, setSubject] = useState("All");
  const [q, setQ] = useState("");
  const teacherCourses = getPublishedPublicCourses().map(teacherCourseToCatalog);
  const allCourses = [...courses, ...teacherCourses];
  const filtered = allCourses.filter(
    (c) => (subject === "All" || c.subject === subject) && c.title.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b">
        <FloatingParticles />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Badge className="rounded-full border-0 gradient-brand text-white">200+ courses</Badge>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Explore our course catalog</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">Premium, structured learning paths designed for secondary students.</p>
          <div className="mt-6 flex max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses…" className="ps-9 rounded-xl bg-card/70 backdrop-blur" />
            </div>
            <button className="grid h-10 w-10 place-items-center rounded-xl border bg-card/70 backdrop-blur"><SlidersHorizontal className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                subject === s ? "gradient-brand border-transparent text-white" : "bg-card/60 hover:bg-accent",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
