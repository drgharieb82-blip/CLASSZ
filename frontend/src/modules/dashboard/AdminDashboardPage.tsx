import { Activity, BookMarked, CircleDollarSign, GraduationCap, ShieldCheck, Users } from "lucide-react";

import { RoleDashboard, type DashboardPlaceholder, type DashboardStat } from "./RoleDashboard";

const stats: DashboardStat[] = [
  { label: "Active roles", value: "5", icon: ShieldCheck, tone: "primary", helperText: "Admin, teacher, assistant, student, parent" },
  { label: "Module shells", value: "15", icon: BookMarked, tone: "secondary", helperText: "Core routes remain available" },
  { label: "Platform status", value: "Ready", icon: Activity, tone: "success", helperText: "Mock auth and routing connected" },
  { label: "Billing", value: "Stub", icon: CircleDollarSign, tone: "warning", helperText: "Payments module reserved" },
];

const placeholders: DashboardPlaceholder[] = [
  {
    title: "People management",
    description: "User, class, and role administration will live here.",
    icon: <Users className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Learning operations",
    description: "Catalog, lessons, quizzes, and assignments stay connected through existing admin routes.",
    icon: <GraduationCap className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Security controls",
    description: "Permissions, audit views, and session controls can build on the current mock role map.",
    icon: <ShieldCheck className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Platform modules",
    description: "Reports, payments, and configuration remain staged for later phases.",
    icon: <BookMarked className="h-5 w-5" aria-hidden="true" />,
  },
];

export function AdminDashboardPage() {
  return (
    <RoleDashboard
      eyebrow="Admin dashboard"
      title="Welcome back to CLASSZ Control."
      description="Monitor the platform foundation, keep existing admin workflows available, and prepare future operations modules from one clean role dashboard."
      stats={stats}
      sectionsTitle="Admin workspace structure"
      sectionsDescription="Existing admin pages are preserved behind the authenticated shell while this dashboard provides a clearer landing surface."
      placeholders={placeholders}
    />
  );
}
