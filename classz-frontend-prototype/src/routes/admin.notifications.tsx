import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/admin/notifications")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="admin" title="Notifications" subtitle="Broadcast to your users" icon={ROLES.admin.icon}>
      <GenericDashboard chartA="bar" chartB="donut" />
    </DashPage>
  );
}
