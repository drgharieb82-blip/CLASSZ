import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/assistant/solve")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="student" title="Solve a Question" subtitle="Walkthrough solutions instantly" icon={ROLES.student.icon}>
      <GenericDashboard chartA="bar" chartB="donut" />
    </DashPage>
  );
}
