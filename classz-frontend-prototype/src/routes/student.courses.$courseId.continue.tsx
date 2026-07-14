import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { loadStudentCourseOwnership } from "@/lib/student-course-access";

export const Route = createFileRoute("/student/courses/$courseId/continue")({
  component: ContinueLearningRedirect,
});

function ContinueLearningRedirect() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    loadStudentCourseOwnership(courseId)
      .then((isEnrolled) => {
        if (!active) return;
        navigate({
          to: isEnrolled ? "/student/courses/$courseId/session" : "/student/courses/$courseId/enroll",
          params: { courseId },
          replace: true,
        });
      })
      .catch(() => {
        if (!active) return;
        navigate({ to: "/student/courses", replace: true });
      });

    return () => {
      active = false;
    };
  }, [courseId, navigate]);

  return null;
}
