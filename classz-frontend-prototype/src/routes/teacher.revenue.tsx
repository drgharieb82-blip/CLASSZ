import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { DollarSign, TrendingUp, Wallet, CreditCard } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { DataTable, type DataColumn } from "@/components/filters/DataTable";
import { COUNTRIES } from "@/lib/i18n/countries";
import { teacherRevenue } from "@/lib/teacherMock";

export const Route = createFileRoute("/teacher/revenue")({ component: RevenuePage });

const PAGE_SIZE = 15;

interface SaleRecord {
  id: string;
  studentCode: string;
  studentName: string;
  country: string;
  item: string;
  itemType: "course" | "session" | "exam" | "wallet" | "gift";
  amount: number;
  currency: string;
  platformFee: number;
  teacherShare: number;
  status: "paid" | "pending" | "failed" | "refunded";
  method: string;
  date: string;
}

const mockSales: SaleRecord[] = [
  { id: "PAY-26-000201", studentCode: "CLS-26-000023", studentName: "Ahmed Youssef", country: "EG", item: "Session: Derivatives", itemType: "session", amount: 20, currency: "USD", platformFee: 3, teacherShare: 17, status: "paid", method: "Fawry", date: "2026-06-21" },
  { id: "PAY-26-000200", studentCode: "CLS-26-000145", studentName: "Sara Mahmoud", country: "SA", item: "Course: Advanced Mathematics", itemType: "course", amount: 49, currency: "USD", platformFee: 7.35, teacherShare: 41.65, status: "paid", method: "Mada", date: "2026-06-21" },
  { id: "PAY-26-000199", studentCode: "CLS-26-000087", studentName: "Nour Hassan", country: "EG", item: "Session: Integration", itemType: "session", amount: 20, currency: "USD", platformFee: 3, teacherShare: 17, status: "paid", method: "Vodafone Cash", date: "2026-06-20" },
  { id: "PAY-26-000198", studentCode: "CLS-26-000012", studentName: "Omar Fathy", country: "KW", item: "Wallet Gift", itemType: "gift", amount: 25, currency: "USD", platformFee: 0, teacherShare: 0, status: "paid", method: "Teacher Wallet", date: "2026-06-20" },
  { id: "PAY-26-000197", studentCode: "CLS-26-000056", studentName: "Lina Karim", country: "JO", item: "Exam: Calculus Final", itemType: "exam", amount: 15, currency: "USD", platformFee: 2.25, teacherShare: 12.75, status: "paid", method: "Credit Card", date: "2026-06-19" },
  { id: "PAY-26-000196", studentCode: "CLS-26-000034", studentName: "Dina Salem", country: "AE", item: "Course: Calculus Masterclass", itemType: "course", amount: 55, currency: "USD", platformFee: 8.25, teacherShare: 46.75, status: "paid", method: "Apple Pay", date: "2026-06-18" },
  { id: "PAY-26-000195", studentCode: "CLS-26-000078", studentName: "Hana Tarek", country: "EG", item: "Session: Sequences", itemType: "session", amount: 20, currency: "USD", platformFee: 3, teacherShare: 17, status: "pending", method: "Instapay", date: "2026-06-18" },
  { id: "PAY-26-000194", studentCode: "CLS-26-000091", studentName: "Youssef Ahmed", country: "SA", item: "Session: Probability", itemType: "session", amount: 20, currency: "USD", platformFee: 3, teacherShare: 17, status: "failed", method: "Mada", date: "2026-06-17" },
  { id: "PAY-26-000193", studentCode: "CLS-26-000110", studentName: "Mariam Nabil", country: "EG", item: "Course: Advanced Mathematics", itemType: "course", amount: 49, currency: "USD", platformFee: 7.35, teacherShare: 41.65, status: "refunded", method: "Fawry", date: "2026-06-16" },
];

const statusColors: Record<string, string> = {
  paid: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
  pending: "border-amber-300 text-amber-600 bg-amber-500/10",
  failed: "border-rose-300 text-rose-600 bg-rose-500/10",
  refunded: "border-slate-300 text-slate-500 bg-slate-500/10",
};

const columns: DataColumn<SaleRecord>[] = [
  { key: "id", label: "Payment ID", sortable: true, width: "130px", render: (r) => <span className="font-mono text-xs">{r.id}</span>, exportValue: (r) => r.id },
  { key: "studentName", label: "Student", sortable: true, render: (r) => (
    <div><p className="text-sm font-medium">{r.studentName}</p><p className="text-xs text-muted-foreground">{r.studentCode}</p></div>
  ), exportValue: (r) => `${r.studentName} (${r.studentCode})` },
  { key: "country", label: "Country", sortable: true, hideOnMobile: true, render: (r) => {
    const c = COUNTRIES.find((x) => x.code === r.country);
    return <span className="text-xs">{c?.name ?? r.country}</span>;
  }, exportValue: (r) => COUNTRIES.find((x) => x.code === r.country)?.name ?? r.country },
  { key: "item", label: "Item", sortable: true, render: (r) => <span className="text-sm truncate block max-w-[180px]">{r.item}</span> },
  { key: "itemType", label: "Type", sortable: true, hideOnMobile: true, render: (r) => <Badge variant="outline" className="rounded-full text-xs capitalize">{r.itemType}</Badge> },
  { key: "amount", label: "Amount", sortable: true, align: "end", render: (r) => <span className="font-semibold">${r.amount}</span>, exportValue: (r) => String(r.amount) },
  { key: "platformFee", label: "Fee", sortable: true, align: "end", hideOnMobile: true, render: (r) => <span className="text-xs text-muted-foreground">${r.platformFee.toFixed(2)}</span>, exportValue: (r) => r.platformFee.toFixed(2) },
  { key: "teacherShare", label: "Your Share", sortable: true, align: "end", render: (r) => <span className="text-sm font-semibold text-emerald-600">${r.teacherShare.toFixed(2)}</span>, exportValue: (r) => r.teacherShare.toFixed(2) },
  { key: "method", label: "Method", sortable: true, hideOnMobile: true },
  { key: "date", label: "Date", sortable: true, align: "end", hideOnMobile: true },
  { key: "status", label: "Status", sortable: true, align: "center", render: (r) => <Badge variant="outline" className={cn("rounded-full text-xs", statusColors[r.status])}>{r.status}</Badge>, exportValue: (r) => r.status },
];

function RevenuePage() {
  const { todayRevenue, monthlyRevenue, totalRevenue, walletBalance, pendingWithdraw, platformFee, monthlyBreakdown } = teacherRevenue;
  const [search, setSearch] = useState(""); const [filters, setFilters] = useState<Record<string, string>>({}); const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("date"); const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filterOptions: FilterOption[] = [
    { key: "country", label: "Country", options: COUNTRIES.map((c) => ({ value: c.code, label: `${c.name} (${c.currencyCode})` })) },
    { key: "status", label: "Status", options: [{ value: "paid", label: "Paid" }, { value: "pending", label: "Pending" }, { value: "failed", label: "Failed" }, { value: "refunded", label: "Refunded" }] },
    { key: "type", label: "Type", options: [{ value: "course", label: "Course" }, { value: "session", label: "Session" }, { value: "exam", label: "Exam" }, { value: "wallet", label: "Wallet" }, { value: "gift", label: "Gift" }] },
    { key: "method", label: "Method", options: [{ value: "Fawry", label: "Fawry" }, { value: "Mada", label: "Mada" }, { value: "Vodafone Cash", label: "Vodafone Cash" }, { value: "Credit Card", label: "Credit Card" }, { value: "Apple Pay", label: "Apple Pay" }, { value: "Instapay", label: "Instapay" }] },
  ];

  const filtered = useMemo(() => {
    let r = [...mockSales];
    if (search) { const q = search.toLowerCase(); r = r.filter((s) => s.studentName.toLowerCase().includes(q) || s.studentCode.includes(q) || s.id.includes(q) || s.item.toLowerCase().includes(q)); }
    if (filters.status) r = r.filter((s) => s.status === filters.status);
    if (filters.type) r = r.filter((s) => s.itemType === filters.type);
    if (filters.country) r = r.filter((s) => s.country === filters.country);
    if (filters.method) r = r.filter((s) => s.method === filters.method);
    r.sort((a, b) => { const av = (a as any)[sortBy] ?? ""; const bv = (b as any)[sortBy] ?? ""; const c = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv)); return sortOrder === "asc" ? c : -c; });
    return r;
  }, [search, filters, sortBy, sortOrder]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = useCallback((col: string) => { if (sortBy === col) setSortOrder((o) => o === "asc" ? "desc" : "asc"); else { setSortBy(col); setSortOrder("asc"); } setPage(1); }, [sortBy]);

  return (
    <DashPage role="teacher" title="Revenue & Wallet" subtitle="Track earnings across countries and currencies" icon={ROLES.teacher.icon}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border bg-card p-4"><DollarSign className="h-5 w-5 text-emerald-500" /><p className="mt-2 text-2xl font-bold">${todayRevenue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Today</p></Card>
        <Card className="border bg-card p-4"><TrendingUp className="h-5 w-5 text-blue-500" /><p className="mt-2 text-2xl font-bold">${monthlyRevenue.toLocaleString()}</p><p className="text-xs text-muted-foreground">This Month</p></Card>
        <Card className="border bg-card p-4"><Wallet className="h-5 w-5 text-amber-500" /><p className="mt-2 text-2xl font-bold">${walletBalance.toLocaleString()}</p><p className="text-xs text-muted-foreground">Wallet</p></Card>
        <Card className="border bg-card p-4"><CreditCard className="h-5 w-5 text-violet-500" /><p className="mt-2 text-2xl font-bold">${pendingWithdraw.toLocaleString()}</p><p className="text-xs text-muted-foreground">Pending Withdraw</p></Card>
      </div>

      <Card className="border bg-card p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Monthly Revenue</h3><Badge variant="outline" className="rounded-full text-xs">Multi-currency</Badge></div>
        <div className="flex items-end gap-2" style={{ height: 140 }}>
          {monthlyBreakdown.map((m) => (<div key={m.month} className="flex flex-1 flex-col items-center gap-1"><div className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400" style={{ height: `${(m.revenue / 40000) * 120}px` }} /><span className="text-xs text-muted-foreground">{m.month}</span></div>))}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>Total: ${totalRevenue.toLocaleString()}</span><span>Fee: {platformFee * 100}%</span><span>Share: {(1 - platformFee) * 100}%</span></div>
      </Card>

      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} filters={filterOptions} activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }} onClearFilters={() => { setFilters({}); setPage(1); }} totalResults={total} placeholder="Search by student, payment ID, or item..." />

      <DataTable
        columns={columns}
        data={paginated}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        rowKey={(r) => r.id}
        title="Revenue Transactions"
        bulkActions={<Button variant="outline" size="sm" className="rounded-lg text-xs h-8">Request Withdrawal</Button>}
      />

      <Card className="border bg-card p-5"><h3 className="font-semibold">Revenue Model</h3><p className="mt-1 text-xs text-muted-foreground">Multi-currency support. Prices vary by country.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border p-3 text-center"><p className="text-2xl font-bold">85%</p><p className="text-xs text-muted-foreground">Your Share</p></div><div className="rounded-xl border p-3 text-center"><p className="text-2xl font-bold">15%</p><p className="text-xs text-muted-foreground">Platform Fee</p></div><div className="rounded-xl border p-3 text-center"><p className="text-2xl font-bold">14</p><p className="text-xs text-muted-foreground">Countries</p></div></div>
      </Card>
    </DashPage>
  );
}
