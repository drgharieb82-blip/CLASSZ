import { createFileRoute } from "@tanstack/react-router";
import { AssessmentWorkspace } from "@/components/teacher/AssessmentWorkspace";

export const Route = createFileRoute("/teacher/assessments/create")({
  component: TeacherAssessmentsCreatePage,
});

function TeacherAssessmentsCreatePage() {
  return <AssessmentWorkspace />;
}
