import { createFileRoute } from "@tanstack/react-router";
import { AssessmentWorkspace } from "@/components/teacher/AssessmentWorkspace";

export const Route = createFileRoute("/teacher/assessments/$assessmentId/edit")({
  component: TeacherAssessmentEditPage,
});

function TeacherAssessmentEditPage() {
  const { assessmentId } = Route.useParams();

  return <AssessmentWorkspace assessmentId={assessmentId} />;
}
