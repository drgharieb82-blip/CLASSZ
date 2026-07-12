import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Clock, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getCourse, type CourseDetailsRead } from "@/lib/api/courses";
import { getMyEnrollmentStatus } from "@/lib/api/enrollments";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/courses/$courseId")({
  head: () => ({
    meta: [
      { title: "Course — CLASSZ" },
      { name: "description", content: "View course details on CLASSZ." },
    ],
  }),
  component: CourseDetailsPage,
});

function CourseDetailsPage() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore((state) => ({ isAuthenticated: state.isAuthenticated, user: state.user }));
  const [course, setCourse] = useState<CourseDetailsRead | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      getCourse(courseId),
      isAuthenticated && user?.role === "student" ? getMyEnrollmentStatus(courseId) : Promise.resolve(null),
    ])
      .then(([courseData, enrollment]) => {
        if (!active) return;
        setCourse(courseData);
        setIsEnrolled(Boolean(enrollment?.enrolled));
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof ApiError && typeof err.body === "object" && err.body !== null && "detail" in err.body
            ? String((err.body as { detail: string }).detail)
            : "Failed to load course.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [courseId, isAuthenticated, user?.role]);

  const courseView = useMemo(() => {
    if (!course) return null;
    return {
      title: course.title,
      subject: course.subject,
      grade: course.grade,
      description: course.description ?? "Structured teacher-created course content.",
      chapters: course.chapters,
      sessions: course.sessions,
      color: "from-violet-500 to-blue-500",
      emoji: "📘",
    };
  }, [course]);

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { returnUrl: `/courses/${courseId}` } });
      return;
    }
    if (user?.role !== "student") {
      navigate({ to: "/" });
      return;
    }
    navigate({ to: "/student/courses/$courseId/enroll", params: { courseId } });
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">Loading course…</p>
        </div>
      </PublicLayout>
    );
  }

  if (!courseView || error) {
    return (
      <PublicLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center gap-4 px-4">
          <ShieldCheck className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">{error || "Course Not Found"}</h1>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className={cn("relative overflow-hidden bg-gradient-to-br text-white", courseView.color)}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <Link to="/courses" className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to courses
          </Link>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-full border-0 bg-white/20 text-white">{courseView.subject}</Badge>
                <Badge className="rounded-full border-0 bg-white/20 text-white">{courseView.grade}</Badge>
                {course?.is_published && <Badge className="rounded-full border-0 bg-white/90 text-foreground">Published</Badge>}
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{courseView.title}</h1>
              <p className="mt-3 max-w-2xl text-white/85">{courseView.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> Assigned Teacher</span>
                <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {courseView.chapters.length} chapters</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {courseView.sessions.length} sessions</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> Real backend course</span>
              </div>
            </div>

            <Card className="border-0 bg-white p-6 text-foreground shadow-2xl">
              <div className="text-center">
                <span className="text-4xl">{courseView.emoji}</span>
                <p className="mt-3 text-3xl font-bold">Free</p>
                <p className="text-sm text-muted-foreground">MVP enrollment</p>
              </div>
              <div className="mt-5 space-y-3">
                {isEnrolled ? (
                  <Button asChild className="w-full rounded-xl gradient-brand border-0 text-white" size="lg">
                    <Link to="/student/courses">View in My Courses</Link>
                  </Button>
                ) : (
                  <Button onClick={handleEnroll} className="w-full rounded-xl gradient-brand border-0 text-white" size="lg">
                    Enroll Now
                  </Button>
                )}
              </div>
              <div className="mt-5 space-y-2 border-t pt-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Included in MVP</p>
                <div className="text-sm text-muted-foreground">Enrollment is stored in PostgreSQL and tied to your authenticated student account.</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <section>
          <h2 className="text-xl font-bold">Academic Structure</h2>
          <div className="mt-4 space-y-2">
            {courseView.chapters.length === 0 ? (
              <Card className="border bg-card p-4 text-sm text-muted-foreground">No chapters linked yet.</Card>
            ) : (
              courseView.chapters.map((chapter) => (
                <Card key={chapter.id} className="border bg-card p-4">
                  <p className="font-medium">{chapter.title}</p>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
