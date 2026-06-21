import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { ROLES } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { getAllEnrolledCourses } from "@/lib/enrolled-courses";
import { useEnrollmentStore } from "@/lib/stores/enrollment-store";
import { EnrolledCourseCard } from "@/components/student/EnrolledCourseCard";

export const Route = createFileRoute("/student/courses/")({
  component: Page,
});

function Page() {
  useEnrollmentStore((s) => s.enrolledCourseIds);
  const courses = getAllEnrolledCourses();

  return (
    <DashPage
      role="student"
      title="My Courses"
      subtitle="Continue where you left off"
      icon={ROLES.student.icon}
    >
      {courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center"
        >
          <BookOpen className="h-12 w-12 text-slate-500" />
          <h2 className="text-lg font-semibold text-white">No courses yet</h2>
          <p className="text-sm text-slate-400">Browse our catalog to find your first course.</p>
          <Button asChild className="rounded-xl gradient-brand border-0 text-white">
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {courses.map((course) => (
            <EnrolledCourseCard key={course.id} course={course} />
          ))}
        </motion.div>
      )}
    </DashPage>
  );
}
