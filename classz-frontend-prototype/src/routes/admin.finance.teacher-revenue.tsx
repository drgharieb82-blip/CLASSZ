import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DollarSign, Search, Download, Eye, FileDown, Wallet } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { teacherRevenueRecords, type TeacherRevenueRecord } from "@/lib/platform-finance-mock-data";

export const Route = createFileRoute("/admin/finance/teacher-revenue")({
  component: TeacherRevenuePage,
});

const statusColor: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  suspended: "bg-red-500/10 text-red-600 border-red-300",
  "pending-review": "bg-amber-500/10 text-amber-600 border-amber-300",
};

function TeacherRevenuePage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<TeacherRevenueRecord | null>(null);

  const filtered = teacherRevenueRecords.filter((r) => {
    const matchSearch = !search || r.teacher.toLowerCase().includes(search.toLowerCase()) || r.academy.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashPage
      role="superadmin"
      title="pf.teacherRevenue"
      subtitle="pf.teacherRevenueSubtitle"
      icon={DollarSign}
      actions={
        <Button variant="outline" size="sm" className="rounded-xl"><Download className="me-1.5 h-4 w-4" />{t("pf.export")}</Button>
      }
    >
      <Card className="border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("pf.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9 rounded-xl bg-background" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[170px] rounded-xl"><SelectValue placeholder={t("pf.status")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("pf.all")}</SelectItem>
              <SelectItem value="active">{t("pf.active")}</SelectItem>
              <SelectItem value="suspended">{t("pf.suspended")}</SelectItem>
              <SelectItem value="pending-review">{t("pf.pendingReview")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">{t("pf.teacher")}</TableHead>
                <TableHead className="min-w-[150px]">{t("pf.academy")}</TableHead>
                <TableHead>{t("pf.grossRevenue")}</TableHead>
                <TableHead>{t("pf.platformFee")}</TableHead>
                <TableHead>{t("pf.netRevenue")}</TableHead>
                <TableHead>{t("pf.pendingBalance")}</TableHead>
                <TableHead>{t("pf.paidBalance")}</TableHead>
                <TableHead>{t("pf.refunds")}</TableHead>
                <TableHead>{t("pf.status")}</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="hover:bg-accent/50">
                  <TableCell className="font-medium">{r.teacher}</TableCell>
                  <TableCell className="text-muted-foreground">{r.academy}</TableCell>
                  <TableCell className="font-semibold">${r.grossRevenue.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">${r.platformFee.toLocaleString()}</TableCell>
                  <TableCell className="text-emerald-600 font-medium">${r.netRevenue.toLocaleString()}</TableCell>
                  <TableCell className="text-amber-600">${r.pendingBalance.toLocaleString()}</TableCell>
                  <TableCell>${r.paidBalance.toLocaleString()}</TableCell>
                  <TableCell className="text-rose-500">${r.refunds.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full text-xs", statusColor[r.status])}>
                      {r.status === "pending-review" ? t("pf.pendingReview") : t(`pf.${r.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title={t("pf.viewWallet")} onClick={() => setSelected(r)}><Wallet className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title={t("pf.viewTransactions")}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title={t("pf.exportStatement")}><FileDown className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={10} className="py-8 text-center text-sm text-muted-foreground">{t("pf.noResults")}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t("pf.viewWallet")}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-lg">{selected.teacher}</p>
              <p className="text-muted-foreground">{selected.academy}</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div><span className="text-muted-foreground">{t("pf.grossRevenue")}</span><p className="font-bold">${selected.grossRevenue.toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">{t("pf.platformFee")}</span><p className="font-medium">${selected.platformFee.toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">{t("pf.netRevenue")}</span><p className="font-medium text-emerald-600">${selected.netRevenue.toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">{t("pf.pendingBalance")}</span><p className="font-medium text-amber-600">${selected.pendingBalance.toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">{t("pf.paidBalance")}</span><p className="font-medium">${selected.paidBalance.toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">{t("pf.refunds")}</span><p className="font-medium text-rose-500">${selected.refunds.toLocaleString()}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
