import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/student/notifications")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="student" title="Notifications" subtitle="Stay up to date" icon={ROLES.student.icon}>
      <GenericDashboard chartA="bar" chartB="donut" />
    </DashPage>
  );
}
