import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/student/courses/$courseId/continue")({
  component: ContinueLearningRedirect,
});

function ContinueLearningRedirect() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate({
      to: "/student/courses/$courseId/session",
      params: { courseId },
      replace: true,
    });
  }, [courseId, navigate]);

  return null;
}
