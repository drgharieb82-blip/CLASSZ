import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { superStats, auditTable } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/super/audit")({ component: Page });

function Page() {
  return (
    <DashPage role="superadmin" title="Audit Logs" subtitle="Every sensitive action, tracked" icon={ROLES.superadmin.icon}>
      <GenericDashboard stats={superStats} chartA="area" chartB="donut" chartATitle="Audit events" chartATitleSub="Last 7 days" chartBTitle="Users by role" table={auditTable} />
    </DashPage>
  );
}
