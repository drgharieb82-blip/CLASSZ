import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/admin/")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="admin" title="Admin Dashboard" subtitle="Platform health and key metrics" icon={ROLES.admin.icon}>
      <GenericDashboard chartA="area" chartB="radar" />
    </DashPage>
  );
}
