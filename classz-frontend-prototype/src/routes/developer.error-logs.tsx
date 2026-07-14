import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { devStats, errorLogsTable } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/developer/error-logs")({ component: Page });

function Page() {
  return (
    <DashPage role="developer" title="Error Logs" subtitle="Recent runtime errors and warnings" icon={ROLES.developer.icon}>
      <GenericDashboard stats={devStats} chartA="bar" chartB="donut" chartATitle="Error volume" chartATitleSub="Last 7 days" chartBTitle="By service" table={errorLogsTable} />
    </DashPage>
  );
}
