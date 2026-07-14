import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/questions/wrong")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="student" title="Wrong Questions" subtitle="Review and master your mistakes" icon={ROLES.student.icon}>
      <GenericDashboard chartA="bar" chartB="radar" />
    </DashPage>
  );
}
