import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getAllEnrolledCourses } from "@/lib/enrolled-courses";

export const Route = createFileRoute("/student/lesson")({
  component: LessonRedirect,
});

function LessonRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const activeCourse = getAllEnrolledCourses().find((c) => c.status === "active");
    if (activeCourse) {
      navigate({
        to: "/student/courses/$courseId/session",
        params: { courseId: activeCourse.id },
        replace: true,
      });
    } else {
      navigate({ to: "/student/courses", replace: true });
    }
  }, [navigate]);

  return null;
}
