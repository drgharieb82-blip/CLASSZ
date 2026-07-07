import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { QuestionBuilder } from "@/components/question/QuestionBuilder";

export const Route = createFileRoute("/teacher/questions/create")({
  component: CreateQuestionWorkspace,
});

function CreateQuestionWorkspace() {
  const navigate = useNavigate();
  return (
    <DashboardLayout role="teacher">
      <QuestionBuilder mode="create" onExit={() => navigate({ to: "/teacher/questions" })} />
    </DashboardLayout>
  );
}
