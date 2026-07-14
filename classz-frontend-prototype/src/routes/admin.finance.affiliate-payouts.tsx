import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HandCoins, Search, Download, Check, DollarSign } from "lucide-react";
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
import { affiliatePayouts, type AffiliatePayoutRecord } from "@/lib/platform-finance-mock-data";

export const Route = createFileRoute("/admin/finance/affiliate-payouts")({
  component: AffiliatePayoutsPage,
});

const statusColor: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  pending: "bg-amber-500/10 text-amber-600 border-amber-300",
  paid: "bg-blue-500/10 text-blue-600 border-blue-300",
  suspended: "bg-red-500/10 text-red-600 border-red-300",
};

function AffiliatePayoutsPage() {
  const { t } = useApp();
  const [data, setData] = useState(affiliatePayouts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionDialog, setActionDialog] = useState<{ aff: AffiliatePayoutRecord; action: string } | null>(null);

  const filtered = data.filter((a) => {
    const matchSearch = !search || a.affiliate.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAction = () => {
    if (!actionDialog) return;
    const next = actionDialog.action === "approve" ? "active" : "paid";
    setData((prev) => prev.map((a) =>
      a.id === actionDialog.aff.id
        ? { ...a, status: next as AffiliatePayoutRecord["status"], paid: a.paid + a.pending, pending: 0 }
        : a
    ));
    setActionDialog(null);
  };

  const totalCommission = data.reduce((s, a) => s + a.commission, 0);
  const totalPaid = data.reduce((s, a) => s + a.paid, 0);
  const totalPending = data.reduce((s, a) => s + a.pending, 0);

  return (
    <DashPage
      role="superadmin"
      title="pf.affiliatePayouts"
      subtitle="pf.affiliatePayoutsSubtitle"
      icon={HandCoins}
      actions={<Button variant="outline" size="sm" className="rounded-xl"><Download className="me-1.5 h-4 w-4" />{t("pf.export")}</Button>}
    >
      {/* Summary */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10"><DollarSign className="h-5 w-5 text-emerald-500" /></span>
          <div><p className="text-xl font-bold">${totalCommission.toLocaleString()}</p><p className="text-xs text-muted-foreground">{t("pf.commission")} (Total)</p></div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10"><Check className="h-5 w-5 text-blue-500" /></span>
          <div><p className="text-xl font-bold">${totalPaid.toLocaleString()}</p><p className="text-xs text-muted-foreground">{t("pf.paid")}</p></div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10"><HandCoins className="h-5 w-5 text-amber-500" /></span>
          <div><p className="text-xl font-bold">${totalPending.toLocaleString()}</p><p className="text-xs text-muted-foreground">{t("pf.pending")}</p></div>
        </Card>
      </div>

      <Card className="border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("pf.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9 rounded-xl bg-background" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("pf.all")}</SelectItem>
              <SelectItem value="active">{t("pf.active")}</SelectItem>
              <SelectItem value="pending">{t("pf.pending")}</SelectItem>
              <SelectItem value="paid">{t("pf.paid")}</SelectItem>
              <SelectItem value="suspended">{t("pf.suspended")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">{t("pf.affiliate")}</TableHead>
                <TableHead>{t("pf.clicks")}</TableHead>
                <TableHead>{t("pf.leads")}</TableHead>
                <TableHead>{t("pf.sales")}</TableHead>
                <TableHead>{t("pf.commission")}</TableHead>
                <TableHead>{t("pf.paid")}</TableHead>
                <TableHead>{t("pf.pending")}</TableHead>
                <TableHead>{t("pf.status")}</TableHead>
                <TableHead className="w-[140px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} className="hover:bg-accent/50">
                  <TableCell className="font-medium">{a.affiliate}</TableCell>
                  <TableCell>{a.clicks.toLocaleString()}</TableCell>
                  <TableCell>{a.leads.toLocaleString()}</TableCell>
                  <TableCell>{a.sales}</TableCell>
                  <TableCell className="font-semibold">${a.commission.toLocaleString()}</TableCell>
                  <TableCell className="text-emerald-600">${a.paid.toLocaleString()}</TableCell>
                  <TableCell className="text-amber-600">${a.pending.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline" className={cn("rounded-full text-xs", statusColor[a.status])}>{t(`pf.${a.status}`)}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {a.pending > 0 && a.status !== "suspended" && (
                        <>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setActionDialog({ aff: a, action: "approve" })}>{t("pf.approvePayout")}</Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setActionDialog({ aff: a, action: "mark-paid" })}>{t("pf.markAsPaid")}</Button>
                        </>
                      )}
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
          <DialogHeader><DialogTitle>{actionDialog?.action === "approve" ? t("pf.approvePayout") : t("pf.markAsPaid")}</DialogTitle></DialogHeader>
          {actionDialog && (
            <p className="text-sm text-muted-foreground">
              {actionDialog.action === "approve" ? "Approve" : "Mark as paid"} payout of <strong>${actionDialog.aff.pending.toLocaleString()}</strong> for <strong>{actionDialog.aff.affiliate}</strong>?
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setActionDialog(null)}>{t("team.cancel")}</Button>
            <Button className="rounded-xl gradient-brand border-0 text-white" onClick={handleAction}>{t("team.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
