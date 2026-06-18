import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/admin/users")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="admin" title="Users" subtitle="Manage all platform users" icon={ROLES.admin.icon}>
      <GenericDashboard chartA="bar" chartB="donut" />
    </DashPage>
  );
}
