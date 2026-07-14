import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCourse, type CourseDetailsRead } from "@/lib/api/courses";
import { enrollInCourse, getMyEnrollmentStatus } from "@/lib/api/enrollments";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/student/courses/$courseId/enroll")({
  component: EnrollPage,
});

function EnrollPage() {
  const { courseId } = Route.useParams();
  const [course, setCourse] = useState<CourseDetailsRead | null>(null);
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getCourse(courseId), getMyEnrollmentStatus(courseId)])
      .then(([courseData, enrollment]) => {
        if (!active) return;
        setCourse(courseData);
        setSuccess(enrollment.enrolled);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof ApiError && typeof err.body === "object" && err.body !== null && "detail" in err.body
            ? String((err.body as { detail: string }).detail)
            : "Failed to load enrollment page.",
        );
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  const handleEnroll = async () => {
    setProcessing(true);
    setError("");
    try {
      await enrollInCourse(courseId);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError && typeof err.body === "object" && err.body !== null && "detail" in err.body
          ? String((err.body as { detail: string }).detail)
          : "Enrollment failed.",
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!course && error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Enrollment Successful!</h1>
          <p className="mt-2 text-muted-foreground">You are now enrolled in <strong>{course?.title ?? "this course"}</strong></p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/student/courses">My Courses</Link>
          </Button>
          <Button asChild className="rounded-xl gradient-brand border-0 text-white">
            <Link to="/student/courses/$courseId" params={{ courseId }}>
              <BookOpen className="me-1.5 h-4 w-4" /> Open Course
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          to="/courses/$courseId"
          params={{ courseId }}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>

        <h1 className="text-2xl font-bold">Complete Enrollment</h1>
        <p className="mt-1 text-muted-foreground">Enrollment is free for the MVP launch flow.</p>

        <Card className="mt-6 flex items-center gap-4 border bg-card p-4">
          <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-2xl", "from-violet-500 to-blue-500")}>
            📘
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{course?.title ?? "Course"}</p>
            <p className="text-sm text-muted-foreground">Assigned Teacher · {course?.chapters.length ?? 0} chapters</p>
          </div>
          <p className="text-xl font-bold">Free</p>
        </Card>

        <Card className="mt-8 space-y-2 border bg-card p-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Enrollment Summary</h3>
          <div className="flex justify-between text-sm">
            <span>Course access</span><span>Free</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Source of truth</span><span>Backend enrollment record</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Persistence</span><span>PostgreSQL</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Status on enroll</span><span>Active</span>
          </div>
        </Card>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <Button
          onClick={handleEnroll}
          disabled={processing}
          className="mt-6 w-full rounded-xl gradient-brand border-0 text-white"
          size="lg"
        >
          {processing ? (
            <><Loader2 className="me-2 h-4 w-4 animate-spin" /> Processing…</>
          ) : (
            <>Enroll for Free</>
          )}
        </Button>
      </div>
    </div>
  );
}
