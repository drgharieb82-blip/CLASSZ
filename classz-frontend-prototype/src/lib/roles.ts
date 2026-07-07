import {
  LayoutDashboard, BookOpen, GraduationCap, BarChart3, Bell, Trophy,
  Award, Library, HelpCircle, Bot, Sparkles, Brain, ClipboardList, CalendarDays,
  Users, FolderTree, FileText, PencilRuler, Layers, Megaphone, Settings, Shield,
  Code2, Activity, Server, Bug, Rocket, Flag, History, Database, Image, Upload,
  CreditCard, DollarSign, Receipt, Ticket, Globe, ScrollText, SlidersHorizontal,
  Grid3x3, UserCog, MessageSquare, ListChecks, Wallet, StickyNote, type LucideIcon,
  Briefcase, FileCheck, ShieldCheck, UsersRound, PieChart, KanbanSquare, Clock, Mail,
  Eye, BrainCircuit, HeartHandshake,
  FileBarChart, CheckSquare, PenTool, Inbox, Medal, BookMarked, LineChart,
  ShieldAlert, AlertTriangle, TrendingUp, Store, ShoppingCart, BadgeDollarSign,
  Tags, RefreshCw, Banknote, ReceiptText, Gift, FileSpreadsheet, Calculator,
  Megaphone as MegaphoneIcon, Lightbulb, BrainCog, Target, Telescope, FileOutput,
  Wand2, Building2, ArrowDownToLine, HandCoins, Scale, Landmark, FileClock,
  Headphones, TicketCheck, HeartPulse, Lock, UserCheck,
  ClipboardCheck, CalendarCheck, Star, Gauge, Import, Send,
  Hash, Workflow,
} from "lucide-react";

export type Role =
  | "student" | "teacher" | "assistant" | "parent" | "admin"
  | "developer" | "content" | "finance" | "superadmin" | "assistant_teacher";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  children?: { label: string; to: string; icon: LucideIcon }[];
}

export interface RoleConfig {
  key: Role;
  name: string;
  tagline: string;
  color: string;
  icon: LucideIcon;
  home: string;
  nav: { group: string; items: NavItem[] }[];
}

export const ROLES: Record<Role, RoleConfig> = {
  student: {
    key: "student", name: "role.student", tagline: "role.studentTagline", color: "from-violet-500 to-blue-500",
    icon: GraduationCap, home: "/student",
    nav: [
      { group: "nav.learning", items: [
        { label: "workspace.dashboard", to: "/student", icon: LayoutDashboard },
        { label: "workspace.myCourses", to: "/student/courses", icon: BookOpen },
        { label: "student.smartRevision", to: "/student/revision", icon: Activity },
        { label: "student.myNotes", to: "/student/notes", icon: StickyNote },
        { label: "student.progress", to: "/student/progress", icon: BarChart3 },
      ]},
      { group: "nav.practice", items: [
        { label: "student.questionBank", to: "/questions", icon: Library },
        { label: "student.wrongQuestions", to: "/student/wrong-questions", icon: HelpCircle },
      ]},
      { group: "nav.rewards", items: [
        { label: "student.trophyRoom", to: "/student/achievements", icon: Trophy },
        { label: "student.leaderboard", to: "/student/leaderboard", icon: Award },
        { label: "student.certificates", to: "/student/certificates", icon: GraduationCap },
        { label: "student.wallet", to: "/student/wallet", icon: Wallet },
      ]},
      { group: "nav.more", items: [
        { label: "student.aiAssistant", to: "/assistant", icon: Bot },
        { label: "student.notifications", to: "/student/notifications", icon: Bell },
      ]},
    ],
  },
  teacher: {
    key: "teacher", name: "role.teacher", tagline: "role.teacherTagline", color: "from-blue-500 to-cyan-500",
    icon: PencilRuler, home: "/teacher/dashboard",
    nav: [
      { group: "", items: [
        { label: "workspace.title", to: "/teacher/dashboard", icon: LayoutDashboard, children: [
          { label: "workspace.dashboard", to: "/teacher/dashboard", icon: LayoutDashboard },
          { label: "workspace.myCourses", to: "/teacher/courses", icon: BookOpen },
          { label: "workspace.contentStudio", to: "/teacher/content-studio", icon: Layers },
        ]},
        { label: "stu.title", to: "/teacher/students", icon: Users, children: [
          { label: "stu.overview", to: "/teacher/students", icon: Eye },
          { label: "stu.allStudents", to: "/teacher/students/all", icon: Users },
          { label: "stu.pods", to: "/teacher/students/pods", icon: UsersRound },
          { label: "stu.progress", to: "/teacher/students/progress", icon: TrendingUp },
          { label: "stu.atRisk", to: "/teacher/students/at-risk", icon: AlertTriangle },
          { label: "stu.wrongQuestions", to: "/teacher/students/wrong-questions", icon: HelpCircle },
          { label: "stu.memory", to: "/teacher/students/memory", icon: BrainCircuit },
          { label: "stu.parents", to: "/teacher/students/parents", icon: HeartHandshake },
          { label: "stu.payments", to: "/teacher/students/payments", icon: CreditCard },
          { label: "stu.certificates", to: "/teacher/students/certificates", icon: GraduationCap },
          { label: "stu.reports", to: "/teacher/students/reports", icon: FileBarChart },
        ]},
        { label: "assess.title", to: "/teacher/assessment", icon: CheckSquare, children: [
          { label: "assess.gradingQueue", to: "/teacher/assessment/grading-queue", icon: Inbox },
          { label: "assess.manualGrading", to: "/teacher/assessment/manual-grading", icon: PenTool },
          { label: "assess.submissions", to: "/teacher/assessment/submissions", icon: FileCheck },
          { label: "assess.results", to: "/teacher/assessment/results", icon: Medal },
          { label: "assess.gradebook", to: "/teacher/assessment/gradebook", icon: BookMarked },
          { label: "assess.analytics", to: "/teacher/assessment/analytics", icon: LineChart },
          { label: "assess.academicIntegrity", to: "/teacher/assessment/academic-integrity", icon: ShieldAlert },
        ]},
        { label: "team.title", to: "/teacher/team", icon: UserCog, children: [
          { label: "team.overview", to: "/teacher/team", icon: Eye },
          { label: "team.members", to: "/teacher/team/members", icon: Users },
          { label: "team.recruitment", to: "/teacher/team/recruitment", icon: Briefcase },
          { label: "team.applications", to: "/teacher/team/applications", icon: FileCheck },
          { label: "team.roles", to: "/teacher/team/roles", icon: ShieldCheck },
          { label: "stu.pods", to: "/teacher/team/student-pods", icon: UsersRound },
          { label: "team.revenueSharing", to: "/teacher/team/revenue-sharing", icon: PieChart },
          { label: "team.tasks", to: "/teacher/team/tasks", icon: KanbanSquare },
          { label: "team.activityLogs", to: "/teacher/team/activity-logs", icon: Clock },
          { label: "team.invitations", to: "/teacher/team/invitations", icon: Mail },
        ]},
        { label: "biz.title", to: "/teacher/business", icon: Store, children: [
          { label: "biz.revenueWallet", to: "/teacher/business", icon: Wallet },
          { label: "biz.sales", to: "/teacher/business/sales", icon: ShoppingCart },
          { label: "biz.orders", to: "/teacher/business/orders", icon: Receipt },
          { label: "biz.studentPayments", to: "/teacher/business/student-payments", icon: BadgeDollarSign },
          { label: "biz.couponsPricing", to: "/teacher/business/coupons-pricing", icon: Tags },
          { label: "biz.subscriptions", to: "/teacher/business/subscriptions", icon: RefreshCw },
          { label: "biz.revenueSharing", to: "/teacher/business/revenue-sharing", icon: PieChart },
          { label: "biz.payouts", to: "/teacher/business/payouts", icon: Banknote },
          { label: "biz.expenses", to: "/teacher/business/expenses", icon: ReceiptText },
          { label: "biz.rewards", to: "/teacher/business/rewards", icon: Gift },
          { label: "biz.financialReports", to: "/teacher/business/financial-reports", icon: FileSpreadsheet },
          { label: "biz.taxesInvoices", to: "/teacher/business/taxes-invoices", icon: Calculator },
          { label: "biz.marketing", to: "/teacher/business/marketing", icon: Megaphone },
        ]},
        { label: "ins.title", to: "/teacher/insights", icon: Lightbulb, children: [
          { label: "ins.overview", to: "/teacher/insights", icon: Eye },
          { label: "ins.courseAnalytics", to: "/teacher/insights/course-analytics", icon: BookOpen },
          { label: "ins.studentAnalytics", to: "/teacher/insights/student-analytics", icon: Users },
          { label: "ins.assessmentAnalytics", to: "/teacher/insights/assessment-analytics", icon: CheckSquare },
          { label: "ins.conceptAnalytics", to: "/teacher/insights/concept-analytics", icon: Target },
          { label: "ins.memoryInsights", to: "/teacher/insights/memory-insights", icon: BrainCog },
          { label: "ins.revenueAnalytics", to: "/teacher/insights/revenue-analytics", icon: DollarSign },
          { label: "ins.aiInsights", to: "/teacher/insights/ai-insights", icon: Sparkles },
          { label: "ins.predictions", to: "/teacher/insights/predictions", icon: Telescope },
          { label: "ins.reportsCenter", to: "/teacher/insights/reports-center", icon: FileOutput },
          { label: "ins.generatorStudio", to: "/teacher/insights/generator-studio", icon: Wand2 },
        ]},
        { label: "nav.communication", to: "/teacher/chat", icon: MessageSquare },
      ]},
    ],
  },
  assistant: {
    key: "assistant", name: "AI Assistant", tagline: "Smart study help", color: "from-fuchsia-500 to-violet-500",
    icon: Sparkles, home: "/assistant",
    nav: [
      { group: "Assistant", items: [
        { label: "Chat", to: "/assistant", icon: Bot },
        { label: "Explain Concept", to: "/assistant/explain", icon: Brain },
        { label: "Solve Question", to: "/assistant/solve", icon: Sparkles },
        { label: "Analyze Mistakes", to: "/assistant/analyze", icon: Activity },
        { label: "Study Plan", to: "/assistant/study-plan", icon: CalendarDays },
      ]},
    ],
  },
  parent: {
    key: "parent", name: "role.parent", tagline: "role.parentTagline", color: "from-emerald-500 to-teal-500",
    icon: Users, home: "/parent",
    nav: [
      { group: "", items: [
        { label: "parent.dashboard", to: "/parent", icon: LayoutDashboard },
        { label: "parent.settings", to: "/parent/settings", icon: Settings },
      ]},
    ],
  },
  admin: {
    key: "admin", name: "Admin", tagline: "Run the platform", color: "from-orange-500 to-amber-500",
    icon: Shield, home: "/admin",
    nav: [
      { group: "Overview", items: [
        { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
        { label: "Users", to: "/admin/users", icon: Users },
        { label: "Roles & Permissions", to: "/admin/roles", icon: UserCog },
      ]},
      { group: "Management", items: [
        { label: "Courses", to: "/admin/courses", icon: BookOpen },
        { label: "Teachers", to: "/admin/teachers", icon: PencilRuler },
        { label: "Students", to: "/admin/students", icon: GraduationCap },
      ]},
      { group: "Platform", items: [
        { label: "Banners", to: "/admin/banners", icon: Megaphone },
        { label: "Notifications", to: "/admin/notifications", icon: Bell },
        { label: "Settings", to: "/admin/settings", icon: Settings },
      ]},
    ],
  },
  developer: {
    key: "developer", name: "Developer", tagline: "Build & monitor", color: "from-slate-500 to-blue-500",
    icon: Code2, home: "/developer",
    nav: [
      { group: "System", items: [
        { label: "Dashboard", to: "/developer", icon: LayoutDashboard },
        { label: "Frontend Status", to: "/developer/frontend", icon: Activity },
        { label: "Backend Status", to: "/developer/backend", icon: Server },
        { label: "API Health", to: "/developer/api-health", icon: Activity },
      ]},
      { group: "Operations", items: [
        { label: "Error Logs", to: "/developer/error-logs", icon: Bug },
        { label: "Deployments", to: "/developer/deployments", icon: Rocket },
        { label: "Feature Flags", to: "/developer/feature-flags", icon: Flag },
        { label: "Version History", to: "/developer/versions", icon: History },
      ]},
    ],
  },
  content: {
    key: "content", name: "cm.roleName", tagline: "cm.roleTagline", color: "from-pink-500 to-rose-500",
    icon: Layers, home: "/content",
    nav: [
      { group: "cm.content", items: [
        { label: "cm.dashboard", to: "/content", icon: LayoutDashboard },
        { label: "cm.questionReview", to: "/content/question-review", icon: ListChecks },
        { label: "cm.importJobs", to: "/content/import", icon: Upload },
        { label: "cm.mediaLibrary", to: "/content/media", icon: Image },
      ]},
      { group: "cm.manage", items: [
        { label: "cm.tagsConcepts", to: "/content/tags-concepts", icon: Hash },
        { label: "cm.publishingQueue", to: "/content/publishing-queue", icon: Send },
        { label: "cm.reports", to: "/content/reports", icon: FileBarChart },
      ]},
    ],
  },
  finance: {
    key: "finance", name: "Finance", tagline: "Money & growth", color: "from-green-500 to-emerald-500",
    icon: Wallet, home: "/finance",
    nav: [
      { group: "Finance", items: [
        { label: "Dashboard", to: "/finance", icon: LayoutDashboard },
        { label: "Subscriptions", to: "/finance/subscriptions", icon: CreditCard },
        { label: "Payment History", to: "/finance/payments", icon: Receipt },
        { label: "Teacher Revenue", to: "/finance/revenue", icon: DollarSign },
        { label: "Invoices", to: "/finance/invoices", icon: FileText },
        { label: "Coupons", to: "/finance/coupons", icon: Ticket },
      ]},
    ],
  },
  superadmin: {
    key: "superadmin", name: "Super Admin", tagline: "Total control", color: "from-violet-600 to-fuchsia-600",
    icon: Globe, home: "/admin",
    nav: [
      { group: "", items: [
        { label: "sa.platform", to: "/admin", icon: LayoutDashboard, children: [
          { label: "sa.dashboard", to: "/admin", icon: LayoutDashboard },
          { label: "sa.academies", to: "/admin/academies", icon: Building2 },
          { label: "sa.teachers", to: "/admin/teachers", icon: PencilRuler },
          { label: "sa.students", to: "/admin/students", icon: GraduationCap },
          { label: "sa.courses", to: "/admin/courses", icon: BookOpen },
        ]},
        { label: "sa.finance", to: "/admin/finance", icon: Landmark, children: [
          { label: "pf.revenue", to: "/admin/finance", icon: DollarSign },
          { label: "pf.withdrawals", to: "/admin/finance/withdrawals", icon: ArrowDownToLine },
          { label: "pf.subscriptions", to: "/admin/finance/subscriptions", icon: RefreshCw },
        ]},
        { label: "sa.operations", to: "/admin/support", icon: Headphones, children: [
          { label: "sa.supportTickets", to: "/admin/support/tickets", icon: TicketCheck },
          { label: "sa.reports", to: "/admin/support/reports", icon: FileBarChart },
        ]},
        { label: "sa.system", to: "/admin/settings", icon: Settings, children: [
          { label: "sa.settings", to: "/admin/settings", icon: Settings },
          { label: "sa.adminUsers", to: "/admin/admin-users", icon: Users },
          { label: "sa.auditLogs", to: "/admin/audit-logs", icon: ScrollText },
        ]},
      ]},
    ],
  },
  assistant_teacher: {
    key: "assistant_teacher", name: "at.roleName", tagline: "at.roleTagline", color: "from-teal-500 to-cyan-500",
    icon: UserCheck, home: "/assistant-teacher",
    nav: [
      { group: "at.main", items: [
        { label: "at.dashboard", to: "/assistant-teacher", icon: LayoutDashboard },
        { label: "at.studentPods", to: "/assistant-teacher/student-pods", icon: UsersRound },
        { label: "at.gradingQueue", to: "/assistant-teacher/grading-queue", icon: Inbox },
        { label: "at.messages", to: "/assistant-teacher/messages", icon: MessageSquare },
        { label: "at.followUp", to: "/assistant-teacher/follow-up", icon: AlertTriangle },
      ]},
      { group: "at.work", items: [
        { label: "at.tasks", to: "/assistant-teacher/tasks", icon: KanbanSquare },
        { label: "at.notes", to: "/assistant-teacher/notes", icon: StickyNote },
        { label: "at.schedule", to: "/assistant-teacher/schedule", icon: CalendarDays },
        { label: "at.performance", to: "/assistant-teacher/performance", icon: BarChart3 },
      ]},
    ],
  },
};

export const ROLE_LIST = Object.values(ROLES);
