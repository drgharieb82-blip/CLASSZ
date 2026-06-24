import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, Plus, Mail, Phone, RotateCcw, Ban, Clock,
  CheckCircle2, XCircle, Send,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { invitations, builtInRoles } from "@/lib/team-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/team/invitations")({
  component: InvitationsPage,
});

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  pending: { color: "bg-amber-500/10 text-amber-600 border-amber-300", icon: Clock },
  accepted: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-300", icon: CheckCircle2 },
  expired: { color: "bg-slate-500/10 text-slate-500 border-slate-300", icon: XCircle },
  revoked: { color: "bg-rose-500/10 text-rose-500 border-rose-300", icon: Ban },
};

const deliveryIcon: Record<string, typeof Mail> = {
  email: Mail,
  whatsapp: Phone,
  both: Send,
};

function InvitationsPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);

  const filtered = invitations.filter((inv) => {
    const matchSearch = inv.name.toLowerCase().includes(search.toLowerCase()) || inv.role.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    pending: invitations.filter((i) => i.status === "pending").length,
    accepted: invitations.filter((i) => i.status === "accepted").length,
    expired: invitations.filter((i) => i.status === "expired").length,
    revoked: invitations.filter((i) => i.status === "revoked").length,
  };

  return (
    <DashPage role="teacher" title={t("team.invitations")} subtitle={`${invitations.length} invitations`} icon={ROLES.teacher.icon}
      actions={
        <Button className="rounded-xl gradient-brand border-0 text-white" size="sm" onClick={() => setInviteOpen(true)}>
          <Plus className="me-1.5 h-4 w-4" /> Send Invitation
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-4">
        {(Object.entries(counts) as [keyof typeof statusConfig, number][]).map(([status, count]) => {
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          return (
            <Card key={status} className={cn("flex items-center gap-3 border bg-card p-3 cursor-pointer transition-shadow hover:shadow-md", statusFilter === status && "ring-2 ring-primary")}
              onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}>
              <span className={cn("grid h-9 w-9 place-items-center rounded-lg", cfg.color.split(" ")[0])}>
                <Icon className={cn("h-4 w-4", cfg.color.split(" ")[1])} />
              </span>
              <div>
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground capitalize">{t(`team.${status}`)}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="border bg-card">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={`${t("common.search")}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9 rounded-xl bg-background" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("team.all")}</SelectItem>
              <SelectItem value="pending">{t("team.pending")}</SelectItem>
              <SelectItem value="accepted">{t("team.accepted")}</SelectItem>
              <SelectItem value="expired">{t("team.expired")}</SelectItem>
              <SelectItem value="revoked">{t("team.revoked")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">{t("team.fullName")}</TableHead>
                <TableHead>{t("team.email")} / WhatsApp</TableHead>
                <TableHead>{t("team.role")}</TableHead>
                <TableHead>{t("team.status")}</TableHead>
                <TableHead>{t("team.sentDate")}</TableHead>
                <TableHead>{t("team.expiryDate")}</TableHead>
                <TableHead className="w-[120px]">{t("team.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => {
                const cfg = statusConfig[inv.status];
                const Icon = cfg.icon;
                const DeliveryIcon = deliveryIcon[inv.deliveryMethod] || Mail;
                return (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {inv.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{inv.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Mail className="h-3 w-3 text-muted-foreground" /> {inv.email}
                        </div>
                        {inv.whatsapp && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" /> {inv.whatsapp}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full text-xs">{inv.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full text-xs capitalize", cfg.color)}>
                        <Icon className="me-1 h-3 w-3" /> {t(`team.${inv.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">{inv.sentDate}</span></TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">{inv.expiryDate}</span></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {inv.status === "pending" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title={t("team.resend")}>
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-rose-500" title={t("team.revoke")}>
                              <Ban className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {inv.status === "expired" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title={t("team.resend")}>
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <SendInvitationDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </DashPage>
  );
}

function SendInvitationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useApp();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Invitation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{t("team.fullName")}</Label>
            <Input placeholder="Name of the invitee" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("team.email")}</Label>
              <Input type="email" placeholder="email@example.com" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp</Label>
              <Input placeholder="+20 100 000 0000" className="rounded-xl" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("team.role")}</Label>
            <Select>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder={t("team.role")} /></SelectTrigger>
              <SelectContent>
                {builtInRoles.filter((r) => r !== "Teacher").map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Delivery Method</Label>
            <Select>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">{t("team.viaEmail")}</SelectItem>
                <SelectItem value="whatsapp">{t("team.viaWhatsApp")}</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>{t("team.cancel")}</Button>
          <Button className="rounded-xl gradient-brand border-0 text-white" onClick={() => onOpenChange(false)}>
            <Send className="me-1.5 h-4 w-4" /> Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
