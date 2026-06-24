import { createFileRoute } from "@tanstack/react-router";
import {
  DollarSign, TrendingUp, ReceiptText, ShoppingCart, Banknote,
  BadgeDollarSign, FileDown, FileSpreadsheet, CalendarRange,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/business/financial-reports")({
  component: FinancialReportsPage,
});

interface ReportCard {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const reports: ReportCard[] = [
  {
    title: "Revenue Report",
    description: "Complete revenue breakdown by course, period, and payment method",
    icon: DollarSign,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Profit Report",
    description: "Net profit after expenses, taxes, and revenue sharing",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Expense Report",
    description: "Detailed expense tracking by category and period",
    icon: ReceiptText,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    title: "Sales Report",
    description: "Sales analytics with conversion rates and trends",
    icon: ShoppingCart,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    title: "Payout Report",
    description: "All payout transactions and withdrawal history",
    icon: Banknote,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Student Payments Report",
    description: "Student payment status, pending amounts, and refunds",
    icon: BadgeDollarSign,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

function FinancialReportsPage() {
  const { t } = useApp();

  return (
    <DashPage
      role="teacher"
      title={t("biz.financialReports")}
      subtitle="Generate and export financial reports"
      icon={ROLES.teacher.icon}
    >
      {/* ── Date range picker ── */}
      <Card className="border bg-card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Date Range</span>
          </div>
          <Separator orientation="vertical" className="hidden h-8 sm:block" />
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">From</label>
              <Input
                type="date"
                defaultValue="2026-06-01"
                className="w-[160px] rounded-xl bg-background"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">To</label>
              <Input
                type="date"
                defaultValue="2026-06-24"
                className="w-[160px] rounded-xl bg-background"
              />
            </div>
            <Button className="rounded-xl">Generate</Button>
          </div>
        </div>
      </Card>

      {/* ── Report cards grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.title} className="border bg-card p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", r.bg)}>
                <r.icon className={cn("h-5 w-5", r.color)} />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{r.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {r.description}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 text-xs">
                <FileDown className="h-3.5 w-3.5" />
                {t("biz.exportPDF")}
              </Button>
              <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 text-xs">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                {t("biz.exportExcel")}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </DashPage>
  );
}
