import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/teacher/analytics")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="teacher" title="Analytics" subtitle="Insights into class performance" icon={ROLES.teacher.icon}>
      <GenericDashboard chartA="area" chartB="radar" />
    </DashPage>
  );
}
