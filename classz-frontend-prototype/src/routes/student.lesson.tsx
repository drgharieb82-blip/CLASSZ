import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { listMyEnrollments } from "@/lib/api/enrollments";

export const Route = createFileRoute("/student/lesson")({
  component: LessonRedirect,
});

function LessonRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    listMyEnrollments()
      .then((response) => {
        if (!active) return;
        const firstCourse = response.items[0];
        if (firstCourse) {
          navigate({
            to: "/courses/$courseId",
            params: { courseId: firstCourse.course.id },
            replace: true,
          });
        } else {
          navigate({ to: "/student/courses", replace: true });
        }
      })
      .catch(() => {
        if (!active) return;
        navigate({ to: "/student/courses", replace: true });
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  return null;
}