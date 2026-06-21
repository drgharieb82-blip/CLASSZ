import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownLeft, DollarSign, Download, TrendingUp, Wallet, CreditCard,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { COUNTRIES } from "@/lib/i18n/countries";
import { teacherRevenue } from "@/lib/teacherMock";

export const Route = createFileRoute("/teacher/revenue")({
  component: RevenuePage,
});

const filterOptions: FilterOption[] = [
  { key: "country", label: "Country", options: COUNTRIES.map((c) => ({ value: c.code, label: `${c.name} (${c.currencyCode})` })) },
  { key: "status", label: "Status", options: [
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
  ]},
  { key: "type", label: "Type", options: [
    { value: "course", label: "Course" },
    { value: "session", label: "Session" },
    { value: "exam", label: "Exam" },
    { value: "wallet", label: "Wallet Recharge" },
  ]},
  { key: "period", label: "Period", options: [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" },
  ]},
];

function RevenuePage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const { todayRevenue, monthlyRevenue, totalRevenue, walletBalance, pendingWithdraw, platformFee, recentSales, monthlyBreakdown } = teacherRevenue;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  return (
    <DashPage role="teacher" title="Revenue & Wallet" subtitle="Track earnings across countries and currencies" icon={ROLES.teacher.icon}>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border bg-card p-4">
          <DollarSign className="h-5 w-5 text-emerald-500" />
          <p className="mt-2 text-2xl font-bold">${todayRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Today's Revenue</p>
        </Card>
        <Card className="border bg-card p-4">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <p className="mt-2 text-2xl font-bold">${monthlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">This Month</p>
        </Card>
        <Card className="border bg-card p-4">
          <Wallet className="h-5 w-5 text-amber-500" />
          <p className="mt-2 text-2xl font-bold">${walletBalance.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Wallet Balance</p>
        </Card>
        <Card className="border bg-card p-4">
          <CreditCard className="h-5 w-5 text-violet-500" />
          <p className="mt-2 text-2xl font-bold">${pendingWithdraw.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Pending Withdrawal</p>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Monthly Revenue</h3>
          <Badge variant="outline" className="rounded-full text-xs">Multi-currency aggregated</Badge>
        </div>
        <div className="flex items-end gap-2" style={{ height: 160 }}>
          {monthlyBreakdown.map((m) => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 transition-all"
                style={{ height: `${(m.revenue / 40000) * 140}px` }}
              />
              <span className="text-xs text-muted-foreground">{m.month}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>Total: ${totalRevenue.toLocaleString()}</span>
          <span>Platform fee: {platformFee * 100}%</span>
          <span>Your share: {(1 - platformFee) * 100}%</span>
        </div>
      </Card>

      {/* Filters */}
      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={() => { setFilters({}); setPage(1); }}
        totalResults={recentSales.length}
        placeholder="Search by student, payment ID..."
      />

      {/* Bulk Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl">Request Withdrawal</Button>
      </div>

      {/* Transactions Table */}
      <Card className="border bg-card p-5">
        <h3 className="font-semibold mb-4">Transactions</h3>
        <div className="space-y-2">
          {recentSales.map((sale) => (
            <div key={sale.id} className="flex items-center gap-3 rounded-xl border px-4 py-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10">
                <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{sale.item}</p>
                <p className="text-xs text-muted-foreground">{sale.studentName} · {sale.studentCode}</p>
              </div>
              <div className="text-end">
                <p className="text-sm font-semibold text-emerald-600">+${sale.amount}</p>
                <p className="text-xs text-muted-foreground">{sale.date}</p>
              </div>
            </div>
          ))}
        </div>
        <Pagination page={page} pageSize={5} total={recentSales.length} onPageChange={setPage} />
      </Card>

      {/* Revenue Model */}
      <Card className="border bg-card p-5">
        <h3 className="font-semibold">Revenue Model</h3>
        <p className="mt-1 text-xs text-muted-foreground">Multi-currency support ready. Prices can vary by country.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border p-4 text-center">
            <p className="text-2xl font-bold">85%</p>
            <p className="text-sm text-muted-foreground">Your Share</p>
          </div>
          <div className="rounded-xl border p-4 text-center">
            <p className="text-2xl font-bold">15%</p>
            <p className="text-sm text-muted-foreground">Platform Fee</p>
          </div>
          <div className="rounded-xl border p-4 text-center">
            <p className="text-2xl font-bold">14</p>
            <p className="text-sm text-muted-foreground">Countries</p>
          </div>
        </div>
      </Card>
    </DashPage>
  );
}
