import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { QuestionWorkspace } from "@/components/question/QuestionWorkspace";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/teacher/questions/")({
  component: QuestionBankPage,
});

function QuestionBankPage() {
  return (
      <DashPage role="teacher" title="Question Bank" subtitle="Create and manage questions for quizzes and exams" icon={ROLES.teacher.icon}>
      <QuestionWorkspace
        showInsights
        createAction={(
          <Button asChild className="rounded-xl gradient-brand border-0 text-white" size="sm">
            <Link to="/teacher/questions/create">
              <Plus className="me-1.5 h-4 w-4" /> Create Question
            </Link>
          </Button>
        )}
        emptyAction={(
          <Button asChild className="rounded-xl gradient-brand border-0 text-white">
            <Link to="/teacher/questions/create">
              <Plus className="me-1.5 h-4 w-4" /> Create Question
            </Link>
          </Button>
        )}
      />
    </DashPage>
  );
}
