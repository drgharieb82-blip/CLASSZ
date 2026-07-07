import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { QuestionBuilder } from "@/components/question/QuestionBuilder";

export const Route = createFileRoute("/teacher/questions/$questionId/edit")({
  component: EditQuestionWorkspace,
});

function EditQuestionWorkspace() {
  const { questionId } = Route.useParams();
  const navigate = useNavigate();
  return (
    <DashboardLayout role="teacher">
      <QuestionBuilder mode="edit" questionId={questionId} onExit={() => navigate({ to: "/teacher/questions" })} />
    </DashboardLayout>
  );
}
