import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/parent/attendance")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="parent" title="Attendance" subtitle="Session attendance overview" icon={ROLES.parent.icon}>
      <GenericDashboard chartA="area" chartB="donut" />
    </DashPage>
  );
}
