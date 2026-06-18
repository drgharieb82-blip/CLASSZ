import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/teacher/assignments")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="teacher" title="Assignments" subtitle="Track submissions and grading" icon={ROLES.teacher.icon}>
      <GenericDashboard chartA="area" chartB="donut" />
    </DashPage>
  );
}
