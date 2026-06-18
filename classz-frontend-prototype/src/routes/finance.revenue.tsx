import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { financeStats, subscriptionsTable } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/finance/revenue")({ component: Page });

function Page() {
  return (
    <DashPage role="finance" title="Teacher Revenue" subtitle="Revenue sharing and payouts" icon={ROLES.finance.icon}>
      <GenericDashboard stats={financeStats} chartA="bar" chartB="radar" chartATitle="Payout trend" chartATitleSub="Last 6 months" chartBTitle="By subject" table={subscriptionsTable} />
    </DashPage>
  );
}
