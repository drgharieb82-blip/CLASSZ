import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { devStats, servicesTable } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/developer/")({ component: Page });

function Page() {
  return (
    <DashPage role="developer" title="Developer Dashboard" subtitle="System health and operations" icon={ROLES.developer.icon}>
      <GenericDashboard stats={devStats} chartA="area" chartB="radar" chartATitle="Request latency" chartATitleSub="Last 7 days" chartBTitle="Service load" table={servicesTable} />
    </DashPage>
  );
}
