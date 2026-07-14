import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { superStats, servicesTable } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/super/system")({ component: Page });

function Page() {
  return (
    <DashPage role="superadmin" title="System Control" subtitle="Core platform switches and health" icon={ROLES.superadmin.icon}>
      <GenericDashboard stats={superStats} chartA="area" chartB="donut" chartATitle="System load" chartATitleSub="Last 7 days" chartBTitle="Users by role" table={servicesTable} />
    </DashPage>
  );
}
