import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { DashPage } from "@/components/common/DashPage";
import { ROLES } from "@/lib/roles";
import { enrolledCourses } from "@/lib/mock";
import { EnrolledCourseCard } from "@/components/student/EnrolledCourseCard";

export const Route = createFileRoute("/student/courses/")({
  component: Page,
});

function Page() {
  return (
    <DashPage
      role="student"
      title="My Courses"
      subtitle="Continue where you left off"
      icon={ROLES.student.icon}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45 }}
        className="grid gap-6 md:grid-cols-2"
      >
        {enrolledCourses.map((course) => (
          <EnrolledCourseCard key={course.id} course={course} />
        ))}
      </motion.div>
    </DashPage>
  );
}
