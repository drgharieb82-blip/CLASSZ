import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Banknote, ArrowUpRight, Clock, CheckCircle, Search, Plus,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { payouts } from "@/lib/business-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/business/payouts")({
  component: PayoutsPage,
});

const statusConfig: Record<string, { label: string; color: string }> = {
  completed: { label: "Completed", color: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
  processing: { label: "Processing", color: "bg-blue-500/10 text-blue-600 border-blue-300" },
  pending: { label: "Pending", color: "bg-amber-500/10 text-amber-600 border-amber-300" },
  rejected: { label: "Rejected", color: "bg-rose-500/10 text-rose-600 border-rose-300" },
};

function PayoutsPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalWithdrawn = payouts.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const totalProcessing = payouts.filter((p) => p.status === "processing").reduce((s, p) => s + p.amount, 0);
  const totalPending = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  const filtered = payouts.filter(
    (p) => p.method.toLowerCase().includes(search.toLowerCase()) || p.accountInfo.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashPage
      role="teacher"
      title={t("biz.payouts")}
      subtitle={`${payouts.length} payout records`}
      icon={ROLES.teacher.icon}
      actions={
        <Button className="rounded-xl gradient-brand border-0 text-white" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="me-1.5 h-4 w-4" /> Request Payout
        </Button>
      }
    >
      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">${totalWithdrawn.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Withdrawn</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10">
            <ArrowUpRight className="h-5 w-5 text-blue-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">${totalProcessing.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Processing</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10">
            <Clock className="h-5 w-5 text-amber-500" />
          </span>
          <div>
            <p className="text-2xl font-bold">${totalPending.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="border bg-card">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search payouts..." value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9 rounded-xl bg-background" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Account Info</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Processed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => {
                const cfg = statusConfig[row.status];
                return (
                  <TableRow key={row.id} className="hover:bg-accent/50">
                    <TableCell>
                      <span className="font-semibold text-sm">${row.amount.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{row.method}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{row.accountInfo}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{row.requestedAt}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{row.processedAt || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full border text-xs", cfg.color)}>{cfg.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Request Payout dialog */}
      <RequestPayoutDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </DashPage>
  );
}

function RequestPayoutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useApp();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Payout</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Amount ($)</Label>
            <Input type="number" placeholder="0.00" min={0} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label>Method</Label>
            <Select>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                <SelectItem value="vodafone-cash">Vodafone Cash</SelectItem>
                <SelectItem value="instapay">InstaPay</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Account Info</Label>
            <Input placeholder="Account number, phone, or email" className="rounded-xl" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="rounded-xl gradient-brand border-0 text-white" onClick={() => onOpenChange(false)}>
            <ArrowUpRight className="me-1.5 h-4 w-4" /> Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
