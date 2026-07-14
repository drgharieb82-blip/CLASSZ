import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { StudentLearningTree } from "@/components/student/StudentLearningTree";
import { Card } from "@/components/ui/card";
import type { CourseDetailsRead } from "@/lib/api/courses";
import {
  getStudentCourseAccessError,
  loadStudentCourseAccess,
} from "@/lib/student-course-access";

export const Route = createFileRoute("/student/courses/$courseId/")({
  component: CourseOverviewPage,
});

function CourseOverviewPage() {
  const { courseId } = Route.useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseDetailsRead | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);

    loadStudentCourseAccess(courseId)
      .then(({ allowed: isAllowed, course: courseData }) => {
        if (!active) return;
        setAllowed(isAllowed);
        setCourse(courseData);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setAllowed(false);
        setCourse(null);
        setError(getStudentCourseAccessError(err, "Failed to load enrolled course."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080C1A] px-4 text-white">
        <p className="text-sm text-slate-400">Loading your course learning tree...</p>
      </div>
    );
  }

  if (!allowed || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080C1A] text-white">
        <Shield className="h-16 w-16 text-slate-600" />
        <h1 className="text-2xl font-bold">{error || "Course Access Required"}</h1>
        <Link
          to="/student/courses"
          className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10"
        >
          Back to My Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C1A] p-6 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-slate-400">
            {course.description ?? "Structured teacher-created course content."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border bg-card p-4">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="mt-1 text-lg font-semibold">Enrolled</p>
          </Card>
          <Card className="border bg-card p-4">
            <p className="text-sm text-muted-foreground">Chapters</p>
            <p className="mt-1 text-lg font-semibold">{course.chapters.length}</p>
          </Card>
          <Card className="border bg-card p-4">
            <p className="text-sm text-muted-foreground">Sessions</p>
            <p className="mt-1 text-lg font-semibold">{course.sessions.length}</p>
          </Card>
        </div>

        <StudentLearningTree course={course} />

        <Link
          to="/student/courses"
          className="inline-flex rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
        >
          Back to My Courses
        </Link>
      </div>
    </div>
  );
}
