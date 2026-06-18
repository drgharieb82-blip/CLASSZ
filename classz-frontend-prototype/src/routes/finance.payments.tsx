import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { financeStats, paymentsTable } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/finance/payments")({ component: Page });

function Page() {
  return (
    <DashPage role="finance" title="Payment History" subtitle="Every transaction across the platform" icon={ROLES.finance.icon}>
      <GenericDashboard stats={financeStats} chartA="bar" chartB="donut" chartATitle="Revenue trend" chartATitleSub="Last 6 months" chartBTitle="Plan mix" table={paymentsTable} />
    </DashPage>
  );
}
