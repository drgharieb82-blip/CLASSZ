import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus, Search, MoreHorizontal, Copy, Mail, Phone, Eye, Wand2,
  Wifi, WifiOff, X,
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { teamMembers, type TeamMember, builtInRoles } from "@/lib/team-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/team/members")({
  component: MembersPage,
});

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  inactive: "bg-slate-500/10 text-slate-500 border-slate-300",
  suspended: "bg-rose-500/10 text-rose-500 border-rose-300",
};

const courseOptions = ["Advanced Mathematics", "Calculus Masterclass", "Statistics & Probability", "Linear Algebra"];

type AddMemberForm = {
  fullName: string;
  mobile: string;
  email: string;
  role: string;
  assignedCourse: string;
  username: string;
  password: string;
};

function MembersPage() {
  const { t } = useApp();
  const [members, setMembers] = useState<TeamMember[]>(teamMembers);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [profileMember, setProfileMember] = useState<TeamMember | null>(null);

  const filtered = members.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.roles.some((r) => r.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddMember = (form: AddMemberForm) => {
    const nextNumber = members.reduce((max, member) => {
      const number = Number(member.id.replace(/\D/g, ""));
      return Number.isFinite(number) ? Math.max(max, number) : max;
    }, 0) + 1;

    const newMember: TeamMember = {
      id: `TM-${String(nextNumber).padStart(3, "0")}`,
      name: form.fullName.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      username: form.username.trim(),
      roles: [form.role],
      assignedCourses: form.assignedCourse ? [form.assignedCourse] : [],
      status: "active",
      online: true,
      lastActive: "Just now",
      joinedDate: "2026-06-24",
      tasksCompleted: 0,
      revenueShare: { type: "fixed", value: 0 },
    };

    setMembers((current) => [newMember, ...current]);
  };

  return (
    <DashPage role="teacher" title={t("team.members")} subtitle={`${members.length} ${t("team.members").toLowerCase()}`} icon={ROLES.teacher.icon}
      actions={
        <Button className="rounded-xl gradient-brand border-0 text-white" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="me-1.5 h-4 w-4" /> {t("team.addMember")}
        </Button>
      }
    >
      <Card className="border bg-card">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={`${t("common.search")}...`} value={search} onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl bg-background" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">{t("team.fullName")}</TableHead>
                <TableHead>{t("team.role")}</TableHead>
                <TableHead>{t("team.assignedCourses")}</TableHead>
                <TableHead>{t("team.status")}</TableHead>
                <TableHead>{t("team.lastActive")}</TableHead>
                <TableHead className="w-[80px]">{t("team.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setProfileMember(m)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn("absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full border-2 border-card", m.online ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.roles.map((r) => (
                        <Badge key={r} variant="outline" className="rounded-full text-xs">{r}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.assignedCourses.length ? m.assignedCourses.map((c) => (
                        <Badge key={c} className="rounded-full bg-primary/10 text-primary border-0 text-[10px]">{c}</Badge>
                      )) : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full text-xs capitalize", statusColors[m.status])}>
                      {t(`team.${m.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {m.online ? <Wifi className="h-3 w-3 text-emerald-500" /> : <WifiOff className="h-3 w-3" />}
                      {m.lastActive}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); setProfileMember(m); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AddMemberDialog open={addOpen} onOpenChange={setAddOpen} onAddMember={handleAddMember} />
      <MemberProfileSheet member={profileMember} onClose={() => setProfileMember(null)} />
    </DashPage>
  );
}

function AddMemberDialog({ open, onOpenChange, onAddMember }: { open: boolean; onOpenChange: (o: boolean) => void; onAddMember: (form: AddMemberForm) => void }) {
  const { t } = useApp();
  const defaultRole = builtInRoles.find((r) => r !== "Teacher") ?? "Assistant Teacher";
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(defaultRole);
  const [assignedCourse, setAssignedCourse] = useState(courseOptions[0]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const resetForm = () => {
    setFullName("");
    setMobile("");
    setEmail("");
    setRole(defaultRole);
    setAssignedCourse(courseOptions[0]);
    setUsername("");
    setPassword("");
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
    setPassword(Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleSave = () => {
    onAddMember({ fullName, mobile, email, role, assignedCourse, username, password });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("team.addMember")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("team.fullName")}</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ahmed Ali" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("team.mobile")}</Label>
              <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+20 100 000 0000" className="rounded-xl" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("team.email")}</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@academy.com" className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label>{t("team.role")}</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder={t("team.role")} /></SelectTrigger>
              <SelectContent>
                {builtInRoles.filter((r) => r !== "Teacher").map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("team.assignedCourses")}</Label>
            <Select value={assignedCourse} onValueChange={setAssignedCourse}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder={t("team.assignedCourses")} /></SelectTrigger>
              <SelectContent>
                {courseOptions.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("team.username")}</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("team.password")}</Label>
              <div className="flex gap-2">
                <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="rounded-xl flex-1" />
                <Button variant="outline" size="icon" className="shrink-0 rounded-xl" onClick={generatePassword} title={t("team.autoGenerate")}>
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-xl"><Phone className="me-1.5 h-3.5 w-3.5" />{t("team.viaWhatsApp")}</Button>
            <Button variant="outline" size="sm" className="rounded-xl"><Mail className="me-1.5 h-3.5 w-3.5" />{t("team.viaEmail")}</Button>
            <Button variant="outline" size="sm" className="rounded-xl"><Copy className="me-1.5 h-3.5 w-3.5" />{t("team.copyCredentials")}</Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => handleOpenChange(false)}>{t("team.cancel")}</Button>
          <Button className="rounded-xl gradient-brand border-0 text-white" onClick={handleSave} disabled={!fullName.trim() || !email.trim() || !username.trim()}>
            {t("team.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MemberProfileSheet({ member, onClose }: { member: TeamMember | null; onClose: () => void }) {
  const { t } = useApp();
  if (!member) return null;

  const sections = [
    { title: t("team.personalInfo"), items: [
      { label: t("team.fullName"), value: member.name },
      { label: t("team.email"), value: member.email },
      { label: t("team.mobile"), value: member.mobile },
      { label: t("team.username"), value: member.username },
    ]},
    { title: t("team.role"), items: member.roles.map((r) => ({ label: r, value: "" })) },
    { title: t("team.assignedCourses"), items: member.assignedCourses.length ? member.assignedCourses.map((c) => ({ label: c, value: "" })) : [{ label: "—", value: "" }] },
  ];

  return (
    <Sheet open={!!member} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{member.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {member.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-bold">{member.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {member.roles.map((r) => (
                  <Badge key={r} variant="outline" className="rounded-full text-xs">{r}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={cn("h-2 w-2 rounded-full", member.online ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                <span className="text-xs text-muted-foreground">{member.online ? t("team.online") : t("team.offline")} · {member.lastActive}</span>
              </div>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{section.title}</p>
              <Card className="border bg-card divide-y">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    {item.value && <span className="text-sm font-medium">{item.value}</span>}
                  </div>
                ))}
              </Card>
            </div>
          ))}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t("team.revenueShare")}</p>
            <Card className="border bg-card p-4">
              {member.revenueShare ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{member.revenueShare.type}</span>
                  <span className="text-sm font-bold">
                    {member.revenueShare.type === "percentage" ? `${member.revenueShare.value}%` : `EGP ${member.revenueShare.value.toLocaleString()}`}
                  </span>
                </div>
              ) : <span className="text-sm text-muted-foreground">—</span>}
            </Card>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t("team.activityStats")}</p>
            <Card className="border bg-card p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-2xl font-bold">{member.tasksCompleted}</p>
                  <p className="text-xs text-muted-foreground">Tasks completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{member.joinedDate}</p>
                  <p className="text-xs text-muted-foreground">Joined</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
