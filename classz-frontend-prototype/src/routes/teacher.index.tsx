import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen, CreditCard, DollarSign, FileText, MessageSquare, Plus,
  TrendingUp, Users, Wallet, ClipboardList, Bell, ArrowRight,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { teacherProfile, teacherRevenue, essayQueue } from "@/lib/teacherMock";

export const Route = createFileRoute("/teacher/")({
  component: TeacherDashboard,
});

function TeacherDashboard() {
  return (
    <DashPage role="teacher" title="Teacher Workspace" subtitle={`${teacherProfile.name} · ${teacherProfile.publicCode}`} icon={ROLES.teacher.icon}>
      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={DollarSign} label="Today's Revenue" value={`$${teacherRevenue.todayRevenue.toLocaleString()}`} change="+12%" color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard icon={TrendingUp} label="Monthly Revenue" value={`$${teacherRevenue.monthlyRevenue.toLocaleString()}`} change="+8%" color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard icon={Users} label="Total Students" value={teacherProfile.totalStudents.toLocaleString()} change="+45 this week" color="text-violet-400" bg="bg-violet-500/10" />
        <StatCard icon={Wallet} label="Wallet Balance" value={`$${teacherRevenue.walletBalance.toLocaleString()}`} change="" color="text-amber-400" bg="bg-amber-500/10" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="border bg-card p-5 lg:col-span-1">
          <h3 className="font-semibold">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { label: "Create Session", icon: Plus, to: "/teacher/sessions" },
              { label: "Add Quiz", icon: ClipboardList, to: "/teacher/quizzes" },
              { label: "Upload Material", icon: FileText, to: "/teacher/courses" },
              { label: "Add Questions", icon: BookOpen, to: "/teacher/questions" },
              { label: "Announcement", icon: Bell, to: "/teacher/chat" },
              { label: "View Revenue", icon: CreditCard, to: "/teacher/revenue" },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors hover:bg-accent"
              >
                <action.icon className="h-3.5 w-3.5 text-primary" />
                {action.label}
              </Link>
            ))}
          </div>
        </Card>

        {/* Essay Grading Queue */}
        <Card className="border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Essay Grading Queue</h3>
            <Badge variant="outline" className="rounded-full">{essayQueue.filter((e) => e.status === "pending").length} pending</Badge>
          </div>
          <div className="mt-4 space-y-2">
            {essayQueue.map((essay) => (
              <div key={essay.id} className="flex items-center justify-between rounded-xl border px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{essay.title}</p>
                  <p className="text-xs text-muted-foreground">{essay.student} · {essay.studentCode} · {essay.submitted}</p>
                </div>
                <Badge variant={essay.status === "pending" ? "default" : "outline"} className="shrink-0 rounded-full text-xs">
                  {essay.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card className="border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recent Sales</h3>
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link to="/teacher/revenue">View all <ArrowRight className="ms-1 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="pb-2 text-start font-medium">Payment ID</th>
                <th className="pb-2 text-start font-medium">Student</th>
                <th className="pb-2 text-start font-medium">Item</th>
                <th className="pb-2 text-end font-medium">Amount</th>
                <th className="pb-2 text-end font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {teacherRevenue.recentSales.map((sale) => (
                <tr key={sale.id} className="border-b last:border-0">
                  <td className="py-2.5 font-mono text-xs text-muted-foreground">{sale.id}</td>
                  <td className="py-2.5">
                    <p className="font-medium">{sale.studentName}</p>
                    <p className="text-xs text-muted-foreground">{sale.studentCode}</p>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{sale.item}</td>
                  <td className="py-2.5 text-end font-semibold text-emerald-600">${sale.amount}</td>
                  <td className="py-2.5 text-end text-muted-foreground">{sale.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniCard icon={BookOpen} label="Active Courses" value={String(teacherProfile.totalCourses)} to="/teacher/courses" />
        <MiniCard icon={MessageSquare} label="Team Messages" value="12 unread" to="/teacher/chat" />
        <MiniCard icon={Users} label="Active Sessions" value={String(teacherProfile.activeSessions)} to="/teacher/sessions" />
      </div>
    </DashPage>
  );
}

function StatCard({ icon: Icon, label, value, change, color, bg }: { icon: React.ElementType; label: string; value: string; change: string; color: string; bg: string }) {
  return (
    <Card className="border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        {change && <span className="text-xs font-medium text-emerald-600">{change}</span>}
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

function MiniCard({ icon: Icon, label, value, to }: { icon: React.ElementType; label: string; value: string; to: string }) {
  return (
    <Link to={to}>
      <Card className="flex items-center gap-3 border bg-card p-4 transition-colors hover:bg-accent">
        <Icon className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </Card>
    </Link>
  );
}
