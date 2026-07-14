import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/admin/students")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="superadmin" title="Students" subtitle="Manage enrolled students" icon={ROLES.superadmin.icon}>
      <GenericDashboard chartA="bar" chartB="donut" />
    </DashPage>
  );
}
