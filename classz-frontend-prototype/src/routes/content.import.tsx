import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/content/import")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="content" title="Import Content" subtitle="Bulk import lessons and questions" icon={ROLES.content.icon}>
      <GenericDashboard chartA="area" chartB="donut" />
    </DashPage>
  );
}
