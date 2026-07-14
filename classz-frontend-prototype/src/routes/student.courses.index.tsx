import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { ROLES } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { listMyEnrollments, type EnrollmentRead } from "@/lib/api/enrollments";
import { EnrolledCourseCard } from "@/components/student/EnrolledCourseCard";
import { EmptyBookshelf } from "@/components/illustrations/Characters";
import { useApp } from "@/lib/app-context";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/student/courses/")({
  component: Page,
});

function Page() {
  const { t } = useApp();
  const [courses, setCourses] = useState<EnrollmentRead[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listMyEnrollments()
      .then((response) => {
        if (!active) return;
        setCourses(response.items);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof ApiError && typeof err.body === "object" && err.body !== null && "detail" in err.body
            ? String((err.body as { detail: string }).detail)
            : "Failed to load enrollments.",
        );
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DashPage
      role="student"
      title={t("workspace.myCourses")}
      subtitle={t("student.continueWhereLeftOff")}
      icon={ROLES.student.icon}
    >
      {courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center"
        >
          <EmptyBookshelf size="lg" />
          <BookOpen className="h-12 w-12 text-slate-500" />
          <h2 className="text-lg font-semibold text-white">{t("student.noCoursesYet")}</h2>
          <p className="text-sm text-slate-400">{t("student.learningAdventureStarts")}</p>
          <Button asChild className="rounded-xl gradient-brand border-0 text-white">
            <Link to="/courses">{t("student.browseCourses")}</Link>
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {courses.map((enrollment) => (
            <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </motion.div>
      )}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </DashPage>
  );
}
