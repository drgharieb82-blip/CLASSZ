import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { devStats, deploymentsTable } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/developer/deployments")({ component: Page });

function Page() {
  return (
    <DashPage role="developer" title="Deployments" subtitle="Release history and environments" icon={ROLES.developer.icon}>
      <GenericDashboard stats={devStats} chartA="bar" chartB="donut" chartATitle="Deploy frequency" chartATitleSub="Last 7 days" chartBTitle="By service" table={deploymentsTable} />
    </DashPage>
  );
}
