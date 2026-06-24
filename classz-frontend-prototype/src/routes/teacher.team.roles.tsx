import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Check, X, Shield, Edit2 } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { permissionMatrix, builtInRoles, teamMembers } from "@/lib/team-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/team/roles")({
  component: RolesPage,
});

const roleColors: Record<string, string> = {
  Teacher: "bg-blue-500/10 text-blue-600",
  "Assistant Teacher": "bg-emerald-500/10 text-emerald-600",
  "Content Manager": "bg-violet-500/10 text-violet-600",
  Moderator: "bg-amber-500/10 text-amber-600",
  Finance: "bg-pink-500/10 text-pink-600",
  Developer: "bg-slate-500/10 text-slate-600",
  Admin: "bg-rose-500/10 text-rose-600",
};

function RolesPage() {
  const { t } = useApp();
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const permissions = Object.keys(permissionMatrix);
  const roles = [...builtInRoles];

  const roleMemberCounts = roles.reduce<Record<string, number>>((acc, role) => {
    acc[role] = teamMembers.filter((m) => m.roles.includes(role)).length;
    return acc;
  }, {});

  return (
    <DashPage role="teacher" title={t("team.roles")} subtitle={t("team.permissionMatrix")} icon={ROLES.teacher.icon}
      actions={
        <Button className="rounded-xl gradient-brand border-0 text-white" size="sm" onClick={() => setAddRoleOpen(true)}>
          <Plus className="me-1.5 h-4 w-4" /> {t("team.customRole")}
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {roles.map((role) => (
          <Card key={role} className="flex items-center gap-3 border bg-card p-3">
            <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", roleColors[role] || "bg-primary/10 text-primary")}>
              <Shield className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{role}</p>
              <p className="text-xs text-muted-foreground">{roleMemberCounts[role] || 0} members</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border bg-card overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">{t("team.permissionMatrix")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Configure what each role can access</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground min-w-[200px] sticky start-0 bg-muted/30 z-10">
                  {t("team.permissions")}
                </th>
                {roles.map((role) => (
                  <th key={role} className="px-3 py-3 text-center min-w-[100px]">
                    <div className="flex flex-col items-center gap-1">
                      <Badge className={cn("rounded-full border-0 text-[10px] px-2", roleColors[role] || "bg-primary/10 text-primary")}>{role}</Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, i) => (
                <tr key={perm} className={cn("border-b transition-colors hover:bg-accent/30", i % 2 === 0 && "bg-muted/10")}>
                  <td className="px-4 py-3 font-medium sticky start-0 bg-inherit z-10">
                    {perm}
                  </td>
                  {roles.map((role) => {
                    const allowed = permissionMatrix[perm]?.[role] ?? false;
                    return (
                      <td key={role} className="px-3 py-3 text-center">
                        <button className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                          allowed ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : "bg-muted/50 text-muted-foreground/40 hover:bg-muted"
                        )}>
                          {allowed ? <Check className="h-4 w-4" /> : <X className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="border bg-card p-5">
        <h3 className="font-semibold mb-3">Members by Role</h3>
        <div className="space-y-3">
          {roles.filter((r) => (roleMemberCounts[r] || 0) > 0).map((role) => {
            const members = teamMembers.filter((m) => m.roles.includes(role));
            return (
              <div key={role} className="flex items-center gap-3 rounded-xl border p-3">
                <Badge className={cn("rounded-full border-0 text-xs px-2.5 py-0.5 shrink-0", roleColors[role] || "bg-primary/10 text-primary")}>{role}</Badge>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {members.map((m) => (
                    <span key={m.id} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{m.name}</span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{members.length} members</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Dialog open={addRoleOpen} onOpenChange={setAddRoleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("team.customRole")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Role Name</Label>
              <Input placeholder="e.g. Video Editor" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input placeholder="Brief description of this role" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>{t("team.permissions")}</Label>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {permissions.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{perm}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setAddRoleOpen(false)}>{t("team.cancel")}</Button>
            <Button className="rounded-xl gradient-brand border-0 text-white" onClick={() => setAddRoleOpen(false)}>{t("team.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
