import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { superStats } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/super/analytics")({ component: Page });

function Page() {
  return (
    <DashPage role="superadmin" title="Global Analytics" subtitle="Cross-platform insights" icon={ROLES.superadmin.icon}>
      <GenericDashboard stats={superStats} chartA="area" chartB="radar" chartATitle="Engagement" chartATitleSub="Last 7 days" chartBTitle="Subject performance" />
    </DashPage>
  );
}
