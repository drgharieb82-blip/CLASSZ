import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { devStats, deploymentsTable } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/developer/frontend")({ component: Page });

function Page() {
  return (
    <DashPage role="developer" title="Frontend Status" subtitle="Client build and performance" icon={ROLES.developer.icon}>
      <GenericDashboard stats={devStats} chartA="area" chartB="donut" chartATitle="Page load times" chartATitleSub="Last 7 days" chartBTitle="By service" table={deploymentsTable} />
    </DashPage>
  );
}
