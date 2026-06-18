import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";
import { financeStats, couponsTable } from "@/lib/dashboard-presets";

export const Route = createFileRoute("/finance/coupons")({ component: Page });

function Page() {
  return (
    <DashPage role="finance" title="Coupons" subtitle="Promotions and discount codes" icon={ROLES.finance.icon}>
      <GenericDashboard stats={financeStats} chartA="bar" chartB="donut" chartATitle="Redemptions" chartATitleSub="Last 6 months" chartBTitle="Plan mix" table={couponsTable} />
    </DashPage>
  );
}
