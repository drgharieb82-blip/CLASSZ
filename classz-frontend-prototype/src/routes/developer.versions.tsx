import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { devStats, deploymentsTable } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/developer/versions")({ component: Page });

function Page() {
  return (
    <DashPage role="developer" title="Version History" subtitle="Track every release" icon={ROLES.developer.icon}>
      <GenericDashboard stats={devStats} chartA="area" chartB="donut" chartATitle="Release cadence" chartATitleSub="Last 7 days" chartBTitle="By service" table={deploymentsTable} />
    </DashPage>
  );
}
