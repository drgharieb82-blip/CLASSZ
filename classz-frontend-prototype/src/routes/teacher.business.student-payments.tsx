import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Search, CreditCard, DollarSign, Clock, ArrowDownRight,
  Check, RotateCcw, Plus, Tag, Wallet, Receipt,
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
import { studentPayments } from "@/lib/students-mock-data";
import type { StudentPayment } from "@/lib/students-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/business/student-payments")({
  component: StudentPaymentsPage,
});

const refundColorMap: Record<StudentPayment["refundStatus"], string> = {
  none: "border-slate-300 text-slate-500 bg-slate-500/10",
  requested: "border-amber-300 text-amber-600 bg-amber-500/10",
  approved: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
  rejected: "border-rose-300 text-rose-600 bg-rose-500/10",
};

const refundLabelMap: Record<StudentPayment["refundStatus"], string> = {
  none: "None",
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
};

function StudentPaymentsPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const courses = useMemo(
    () => Array.from(new Set(studentPayments.map((p) => p.course))),
    []
  );

  const filtered = useMemo(() => {
    let data = studentPayments as StudentPayment[];
    if (courseFilter !== "all") {
      data = data.filter((p) => p.course === courseFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.studentName.toLowerCase().includes(q) ||
          p.course.toLowerCase().includes(q) ||
          p.coupon.toLowerCase().includes(q)
      );
    }
    return data;
  }, [search, courseFilter]);

  const totalPayments = studentPayments.length;
  const totalPaid = studentPayments.reduce((s, p) => s + p.paid, 0);
  const totalPending = studentPayments.reduce((s, p) => s + p.pending, 0);
  const refundRequests = studentPayments.filter((p) => p.refundStatus !== "none").length;

  const summaryCards = [
    { label: "Total Payments", value: totalPayments.toString(), icon: CreditCard, color: "text-blue-400", bg: "bg-blue-500/10", valueColor: "" },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString()}`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", valueColor: "text-emerald-500" },
    { label: "Total Pending", value: `$${totalPending.toLocaleString()}`, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", valueColor: "text-amber-500" },
    { label: "Refund Requests", value: refundRequests.toString(), icon: ArrowDownRight, color: "text-rose-400", bg: "bg-rose-500/10", valueColor: "text-rose-500" },
  ];

  return (
    <DashPage role="teacher" title={t("biz.studentPayments")} subtitle="Track student purchases, balances, and refund requests" icon={ROLES.teacher.icon}>
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
              placeholder="Search student, course, or coupon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl"
            />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="hidden rounded-full sm:inline-flex">{filtered.length} records</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Purchase</TableHead>
                <TableHead>Wallet Balance ($)</TableHead>
                <TableHead>Paid ($)</TableHead>
                <TableHead>Pending ($)</TableHead>
                <TableHead>Coupon</TableHead>
                <TableHead>Refund Status</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-accent/50">
                  <TableCell className="font-medium text-sm">{payment.studentName}</TableCell>
                  <TableCell className="text-sm">{payment.course}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full text-xs">{payment.purchase}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <Wallet className="h-3 w-3 text-muted-foreground" />
                      ${payment.walletBalance}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-emerald-500">${payment.paid}</TableCell>
                  <TableCell>
                    {payment.pending > 0 ? (
                      <span className="text-sm font-semibold text-amber-500">${payment.pending}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">---</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {payment.coupon ? (
                      <Badge variant="outline" className="rounded-full text-xs gap-1 border-violet-300 text-violet-500 bg-violet-500/10">
                        <Tag className="h-3 w-3" /> {payment.coupon}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">---</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full text-xs", refundColorMap[payment.refundStatus])}>
                      {refundLabelMap[payment.refundStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Approve Payment">
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Extend Access">
                        <Clock className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Add Manual Payment">
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Refund">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Receipt className="h-8 w-8" />
                      <p className="text-sm">No payment records found</p>
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
