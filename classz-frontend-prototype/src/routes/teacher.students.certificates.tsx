import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  GraduationCap, Search, Download, XCircle, Award, Clock,
  CheckCircle2, AlertTriangle,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { studentCertificates } from "@/lib/students-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/students/certificates")({
  component: CertificatesPage,
});

const statusColorMap: Record<string, string> = {
  issued: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
  pending: "border-amber-300 text-amber-600 bg-amber-500/10",
  revoked: "border-rose-300 text-rose-600 bg-rose-500/10",
};

const statusIconMap: Record<string, typeof CheckCircle2> = {
  issued: CheckCircle2,
  pending: Clock,
  revoked: XCircle,
};

function CertificatesPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return studentCertificates;
    const q = search.toLowerCase();
    return studentCertificates.filter(
      (c) =>
        c.studentName.toLowerCase().includes(q) ||
        c.course.toLowerCase().includes(q) ||
        c.certificateTitle.toLowerCase().includes(q)
    );
  }, [search]);

  const issuedCount = studentCertificates.filter((c) => c.status === "issued").length;
  const pendingCount = studentCertificates.filter((c) => c.status === "pending").length;
  const revokedCount = studentCertificates.filter((c) => c.status === "revoked").length;

  return (
    <DashPage role="teacher" title={t("stu.certificates")} subtitle="Manage and track student certificates and achievements" icon={ROLES.teacher.icon}>
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10">
            <Award className="h-5 w-5 text-blue-400" />
          </span>
          <div>
            <p className="text-2xl font-bold">{studentCertificates.length}</p>
            <p className="text-xs text-muted-foreground">Total Certificates</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </span>
          <div>
            <p className="text-2xl font-bold text-emerald-500">{issuedCount}</p>
            <p className="text-xs text-muted-foreground">Issued</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10">
            <Clock className="h-5 w-5 text-amber-400" />
          </span>
          <div>
            <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10">
            <XCircle className="h-5 w-5 text-rose-400" />
          </span>
          <div>
            <p className="text-2xl font-bold text-rose-500">{revokedCount}</p>
            <p className="text-xs text-muted-foreground">Revoked</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="border bg-card overflow-hidden">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student, course, or certificate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl"
            />
          </div>
          <Badge variant="outline" className="rounded-full">{filtered.length} certificates</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Certificate Title</TableHead>
                <TableHead>{t("stu.issuedDate")}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cert) => {
                const StatusIcon = statusIconMap[cert.status];
                return (
                  <TableRow key={cert.id} className="hover:bg-accent/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {cert.studentName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{cert.studentName}</p>
                          <p className="text-xs text-muted-foreground">{cert.studentId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{cert.course}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">{cert.certificateTitle}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{cert.issuedDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full text-xs gap-1", statusColorMap[cert.status])}>
                        <StatusIcon className="h-3 w-3" />
                        {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 rounded-lg"
                          title={t("stu.download")}
                          disabled={cert.status === "revoked"}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                          title={t("stu.revoke")}
                          disabled={cert.status !== "issued"}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-8 w-8" />
                      <p className="text-sm">No certificates found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Certificate Cards (visual representation) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {studentCertificates.filter((c) => c.status === "issued").map((cert) => (
          <Card key={cert.id} className="border bg-card p-5 relative overflow-hidden">
            <div className="absolute top-0 end-0 w-20 h-20 opacity-5">
              <Award className="w-full h-full text-amber-500" />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-amber-500/10 text-amber-500 text-sm">
                  {cert.studentName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{cert.studentName}</p>
                <p className="text-xs text-muted-foreground">{cert.course}</p>
              </div>
            </div>
            <div className="border-t pt-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                {cert.certificateTitle}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Issued: {cert.issuedDate}</p>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="rounded-xl gap-1 flex-1">
                <Download className="h-3.5 w-3.5" /> {t("stu.download")}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </DashPage>
  );
}
