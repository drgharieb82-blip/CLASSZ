import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/super/access-matrix")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="superadmin" title="Role Access Matrix" subtitle="Permissions per role" icon={ROLES.superadmin.icon}>
      <GenericDashboard chartA="bar" chartB="radar" />
    </DashPage>
  );
}
