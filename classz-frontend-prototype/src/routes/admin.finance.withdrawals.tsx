import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownToLine, Search, Download, Check, X, Wallet, FileDown, AlertTriangle } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { platformWithdrawals, type PlatformWithdrawal } from "@/lib/platform-finance-mock-data";

export const Route = createFileRoute("/admin/finance/withdrawals")({
  component: WithdrawalsPage,
});

const statusColor: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-300",
  approved: "bg-blue-500/10 text-blue-600 border-blue-300",
  rejected: "bg-red-500/10 text-red-600 border-red-300",
  paid: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  failed: "bg-slate-500/10 text-slate-600 border-slate-300",
};

const riskColor: Record<string, string> = {
  none: "bg-slate-500/10 text-slate-500 border-slate-300",
  low: "bg-blue-500/10 text-blue-600 border-blue-300",
  medium: "bg-amber-500/10 text-amber-600 border-amber-300",
  high: "bg-red-500/10 text-red-600 border-red-300",
};

function WithdrawalsPage() {
  const { t } = useApp();
  const [data, setData] = useState(platformWithdrawals);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionDialog, setActionDialog] = useState<{ wd: PlatformWithdrawal; action: string } | null>(null);

  const filtered = data.filter((w) => {
    const matchSearch = !search || w.teacher.toLowerCase().includes(search.toLowerCase()) || w.academy.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAction = (action: string) => {
    if (!actionDialog) return;
    const nextStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "mark-paid" ? "paid" : actionDialog.wd.status;
    setData((prev) => prev.map((w) => w.id === actionDialog.wd.id ? { ...w, status: nextStatus as PlatformWithdrawal["status"], approvedBy: "Admin You" } : w));
    setActionDialog(null);
  };

  return (
    <DashPage
      role="superadmin"
      title="pf.withdrawals"
      subtitle="pf.withdrawalsSubtitle"
      icon={ArrowDownToLine}
      actions={<Button variant="outline" size="sm" className="rounded-xl"><Download className="me-1.5 h-4 w-4" />{t("pf.exportPayoutSheet")}</Button>}
    >
      <Card className="border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("pf.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9 rounded-xl bg-background" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] rounded-xl"><SelectValue placeholder={t("pf.status")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("pf.all")}</SelectItem>
              <SelectItem value="pending">{t("pf.pending")}</SelectItem>
              <SelectItem value="approved">{t("pf.approved")}</SelectItem>
              <SelectItem value="rejected">{t("pf.rejected")}</SelectItem>
              <SelectItem value="paid">{t("pf.paid")}</SelectItem>
              <SelectItem value="failed">{t("pf.failed")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">{t("pf.teacher")}</TableHead>
                <TableHead className="min-w-[150px]">{t("pf.academy")}</TableHead>
                <TableHead>{t("pf.amount")}</TableHead>
                <TableHead>{t("pf.method")}</TableHead>
                <TableHead>{t("pf.requestedAt")}</TableHead>
                <TableHead>{t("pf.status")}</TableHead>
                <TableHead>{t("pf.riskFlag")}</TableHead>
                <TableHead>{t("pf.approvedBy")}</TableHead>
                <TableHead className="w-[140px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((w) => (
                <TableRow key={w.id} className="hover:bg-accent/50">
                  <TableCell className="font-medium">{w.teacher}</TableCell>
                  <TableCell className="text-muted-foreground">{w.academy}</TableCell>
                  <TableCell className="font-semibold">${w.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{w.method}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{w.requestedAt}</TableCell>
                  <TableCell><Badge variant="outline" className={cn("rounded-full text-xs", statusColor[w.status])}>{t(`pf.${w.status}`)}</Badge></TableCell>
                  <TableCell>
                    {w.riskFlag !== "none" ? (
                      <Badge variant="outline" className={cn("rounded-full text-xs", riskColor[w.riskFlag])}>
                        <AlertTriangle className="me-1 h-3 w-3" />{t(`pf.${w.riskFlag}`)}
                      </Badge>
                    ) : <span className="text-xs text-muted-foreground">{t("pf.none")}</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{w.approvedBy}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {w.status === "pending" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" onClick={() => setActionDialog({ wd: w, action: "approve" })}><Check className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setActionDialog({ wd: w, action: "reject" })}><X className="h-3.5 w-3.5" /></Button>
                        </>
                      )}
                      {w.status === "approved" && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setActionDialog({ wd: w, action: "mark-paid" })}>{t("pf.markAsPaid")}</Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Wallet className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">{t("pf.noResults")}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{actionDialog?.action === "approve" ? t("pf.approve") : actionDialog?.action === "reject" ? t("pf.reject") : t("pf.markAsPaid")}</DialogTitle></DialogHeader>
          {actionDialog && (
            <p className="text-sm text-muted-foreground">
              {actionDialog.action === "approve" ? "Approve" : actionDialog.action === "reject" ? "Reject" : "Mark as paid"} withdrawal of <strong>${actionDialog.wd.amount.toLocaleString()}</strong> for <strong>{actionDialog.wd.teacher}</strong>?
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setActionDialog(null)}>{t("team.cancel")}</Button>
            <Button className="rounded-xl gradient-brand border-0 text-white" onClick={() => handleAction(actionDialog?.action ?? "")}>{t("team.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
