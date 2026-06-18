import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { financeStats, subscriptionsTable } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/finance/subscriptions")({ component: Page });

function Page() {
  return (
    <DashPage role="finance" title="Subscriptions" subtitle="Recurring revenue and plan management" icon={ROLES.finance.icon}>
      <GenericDashboard stats={financeStats} chartA="bar" chartB="donut" chartATitle="MRR growth" chartATitleSub="Last 6 months" chartBTitle="Plan mix" table={subscriptionsTable} />
    </DashPage>
  );
}
