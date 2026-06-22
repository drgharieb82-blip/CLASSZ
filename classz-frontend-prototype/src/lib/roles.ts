import {
  LayoutDashboard, BookOpen, GraduationCap, PlayCircle, BarChart3, Bell, Trophy,
  Award, Library, HelpCircle, Bot, Sparkles, Brain, ClipboardList, CalendarDays,
  Users, FolderTree, FileText, PencilRuler, Layers, Megaphone, Settings, Shield,
  Code2, Activity, Server, Bug, Rocket, Flag, History, Database, Image, Upload,
  CreditCard, DollarSign, Receipt, Ticket, Globe, ScrollText, SlidersHorizontal,
  Grid3x3, UserCog, MessageSquare, ListChecks, Wallet, StickyNote, type LucideIcon,
} from "lucide-react";

export type Role =
  | "student" | "teacher" | "assistant" | "parent" | "admin"
  | "developer" | "content" | "finance" | "superadmin";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
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
    key: "student", name: "Student", tagline: "Learn & grow", color: "from-violet-500 to-blue-500",
    icon: GraduationCap, home: "/student",
    nav: [
      { group: "Learning", items: [
        { label: "Dashboard", to: "/student", icon: LayoutDashboard },
        { label: "My Courses", to: "/student/courses", icon: BookOpen },
        { label: "Smart Revision", to: "/student/revision", icon: Activity },
        { label: "My Notes", to: "/student/notes", icon: StickyNote },
        { label: "Progress", to: "/student/progress", icon: BarChart3 },
      ]},
      { group: "Practice", items: [
        { label: "Question Bank", to: "/questions", icon: Library },
        { label: "Wrong Questions", to: "/student/wrong-questions", icon: HelpCircle },
      ]},
      { group: "Rewards", items: [
        { label: "Trophy Room", to: "/student/achievements", icon: Trophy },
        { label: "Leaderboard", to: "/student/leaderboard", icon: Award },
        { label: "Certificates", to: "/student/certificates", icon: GraduationCap },
        { label: "Wallet", to: "/student/wallet", icon: Wallet },
      ]},
      { group: "More", items: [
        { label: "AI Assistant", to: "/assistant", icon: Bot },
        { label: "Notifications", to: "/student/notifications", icon: Bell },
      ]},
    ],
  },
  teacher: {
    key: "teacher", name: "Teacher", tagline: "Your academy workspace", color: "from-blue-500 to-cyan-500",
    icon: PencilRuler, home: "/teacher",
    nav: [
      { group: "Workspace", items: [
        { label: "Dashboard", to: "/teacher", icon: LayoutDashboard },
        { label: "My Courses", to: "/teacher/courses", icon: BookOpen },
        { label: "Content Studio", to: "/teacher/content-studio", icon: Layers },
        { label: "Session Builder", to: "/teacher/sessions", icon: PlayCircle },
      ]},
      { group: "Assessment", items: [
        { label: "Question Bank", to: "/teacher/questions", icon: Library },
        { label: "Quizzes", to: "/teacher/quizzes", icon: ClipboardList },
        { label: "Exams", to: "/teacher/exams", icon: ScrollText },
        { label: "Homework", to: "/teacher/homework", icon: ListChecks },
        { label: "Grading Queue", to: "/teacher/grading", icon: Receipt },
      ]},
      { group: "Business", items: [
        { label: "Students", to: "/teacher/students", icon: Users },
        { label: "Revenue & Wallet", to: "/teacher/revenue", icon: Wallet },
        { label: "Rewards", to: "/teacher/rewards", icon: Trophy },
      ]},
      { group: "Team", items: [
        { label: "Team Management", to: "/teacher/team", icon: UserCog },
        { label: "Communication", to: "/teacher/chat", icon: MessageSquare },
      ]},
      { group: "Insights", items: [
        { label: "Analytics", to: "/teacher/analytics", icon: BarChart3 },
        { label: "Generator Studio", to: "/teacher/generator", icon: Sparkles },
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
    key: "parent", name: "Parent", tagline: "Track your child", color: "from-emerald-500 to-teal-500",
    icon: Users, home: "/parent",
    nav: [
      { group: "Monitoring", items: [
        { label: "Dashboard", to: "/parent", icon: LayoutDashboard },
        { label: "Child Progress", to: "/parent/progress", icon: BarChart3 },
        { label: "Homework", to: "/parent/homework", icon: ClipboardList },
        { label: "Attendance", to: "/parent/attendance", icon: CalendarDays },
        { label: "Messages", to: "/parent/messages", icon: MessageSquare },
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
    key: "content", name: "Content Manager", tagline: "Curate content", color: "from-pink-500 to-rose-500",
    icon: Layers, home: "/content",
    nav: [
      { group: "Content", items: [
        { label: "Dashboard", to: "/content", icon: LayoutDashboard },
        { label: "Curriculum", to: "/content/curriculum", icon: FolderTree },
        { label: "Lesson Review", to: "/content/lesson-review", icon: FileText },
        { label: "Question Review", to: "/content/question-review", icon: ListChecks },
      ]},
      { group: "Media", items: [
        { label: "Media Library", to: "/content/media", icon: Image },
        { label: "Import Content", to: "/content/import", icon: Upload },
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
    icon: Globe, home: "/super",
    nav: [
      { group: "Control", items: [
        { label: "Dashboard", to: "/super", icon: LayoutDashboard },
        { label: "Global Analytics", to: "/super/analytics", icon: BarChart3 },
        { label: "System Control", to: "/super/system", icon: SlidersHorizontal },
        { label: "Audit Logs", to: "/super/audit", icon: ScrollText },
        { label: "Role Access Matrix", to: "/super/access-matrix", icon: Grid3x3 },
      ]},
    ],
  },
};

export const ROLE_LIST = Object.values(ROLES);
