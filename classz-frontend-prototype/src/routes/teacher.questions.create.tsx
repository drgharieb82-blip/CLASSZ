import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/teacher/questions/create")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="teacher" title="Create Question" subtitle="Add a new question to the bank" icon={ROLES.teacher.icon}>
      <GenericDashboard chartA="bar" chartB="radar" />
    </DashPage>
  );
}
