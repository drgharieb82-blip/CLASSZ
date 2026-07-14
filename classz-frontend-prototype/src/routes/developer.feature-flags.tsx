import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { devStats, featureFlagsTable } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/developer/feature-flags")({ component: Page });

function Page() {
  return (
    <DashPage role="developer" title="Feature Flags" subtitle="Gradual rollouts and toggles" icon={ROLES.developer.icon}>
      <GenericDashboard stats={devStats} chartA="bar" chartB="donut" chartATitle="Rollout activity" chartATitleSub="Last 7 days" chartBTitle="By service" table={featureFlagsTable} />
    </DashPage>
  );
}
