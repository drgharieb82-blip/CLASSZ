import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/teacher/assessments/create")({
  component: TeacherAssessmentsCreatePage,
});

function TeacherAssessmentsCreatePage() {
  return (
    <DashPage
      role="teacher"
      title="Create Assessment"
      subtitle="Build quizzes, homework, exams, assignments and assessments from Question Bank."
      icon={ClipboardList}
    >
      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <Card className="border bg-card p-5">
          <h2 className="text-sm font-semibold">Wizard steps placeholder</h2>
        </Card>

        <Card className="border bg-card p-5">
          <h2 className="text-sm font-semibold">Step content placeholder</h2>
        </Card>

        <Card className="border bg-card p-5">
          <h2 className="text-sm font-semibold">Assessment summary placeholder</h2>
        </Card>
      </div>
    </DashPage>
  );
}
