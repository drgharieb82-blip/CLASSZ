import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Search, ShoppingCart, DollarSign, Clock, AlertTriangle,
  Eye, Check, RotateCcw, Receipt,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { orders } from "@/lib/business-mock-data";
import type { OrderRecord } from "@/lib/business-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/business/orders")({
  component: OrdersPage,
});

const statusColorMap: Record<OrderRecord["status"], string> = {
  pending: "border-amber-300 text-amber-600 bg-amber-500/10",
  paid: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
  failed: "border-rose-300 text-rose-600 bg-rose-500/10",
  refunded: "border-violet-300 text-violet-600 bg-violet-500/10",
  cancelled: "border-slate-300 text-slate-500 bg-slate-500/10",
};

const statusLabelMap: Record<OrderRecord["status"], string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

function OrdersPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let data = orders as OrderRecord[];
    if (statusFilter !== "all") {
      data = data.filter((o) => o.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.studentName.toLowerCase().includes(q) ||
          o.course.toLowerCase().includes(q)
      );
    }
    return data;
  }, [search, statusFilter]);

  const totalOrders = orders.length;
  const paidCount = orders.filter((o) => o.status === "paid").length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const failedCount = orders.filter((o) => o.status === "failed").length;

  const summaryCards = [
    { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "text-blue-400", bg: "bg-blue-500/10", valueColor: "" },
    { label: "Paid", value: paidCount, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", valueColor: "text-emerald-500" },
    { label: "Pending", value: pendingCount, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", valueColor: "text-amber-500" },
    { label: "Failed", value: failedCount, icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/10", valueColor: "text-rose-500" },
  ];

  return (
    <DashPage role="teacher" title={t("biz.orders")} subtitle="Manage and track all student orders" icon={ROLES.teacher.icon}>
      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((s) => (
          <Card key={s.label} className="flex items-center gap-3 border bg-card p-4">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </span>
            <div className="min-w-0">
              <p className={cn("text-2xl font-bold", s.valueColor)}>{s.value}</p>
              <p className="truncate text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border bg-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search order ID, student, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] rounded-xl">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="hidden rounded-full sm:inline-flex">{filtered.length} records</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount ($)</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id} className="hover:bg-accent/50">
                  <TableCell className="font-mono text-xs">{order.id}</TableCell>
                  <TableCell className="font-medium text-sm">{order.studentName}</TableCell>
                  <TableCell className="text-sm">{order.course}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full text-xs">{order.items}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-semibold">${order.amount}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{order.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full text-xs", statusColorMap[order.status])}>
                      {statusLabelMap[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Approve">
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Refund">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Extend Access">
                        <Clock className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Receipt className="h-8 w-8" />
                      <p className="text-sm">No orders found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashPage>
  );
}
