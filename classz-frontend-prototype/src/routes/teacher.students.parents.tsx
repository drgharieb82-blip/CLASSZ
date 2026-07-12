import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  HeartHandshake, Search, Phone, Mail, Bell, Users, AlertTriangle, Clock, Plus,
} from "lucide-react";
import { toast } from "sonner";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { useTeacherStudentsStore, useLoadTeacherStudentsData, getMergedStudents, relativeTime } from "@/lib/teacher/teacher-students-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/students/parents")({
  component: ParentCenterPage,
});

const alertColorMap: Record<string, string> = {
  none: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
  sent: "border-amber-300 text-amber-600 bg-amber-500/10",
  urgent: "border-rose-300 text-rose-600 bg-rose-500/10",
};

const alertLabelMap: Record<string, string> = {
  none: "No Alert",
  sent: "Alert Sent",
  urgent: "Urgent",
};

function ParentCenterPage() {
  const { t } = useApp();
  useLoadTeacherStudentsData();
  const parentRecords = useTeacherStudentsStore((s) => s.parents);
  const roster = useTeacherStudentsStore((s) => s.roster);
  const progress = useTeacherStudentsStore((s) => s.progress);
  const atRisk = useTeacherStudentsStore((s) => s.atRisk);
  const transactions = useTeacherStudentsStore((s) => s.transactions);
  const addParentContact = useTeacherStudentsStore((s) => s.addParentContact);
  const updateParentContact = useTeacherStudentsStore((s) => s.updateParentContact);
  const students = useMemo(() => getMergedStudents(), [roster, progress, atRisk, parentRecords, transactions]);

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newStudentId, setNewStudentId] = useState("");
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const filtered = useMemo(() => {
    if (!search) return parentRecords;
    const q = search.toLowerCase();
    return parentRecords.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.student_name.toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q)
    );
  }, [parentRecords, search]);

  const totalParents = parentRecords.length;
  const urgentCount = parentRecords.filter((p) => p.alert_status === "urgent").length;
  const sentCount = parentRecords.filter((p) => p.alert_status === "sent").length;
  const neverContacted = parentRecords.filter((p) => !p.last_contact_at).length;

  const handleCreate = async () => {
    if (!newStudentId || !newName.trim() || !newRelation.trim()) return;
    try {
      await addParentContact({ studentId: newStudentId, name: newName.trim(), relation: newRelation.trim(), phone: newPhone || undefined, whatsapp: newPhone || undefined });
      setNewName(""); setNewRelation(""); setNewPhone(""); setNewStudentId(""); setShowCreate(false);
      toast.success("Parent contact added");
    } catch {
      toast.error("Could not add parent contact");
    }
  };

  const notify = async (contactId: string) => {
    try {
      await updateParentContact(contactId, { alert_status: "sent", last_contact_at: new Date().toISOString() });
      toast.success("Parent notified");
    } catch {
      toast.error("Could not notify parent");
    }
  };

  return (
    <DashPage
      role="teacher"
      title={t("stu.parents")}
      subtitle="Communicate with parents and track alerts"
      icon={ROLES.teacher.icon}
      actions={
        <Button className="rounded-xl gradient-brand text-white gap-1.5" onClick={() => setShowCreate((v) => !v)}>
          <Plus className="h-4 w-4" /> Add Contact
        </Button>
      }
    >
      {showCreate && (
        <Card className="border bg-card p-4 flex flex-wrap items-center gap-3">
          <Select value={newStudentId} onValueChange={setNewStudentId}>
            <SelectTrigger className="w-[220px] rounded-xl"><SelectValue placeholder="Student" /></SelectTrigger>
            <SelectContent>
              {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Parent name" value={newName} onChange={(e) => setNewName(e.target.value)} className="rounded-xl w-[180px]" />
          <Input placeholder="Relation (e.g. Mother)" value={newRelation} onChange={(e) => setNewRelation(e.target.value)} className="rounded-xl w-[160px]" />
          <Input placeholder="Phone / WhatsApp" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="rounded-xl w-[160px]" />
          <Button className="rounded-xl gradient-brand text-white" onClick={handleCreate}>Save</Button>
        </Card>
      )}

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10">
            <Users className="h-5 w-5 text-blue-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{totalParents}</p>
            <p className="text-xs text-muted-foreground">Total Parents</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </span>
          <div>
            <p className="text-2xl font-bold text-rose-500">{urgentCount}</p>
            <p className="text-xs text-muted-foreground">Urgent Alerts</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10">
            <Bell className="h-5 w-5 text-amber-400" />
          </span>
          <div>
            <p className="text-2xl font-bold text-amber-500">{sentCount}</p>
            <p className="text-xs text-muted-foreground">Alerts Sent</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-500/10">
            <Clock className="h-5 w-5 text-slate-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{neverContacted}</p>
            <p className="text-xs text-muted-foreground">Never Contacted</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="border bg-card overflow-hidden">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parent name, student, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl"
            />
          </div>
          <Badge variant="outline" className="rounded-full">{filtered.length} parents</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">{t("stu.parentName")}</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>{t("stu.relation")}</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>{t("stu.lastContact")}</TableHead>
                <TableHead>{t("stu.alertStatus")}</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((parent) => (
                <TableRow key={parent.id} className="hover:bg-accent/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {parent.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{parent.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{parent.student_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full text-xs">{parent.relation}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3 text-emerald-500" /> {parent.phone || parent.whatsapp || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" /> {parent.email || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{relativeTime(parent.last_contact_at)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full text-xs", alertColorMap[parent.alert_status])}>
                      {alertLabelMap[parent.alert_status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title={t("stu.notifyParent")} onClick={() => notify(parent.id)}>
                      <Bell className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <HeartHandshake className="h-8 w-8" />
                      <p className="text-sm">No parents found</p>
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
