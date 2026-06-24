import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search, Eye, UserPlus, Star, Phone, Video, FileText, MessageSquare,
  CheckCircle2, XCircle, ArrowRight, Wand2, Copy, Mail,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { applications, type Application, type TeamMember, teamMembers, builtInRoles } from "@/lib/team-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/team/applications")({
  component: ApplicationsPage,
});

const statusConfig: Record<string, { color: string; label: string }> = {
  new: { color: "bg-blue-500/10 text-blue-600 border-blue-300", label: "team.new" },
  shortlisted: { color: "bg-amber-500/10 text-amber-600 border-amber-300", label: "team.shortlisted" },
  interview: { color: "bg-violet-500/10 text-violet-600 border-violet-300", label: "team.interview" },
  accepted: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-300", label: "team.accepted" },
  rejected: { color: "bg-rose-500/10 text-rose-500 border-rose-300", label: "team.rejected" },
};

const courseOptions = ["Advanced Mathematics", "Calculus Masterclass", "Statistics & Probability", "Linear Algebra"];

type ApplicationRow = Application & {
  accountCreated?: boolean;
  createdMemberId?: string;
};

type CreateAccountForm = {
  username: string;
  password: string;
  role: string;
  assignedCourse: string;
  compensationType: string;
  amount: string;
};

function ApplicationsPage() {
  const { t } = useApp();
  const [applicationRows, setApplicationRows] = useState<ApplicationRow[]>(applications);
  const [createdMembers, setCreatedMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);
  const [accountApplication, setAccountApplication] = useState<ApplicationRow | null>(null);
  const [createAccountOpen, setCreateAccountOpen] = useState(false);

  const filtered = applicationRows.filter((a) => {
    const matchSearch = a.applicantName.toLowerCase().includes(search.toLowerCase()) || a.position.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    new: applicationRows.filter((a) => a.status === "new").length,
    shortlisted: applicationRows.filter((a) => a.status === "shortlisted").length,
    interview: applicationRows.filter((a) => a.status === "interview").length,
    accepted: applicationRows.filter((a) => a.status === "accepted").length,
    rejected: applicationRows.filter((a) => a.status === "rejected").length,
  };

  const handleCreateAccount = (form: CreateAccountForm) => {
    if (!accountApplication) return;

    const nextNumber = [...teamMembers, ...createdMembers].reduce((max, member) => {
      const number = Number(member.id.replace(/\D/g, ""));
      return Number.isFinite(number) ? Math.max(max, number) : max;
    }, 0) + 1;
    const createdMemberId = `TM-${String(nextNumber).padStart(3, "0")}`;
    const newMember: TeamMember = {
      id: createdMemberId,
      name: accountApplication.applicantName,
      email: accountApplication.email,
      mobile: accountApplication.whatsapp,
      username: form.username.trim(),
      roles: [form.role],
      assignedCourses: form.assignedCourse ? [form.assignedCourse] : [],
      status: "active",
      online: true,
      lastActive: "Just now",
      joinedDate: "2026-06-24",
      tasksCompleted: 0,
      revenueShare: { type: form.compensationType, value: Number(form.amount) || 0 },
    };

    setCreatedMembers((current) => [newMember, ...current]);
    setApplicationRows((current) =>
      current.map((app) =>
        app.id === accountApplication.id
          ? {
              ...app,
              status: "accepted",
              accountCreated: true,
              createdMemberId,
              notes: app.notes.includes("Account created.") ? app.notes : `${app.notes ? `${app.notes} ` : ""}Account created.`,
            }
          : app
      )
    );
    setAccountApplication(null);
    setCreateAccountOpen(false);
  };

  return (
    <DashPage role="teacher" title={t("team.applications")} subtitle={`${applicationRows.length} applications`} icon={ROLES.teacher.icon}>
      <div className="grid gap-3 sm:grid-cols-5">
        {Object.entries(counts).map(([status, count]) => {
          const cfg = statusConfig[status];
          return (
            <Card key={status} className={cn("flex items-center gap-3 border bg-card p-3 cursor-pointer transition-shadow hover:shadow-md", statusFilter === status && "ring-2 ring-primary")}
              onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}>
              <Badge variant="outline" className={cn("rounded-full text-xs px-2 py-0.5", cfg.color)}>{count}</Badge>
              <span className="text-sm font-medium capitalize">{t(cfg.label)}</span>
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
            <SelectTrigger className="w-[160px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("team.all")}</SelectItem>
              {Object.entries(statusConfig).map(([k, v]) => (
                <SelectItem key={k} value={k}>{t(v.label)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">{t("team.applicantName")}</TableHead>
                <TableHead>{t("team.position")}</TableHead>
                <TableHead>{t("team.experience")}</TableHead>
                <TableHead>{t("team.status")}</TableHead>
                <TableHead>{t("team.evaluationScore")}</TableHead>
                <TableHead>{t("team.submittedDate")}</TableHead>
                <TableHead className="w-[80px]">{t("team.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((app) => {
                const cfg = statusConfig[app.status];
                return (
                  <TableRow key={app.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setSelectedApp(app)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {app.applicantName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{app.applicantName}</p>
                          <p className="text-xs text-muted-foreground">{app.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm">{app.position}</span></TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">{app.experience}</span></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className={cn("rounded-full text-xs capitalize", cfg.color)}>{t(cfg.label)}</Badge>
                        {app.accountCreated && (
                          <Badge variant="outline" className="rounded-full border-emerald-300 bg-emerald-500/10 text-xs text-emerald-600">
                            {t("team.accountCreated")}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {app.evaluationScore > 0 ? (
                        <div className="flex items-center gap-2">
                          <Progress value={app.evaluationScore} className="h-1.5 w-16" />
                          <span className="text-xs font-medium">{app.evaluationScore}%</span>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">{app.submittedDate}</span></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ApplicantSheet
        app={selectedApp}
        onClose={() => setSelectedApp(null)}
        onCreateAccount={(app) => {
          setAccountApplication(app);
          setSelectedApp(null);
          setCreateAccountOpen(true);
        }}
      />
      <CreateAccountDialog app={accountApplication} open={createAccountOpen} onOpenChange={setCreateAccountOpen} onCreateAccount={handleCreateAccount} />
    </DashPage>
  );
}

function ApplicantSheet({ app, onClose, onCreateAccount }: { app: ApplicationRow | null; onClose: () => void; onCreateAccount: (app: ApplicationRow) => void }) {
  const { t } = useApp();
  if (!app) return null;
  const cfg = statusConfig[app.status];

  return (
    <Sheet open={!!app} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{app.applicantName}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {app.applicantName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-bold">{app.applicantName}</p>
              <p className="text-sm text-muted-foreground">{app.position}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge variant="outline" className={cn("rounded-full text-xs capitalize", cfg.color)}>{t(cfg.label)}</Badge>
                {app.accountCreated && (
                  <Badge variant="outline" className="rounded-full border-emerald-300 bg-emerald-500/10 text-xs text-emerald-600">
                    {t("team.accountCreated")}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Card className="border bg-card divide-y">
            {[
              { icon: Mail, label: t("team.email"), value: app.email },
              { icon: Phone, label: "WhatsApp", value: app.whatsapp },
              { icon: MessageSquare, label: "Telegram", value: app.telegram },
              { icon: FileText, label: t("team.experience"), value: app.experience },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-4 py-3">
                <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="flex items-center gap-2 border bg-card p-3 cursor-pointer hover:bg-accent">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{t("team.cv")}</span>
            </Card>
            <Card className="flex items-center gap-2 border bg-card p-3 cursor-pointer hover:bg-accent">
              <Video className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{t("team.introVideo")}</span>
            </Card>
          </div>

          {app.evaluationScore > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t("team.evaluationScore")}</p>
              <div className="flex items-center gap-3">
                <Progress value={app.evaluationScore} className="h-2 flex-1" />
                <span className="text-lg font-bold">{app.evaluationScore}%</span>
              </div>
            </div>
          )}

          {app.notes && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t("team.notes")}</p>
              <Card className="border bg-card p-3">
                <p className="text-sm text-muted-foreground">{app.notes}</p>
              </Card>
            </div>
          )}

          <Separator />

          <div className="flex flex-wrap gap-2">
            {app.status !== "rejected" && (
              <Button variant="outline" size="sm" className="rounded-xl border-rose-300 text-rose-500 hover:bg-rose-500/10">
                <XCircle className="me-1.5 h-3.5 w-3.5" /> {t("team.reject")}
              </Button>
            )}
            {app.status === "new" && (
              <Button variant="outline" size="sm" className="rounded-xl">
                <Star className="me-1.5 h-3.5 w-3.5" /> {t("team.shortlist")}
              </Button>
            )}
            {(app.status === "new" || app.status === "shortlisted") && (
              <Button variant="outline" size="sm" className="rounded-xl">
                <ArrowRight className="me-1.5 h-3.5 w-3.5" /> {t("team.moveToInterview")}
              </Button>
            )}
            {app.status !== "accepted" && app.status !== "rejected" && (
              <Button size="sm" className="rounded-xl gradient-brand border-0 text-white">
                <CheckCircle2 className="me-1.5 h-3.5 w-3.5" /> {t("team.accept")}
              </Button>
            )}
            {app.status === "accepted" && !app.accountCreated && (
              <Button size="sm" className="rounded-xl gradient-brand border-0 text-white" onClick={() => onCreateAccount(app)}>
                <UserPlus className="me-1.5 h-3.5 w-3.5" /> {t("team.createAccount")}
              </Button>
            )}
            {app.accountCreated && (
              <Badge variant="outline" className="rounded-full border-emerald-300 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600">
                <CheckCircle2 className="me-1.5 h-3.5 w-3.5" /> {t("team.accountCreated")}
              </Badge>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function inferRoleFromPosition(position: string) {
  const normalized = position.toLowerCase();
  if (normalized.includes("content")) return "Content Manager";
  if (normalized.includes("moderator")) return "Moderator";
  if (normalized.includes("support")) return "Moderator";
  if (normalized.includes("developer")) return "Developer";
  return "Assistant Teacher";
}

function toUsername(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
}

function CreateAccountDialog({
  app,
  open,
  onOpenChange,
  onCreateAccount,
}: {
  app: ApplicationRow | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreateAccount: (form: CreateAccountForm) => void;
}) {
  const { t } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("Assistant Teacher");
  const [assignedCourse, setAssignedCourse] = useState(courseOptions[0]);
  const [compensationType, setCompensationType] = useState("fixed");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!app || !open) return;
    setUsername(toUsername(app.applicantName));
    setRole(inferRoleFromPosition(app.position));
    setAssignedCourse(courseOptions[0]);
    setCompensationType("fixed");
    setAmount("");
    setPassword("");
  }, [app, open]);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setRole("Assistant Teacher");
    setAssignedCourse(courseOptions[0]);
    setCompensationType("fixed");
    setAmount("");
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
    onCreateAccount({ username, password, role, assignedCourse, compensationType, amount });
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("team.createAccount")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("team.username")}</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("team.password")}</Label>
              <div className="flex gap-2">
                <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="rounded-xl flex-1" />
                <Button variant="outline" size="icon" className="shrink-0 rounded-xl" onClick={generatePassword}>
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {courseOptions.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("team.revenueShare")}</Label>
            <div className="grid grid-cols-2 gap-3">
              <Select value={compensationType} onValueChange={setCompensationType}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder={t("team.compensationType")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">{t("team.fixedSalary")}</SelectItem>
                  <SelectItem value="percentage">{t("team.percentageShare")}</SelectItem>
                  <SelectItem value="per-task">{t("team.perTask")}</SelectItem>
                  <SelectItem value="per-graded">{t("team.perGraded")}</SelectItem>
                </SelectContent>
              </Select>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t("team.amount")} className="rounded-xl" />
            </div>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-xl"><Phone className="me-1.5 h-3.5 w-3.5" />{t("team.viaWhatsApp")}</Button>
            <Button variant="outline" size="sm" className="rounded-xl"><Mail className="me-1.5 h-3.5 w-3.5" />{t("team.viaEmail")}</Button>
            <Button variant="outline" size="sm" className="rounded-xl"><Copy className="me-1.5 h-3.5 w-3.5" />{t("team.copyCredentials")}</Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => handleOpenChange(false)}>{t("team.cancel")}</Button>
          <Button className="rounded-xl gradient-brand border-0 text-white" onClick={handleSave} disabled={!app || !username.trim() || !role}>
            {t("team.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
