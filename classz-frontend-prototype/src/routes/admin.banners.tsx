import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/admin/banners")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="admin" title="Banners" subtitle="Promotional banners and campaigns" icon={ROLES.admin.icon}>
      <GenericDashboard chartA="area" chartB="radar" />
    </DashPage>
  );
}
