import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Users, Search, Eye, ChevronDown, X, Filter,
  BookOpen, Clock, Phone, Mail, TrendingUp, Brain,
  HelpCircle, CreditCard, AlertTriangle,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { mockStudents, wrongQuestions, studentPayments, type MockStudent } from "@/lib/students-mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/students/all")({
  component: AllStudentsPage,
});

const riskColorMap: Record<string, string> = {
  high: "border-rose-300 text-rose-600 bg-rose-500/10",
  medium: "border-amber-300 text-amber-600 bg-amber-500/10",
  low: "border-blue-300 text-blue-600 bg-blue-500/10",
  none: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
};

const statusColorMap: Record<string, string> = {
  active: "border-emerald-300 text-emerald-600 bg-emerald-500/10",
  inactive: "border-slate-300 text-slate-500 bg-slate-500/10",
  new: "border-blue-300 text-blue-600 bg-blue-500/10",
};

function AllStudentsPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<MockStudent | null>(null);

  const courses = useMemo(() => {
    const all = new Set<string>();
    mockStudents.forEach((s) => s.courses.forEach((c) => all.add(c)));
    return Array.from(all);
  }, []);

  const filtered = useMemo(() => {
    let result = [...mockStudents];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      );
    }
    if (courseFilter !== "all") result = result.filter((s) => s.courses.includes(courseFilter));
    if (riskFilter !== "all") result = result.filter((s) => s.riskLevel === riskFilter);
    if (statusFilter !== "all") result = result.filter((s) => s.status === statusFilter);
    return result;
  }, [search, courseFilter, riskFilter, statusFilter]);

  const hasFilters = courseFilter !== "all" || riskFilter !== "all" || statusFilter !== "all";

  const studentWrongQs = selectedStudent
    ? wrongQuestions.filter((wq) => wq.studentId === selectedStudent.id)
    : [];
  const studentPaymentList = selectedStudent
    ? studentPayments.filter((p) => p.studentId === selectedStudent.id)
    : [];

  return (
    <DashPage role="teacher" title={t("stu.allStudents")} subtitle="View, search, and manage all enrolled students" icon={ROLES.teacher.icon}>
      {/* Filters */}
      <Card className="border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 rounded-xl"
            />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[200px] rounded-xl">
              <BookOpen className="h-4 w-4 me-2 text-muted-foreground" />
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[160px] rounded-xl">
              <AlertTriangle className="h-4 w-4 me-2 text-muted-foreground" />
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="high">{t("stu.high")}</SelectItem>
              <SelectItem value="medium">{t("stu.medium")}</SelectItem>
              <SelectItem value="low">{t("stu.low")}</SelectItem>
              <SelectItem value="none">{t("stu.none")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] rounded-xl">
              <Filter className="h-4 w-4 me-2 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">{t("stu.active")}</SelectItem>
              <SelectItem value="inactive">{t("stu.inactive")}</SelectItem>
              <SelectItem value="new">{t("stu.new")}</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="rounded-xl gap-1 text-muted-foreground"
              onClick={() => { setCourseFilter("all"); setRiskFilter("all"); setStatusFilter("all"); }}>
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
          <Badge variant="outline" className="rounded-full ms-auto">{filtered.length} students</Badge>
        </div>
      </Card>

      {/* Table */}
      <Card className="border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">{t("stu.name")}</TableHead>
                <TableHead>{t("stu.grade")}</TableHead>
                <TableHead>{t("stu.courses")}</TableHead>
                <TableHead>{t("stu.progress")}</TableHead>
                <TableHead>{t("stu.avgScore")}</TableHead>
                <TableHead>{t("stu.riskLevel")}</TableHead>
                <TableHead>{t("stu.lastLogin")}</TableHead>
                <TableHead>{t("stu.assistantTeacher")}</TableHead>
                <TableHead>{t("stu.parentContact")}</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => (
                <TableRow
                  key={student.id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => setSelectedStudent(student)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {student.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{student.grade}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {student.courses.map((c) => (
                        <Badge key={c} variant="outline" className="rounded-full text-[10px] px-1.5 py-0">
                          {c.split(" ").map(w => w[0]).join("")}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={student.progress} className="h-2 w-16" />
                      <span className="text-xs font-medium">{student.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-sm font-semibold",
                      student.avgScore >= 80 ? "text-emerald-500" :
                        student.avgScore >= 60 ? "text-amber-500" : "text-rose-500"
                    )}>
                      {student.avgScore > 0 ? `${student.avgScore}%` : "---"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full text-xs", riskColorMap[student.riskLevel])}>
                      {t(`stu.${student.riskLevel}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{student.lastLogin}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{student.assistantTeacher}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate max-w-[100px]">{student.parentPhone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 rounded-xl"
                      onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="h-8 w-8" />
                      <p className="text-sm">No students match your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Student Detail Sheet */}
      <Sheet open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedStudent && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {selectedStudent.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle>{selectedStudent.name}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{selectedStudent.id} &middot; {selectedStudent.grade}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={cn("rounded-full text-xs", statusColorMap[selectedStudent.status])}>
                    {t(`stu.${selectedStudent.status}`)}
                  </Badge>
                  <Badge variant="outline" className={cn("rounded-full text-xs", riskColorMap[selectedStudent.riskLevel])}>
                    Risk: {t(`stu.${selectedStudent.riskLevel}`)}
                  </Badge>
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="w-full grid grid-cols-6">
                  <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                  <TabsTrigger value="progress" className="text-xs">{t("stu.progress")}</TabsTrigger>
                  <TabsTrigger value="quizzes" className="text-xs">Quizzes</TabsTrigger>
                  <TabsTrigger value="wrong" className="text-xs">Wrong Q</TabsTrigger>
                  <TabsTrigger value="parent" className="text-xs">Parent</TabsTrigger>
                  <TabsTrigger value="payments" className="text-xs">Pay</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Avg Score</p>
                      <p className="text-xl font-bold">{selectedStudent.avgScore}%</p>
                    </Card>
                    <Card className="border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Progress</p>
                      <p className="text-xl font-bold">{selectedStudent.progress}%</p>
                    </Card>
                    <Card className="border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Watch Time</p>
                      <p className="text-xl font-bold">{selectedStudent.watchTime}</p>
                    </Card>
                    <Card className="border bg-card p-3">
                      <p className="text-xs text-muted-foreground">HW Completion</p>
                      <p className="text-xl font-bold">{selectedStudent.hwCompletion}%</p>
                    </Card>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">{t("stu.courses")}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.courses.map((c) => (
                        <Badge key={c} variant="outline" className="rounded-full">{c}</Badge>
                      ))}
                    </div>
                  </div>
                  {selectedStudent.riskReasons.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-rose-500">Risk Reasons</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.riskReasons.map((r) => (
                          <Badge key={r} variant="outline" className="rounded-full border-rose-200 text-rose-500">{r}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span>{selectedStudent.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joined</span>
                      <span>{selectedStudent.joinedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("stu.lastLogin")}</span>
                      <span>{selectedStudent.lastLogin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("stu.assistantTeacher")}</span>
                      <span>{selectedStudent.assistantTeacher}</span>
                    </div>
                  </div>
                </TabsContent>

                {/* Progress Tab */}
                <TabsContent value="progress" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {[
                      { label: "Course Progress", value: selectedStudent.progress },
                      { label: "HW Completion", value: selectedStudent.hwCompletion },
                      { label: "Quiz Average", value: selectedStudent.quizAvg },
                    ].map((m) => (
                      <div key={m.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{m.label}</span>
                          <span className="font-semibold">{m.value}%</span>
                        </div>
                        <Progress value={m.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Watch Time</p>
                      <p className="text-lg font-bold">{selectedStudent.watchTime}</p>
                    </Card>
                    <Card className="border bg-card p-3">
                      <p className="text-xs text-muted-foreground">{t("stu.lastLogin")}</p>
                      <p className="text-lg font-bold">{selectedStudent.lastLogin}</p>
                    </Card>
                  </div>
                </TabsContent>

                {/* Quiz History Tab */}
                <TabsContent value="quizzes" className="mt-4">
                  <div className="space-y-3">
                    <Card className="border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Quiz Average</p>
                      <p className="text-2xl font-bold">{selectedStudent.quizAvg}%</p>
                    </Card>
                    <div className="rounded-xl border p-3">
                      <p className="text-sm font-medium mb-2">Recent Quiz Results</p>
                      {[
                        { name: "Limits Quiz", score: Math.max(selectedStudent.quizAvg - 5, 0), date: "Jun 20" },
                        { name: "Derivatives Quiz", score: selectedStudent.quizAvg, date: "Jun 15" },
                        { name: "Integration Quiz", score: Math.min(selectedStudent.quizAvg + 8, 100), date: "Jun 10" },
                      ].map((q) => (
                        <div key={q.name} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="text-sm">{q.name}</p>
                            <p className="text-xs text-muted-foreground">{q.date}</p>
                          </div>
                          <Badge variant="outline" className={cn("rounded-full",
                            q.score >= 80 ? "text-emerald-500 border-emerald-300" :
                              q.score >= 60 ? "text-amber-500 border-amber-300" : "text-rose-500 border-rose-300"
                          )}>
                            {q.score}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Wrong Questions Tab */}
                <TabsContent value="wrong" className="mt-4">
                  {studentWrongQs.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                      <HelpCircle className="h-8 w-8" />
                      <p className="text-sm">No wrong questions recorded</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {studentWrongQs.map((wq) => (
                        <div key={wq.id} className="rounded-xl border p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{wq.concept}</p>
                            <Badge variant="outline" className={cn("rounded-full text-xs",
                              wq.difficulty === "hard" ? "border-rose-300 text-rose-500" :
                                wq.difficulty === "medium" ? "border-amber-300 text-amber-500" : "border-emerald-300 text-emerald-500"
                            )}>{wq.difficulty}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{wq.course} &middot; {wq.chapter} &middot; {wq.atomicConcept}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>Retries: {wq.retryCount}</span>
                            <span>Last: {wq.lastWrongDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Parent Tab */}
                <TabsContent value="parent" className="space-y-4 mt-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("stu.parentName")}</span>
                      <span className="font-medium">{selectedStudent.parentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("stu.relation")}</span>
                      <span>{selectedStudent.parentRelation}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">WhatsApp</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedStudent.parentPhone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("team.email")}</span>
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedStudent.parentEmail}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl flex-1">{t("stu.notifyParent")}</Button>
                    <Button variant="outline" size="sm" className="rounded-xl flex-1">{t("stu.sendWeeklyReport")}</Button>
                  </div>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments" className="mt-4">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <Card className="border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Total Paid</p>
                      <p className="text-lg font-bold text-emerald-500">${selectedStudent.totalPaid}</p>
                    </Card>
                    <Card className="border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Pending</p>
                      <p className="text-lg font-bold text-amber-500">${selectedStudent.pendingPayment}</p>
                    </Card>
                    <Card className="border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Wallet</p>
                      <p className="text-lg font-bold">${selectedStudent.walletBalance}</p>
                    </Card>
                  </div>
                  {studentPaymentList.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                      <CreditCard className="h-8 w-8" />
                      <p className="text-sm">No payment records</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {studentPaymentList.map((pay) => (
                        <div key={pay.id} className="rounded-xl border p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{pay.course}</p>
                            <span className="text-sm font-bold text-emerald-500">${pay.paid}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{pay.purchase} &middot; {pay.date}</p>
                          {pay.coupon && (
                            <Badge variant="outline" className="rounded-full text-[10px] mt-1">{pay.coupon}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashPage>
  );
}
