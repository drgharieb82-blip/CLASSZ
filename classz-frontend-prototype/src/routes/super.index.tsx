import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { superStats, auditTable } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/super/")({ component: Page });

function Page() {
  return (
    <DashPage role="superadmin" title="Super Admin" subtitle="Total platform control" icon={ROLES.superadmin.icon}>
      <GenericDashboard stats={superStats} chartA="bar" chartB="donut" chartATitle="Platform revenue" chartATitleSub="Last 6 months" chartBTitle="Users by role" table={auditTable} />
    </DashPage>
  );
}
