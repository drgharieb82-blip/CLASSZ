import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Search, ShieldCheck, ShieldOff } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { adminUsers } from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/admin-users")({
  component: AdminUsersPage,
});

const roleStyles: Record<string, string> = {
  "Super Admin": "bg-violet-500/10 text-violet-600 border-violet-300",
  "Support Lead": "bg-blue-500/10 text-blue-600 border-blue-300",
  "Finance Admin": "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  "Content Admin": "bg-pink-500/10 text-pink-600 border-pink-300",
  Developer: "bg-slate-500/10 text-slate-600 border-slate-300",
  "Support Agent": "bg-cyan-500/10 text-cyan-600 border-cyan-300",
};

const statusStyles: Record<string, { cls: string; label: string }> = {
  active: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300", label: "Active" },
  inactive: { cls: "bg-slate-500/10 text-slate-600 border-slate-300", label: "Inactive" },
};

const allRoles = [...new Set(adminUsers.map((u) => u.role))];

function AdminUsersPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = adminUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const activeCount = adminUsers.filter((u) => u.status === "active").length;
  const with2FA = adminUsers.filter((u) => u.twoFactor).length;

  return (
    <DashPage role="superadmin" title="sa.adminUsers" subtitle="sa.adminUsersSubtitle" icon={Users}>
      {/* Summary cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="border bg-card p-4">
          <p className="text-2xl font-bold">{adminUsers.length}</p>
          <p className="text-xs text-muted-foreground">{t("adm.totalAdmins")}</p>
        </Card>
        <Card className="border bg-card p-4">
          <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          <p className="text-xs text-muted-foreground">{t("adm.activeAdmins")}</p>
        </Card>
        <Card className="border bg-card p-4">
          <p className="text-2xl font-bold">{allRoles.length}</p>
          <p className="text-xs text-muted-foreground">{t("adm.roles")}</p>
        </Card>
        <Card className="border bg-card p-4">
          <p className="text-2xl font-bold text-blue-600">{with2FA}</p>
          <p className="text-xs text-muted-foreground">{t("adm.with2FA")}</p>
        </Card>
      </div>

      {/* Filters + Table */}
      <Card className="border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("adm.searchAdmins")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder={t("adm.allRoles")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("adm.allRoles")}</SelectItem>
              {allRoles.map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase tracking-wider">
                <TableHead className="font-medium">{t("adm.name")}</TableHead>
                <TableHead className="font-medium">{t("adm.email")}</TableHead>
                <TableHead className="font-medium">{t("adm.role")}</TableHead>
                <TableHead className="font-medium">{t("adm.lastLogin")}</TableHead>
                <TableHead className="font-medium">{t("adm.status")}</TableHead>
                <TableHead className="font-medium text-center">{t("adm.twoFactor")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t("adm.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id} className="transition-colors hover:bg-accent/40">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs font-bold">
                          {u.name.charAt(0)}
                        </span>
                        <span className="text-sm font-medium">{u.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs rounded-full", roleStyles[u.role] ?? "bg-muted text-muted-foreground")}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.lastLogin}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs rounded-full capitalize", statusStyles[u.status]?.cls)}>
                        {statusStyles[u.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {u.twoFactor ? (
                        <Badge variant="outline" className="text-[10px] rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-300 gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          {t("adm.enabled")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] rounded-full bg-rose-500/10 text-rose-600 border-rose-300 gap-1">
                          <ShieldOff className="h-3 w-3" />
                          {t("adm.disabled")}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
          <span>{t("sa.showing")} {filtered.length} {t("sa.of")} {adminUsers.length}</span>
        </div>
      </Card>
    </DashPage>
  );
}
