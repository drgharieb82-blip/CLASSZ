import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { CourseCard } from "@/components/common/CourseCard";
import { FloatingParticles } from "@/components/premium/FloatingParticles";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/mock";
import { listPublicCourses, type CourseRead } from "@/lib/api/courses";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Courses — CLASSZ" },
      { name: "description", content: "Browse published courses on CLASSZ." },
    ],
  }),
  component: CoursesPage,
});

const subjects = ["All"];

function mapCourse(course: CourseRead): Course {
  return {
    id: course.id,
    publicCode: course.public_code,
    title: course.title,
    subject: course.subject,
    teacher: "Assigned Teacher",
    teacherCode: course.teacher_id,
    level: course.grade,
    lessons: 0,
    hours: 0,
    rating: 5,
    students: 0,
    progress: 0,
    price: 0,
    color: "from-violet-500 to-blue-500",
    emoji: "📘",
    tag: course.is_published ? "Published" : "",
  };
}

function CoursesPage() {
  const [subject, setSubject] = useState("All");
  const [q, setQ] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listPublicCourses()
      .then((items) => {
        if (!active) return;
        setCourses(items.map(mapCourse));
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof ApiError && typeof err.body === "object" && err.body !== null && "detail" in err.body
            ? String((err.body as { detail: string }).detail)
            : "Failed to load courses.",
        );
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () => courses.filter((course) => (subject === "All" || course.subject === subject) && course.title.toLowerCase().includes(q.toLowerCase())),
    [courses, q, subject],
  );

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b">
        <FloatingParticles />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Badge className="rounded-full border-0 gradient-brand text-white">Real backend courses</Badge>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Explore published courses</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">This catalog now reads from the real backend course records.</p>
          <div className="mt-6 flex max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses…" className="ps-9 rounded-xl bg-card/70 backdrop-blur" />
            </div>
            <button className="grid h-10 w-10 place-items-center rounded-xl border bg-card/70 backdrop-blur" type="button">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {subjects.map((item) => (
            <button
              key={item}
              onClick={() => setSubject(item)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                subject === item ? "gradient-brand border-transparent text-white" : "bg-card/60 hover:bg-accent",
              )}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        {error && <p className="mt-6 text-sm text-destructive">{error}</p>}
        {!error && filtered.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No published courses available yet.</p>}
      </div>
    </PublicLayout>
  );
}