import { createFileRoute } from "@tanstack/react-router";
import { Scale, DollarSign, ReceiptText, TrendingDown, FileDown, FileSpreadsheet } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { taxSummary, platformFinanceStats, expenseSummary } from "@/lib/platform-finance-mock-data";

export const Route = createFileRoute("/admin/finance/taxes")({
  component: TaxesPage,
});

const quarterlyData = [
  { quarter: "Q1 2026", taxable: 185_250, deductible: 87_700, net: 14_633, status: "Filed" },
  { quarter: "Q2 2026", taxable: 240_750, deductible: 96_300, net: 21_668, status: "Pending" },
];

function TaxesPage() {
  const { t } = useApp();

  return (
    <DashPage
      role="superadmin"
      title="pf.taxes"
      subtitle="pf.taxesSubtitle"
      icon={Scale}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl"><FileDown className="me-1.5 h-4 w-4" />{t("pf.downloadPDF")}</Button>
          <Button variant="outline" size="sm" className="rounded-xl"><FileSpreadsheet className="me-1.5 h-4 w-4" />{t("pf.exportExcel")}</Button>
        </div>
      }
    >
      {/* VAT / Tax Summary cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10"><DollarSign className="h-5 w-5 text-blue-500" /></span>
          <div><p className="text-xl font-bold">${taxSummary.taxableRevenue.toLocaleString()}</p><p className="text-xs text-muted-foreground">{t("pf.taxableRevenue")}</p></div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10"><ReceiptText className="h-5 w-5 text-amber-500" /></span>
          <div><p className="text-xl font-bold">${expenseSummary.monthly.toLocaleString()}</p><p className="text-xs text-muted-foreground">{t("pf.deductibleExpenses")}</p></div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10"><TrendingDown className="h-5 w-5 text-rose-500" /></span>
          <div><p className="text-xl font-bold">${taxSummary.netTax.toLocaleString()}</p><p className="text-xs text-muted-foreground">{t("pf.netTax")}</p></div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10"><Scale className="h-5 w-5 text-emerald-500" /></span>
          <div><p className="text-xl font-bold">{taxSummary.vatRate}%</p><p className="text-xs text-muted-foreground">VAT Rate</p></div>
        </Card>
      </div>

      {/* Tax breakdown visual */}
      <Card className="border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">{t("pf.vatTaxSummary")}</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("pf.taxableRevenue")}</span>
              <span className="font-semibold">${taxSummary.taxableRevenue.toLocaleString()}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-blue-500" style={{ width: "100%" }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("pf.deductibleExpenses")}</span>
              <span className="font-semibold">-${expenseSummary.monthly.toLocaleString()}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-amber-500" style={{ width: `${(expenseSummary.monthly / taxSummary.taxableRevenue * 100).toFixed(0)}%` }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("pf.netTax")} ({taxSummary.vatRate}%)</span>
              <span className="font-bold text-rose-600">${taxSummary.netTax.toLocaleString()}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-rose-500" style={{ width: `${(taxSummary.netTax / taxSummary.taxableRevenue * 100).toFixed(0)}%` }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Quarterly tax reports */}
      <Card className="border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">{t("pf.taxReports")}</h3>
        <div className="space-y-3">
          {quarterlyData.map((q) => (
            <div key={q.quarter} className="flex items-center justify-between gap-3 rounded-lg border p-4">
              <div>
                <p className="text-sm font-semibold">{q.quarter}</p>
                <p className="text-xs text-muted-foreground">
                  {t("pf.taxableRevenue")}: ${q.taxable.toLocaleString()} &middot; {t("pf.deductibleExpenses")}: ${q.deductible.toLocaleString()}
                </p>
              </div>
              <div className="text-end shrink-0">
                <p className="text-sm font-bold text-rose-600">${q.net.toLocaleString()}</p>
                <span className={cn(
                  "text-xs font-medium rounded-full px-2 py-0.5",
                  q.status === "Filed" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                )}>{q.status}</span>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl shrink-0"><FileDown className="me-1.5 h-3.5 w-3.5" />{t("pf.downloadPDF")}</Button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-center">
        <Button className="rounded-xl gradient-brand border-0 text-white">{t("pf.generateTaxReport")}</Button>
      </div>
    </DashPage>
  );
}
