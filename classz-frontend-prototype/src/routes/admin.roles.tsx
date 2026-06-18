import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/admin/roles")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="admin" title="Roles & Permissions" subtitle="Configure access control" icon={ROLES.admin.icon}>
      <GenericDashboard chartA="area" chartB="donut" />
    </DashPage>
  );
}
