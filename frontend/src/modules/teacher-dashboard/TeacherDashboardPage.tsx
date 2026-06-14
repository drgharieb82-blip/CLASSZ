import { BookOpen, ClipboardList, GraduationCap, MessageSquareText, Users } from "lucide-react";

import { RoleDashboard, type DashboardPlaceholder, type DashboardStat } from "../dashboard/RoleDashboard";

const stats: DashboardStat[] = [
  { label: "Courses", value: "4", icon: BookOpen, tone: "secondary", helperText: "Mock active courses" },
  { label: "Students", value: "128", icon: Users, tone: "primary", helperText: "Across all classes" },
  { label: "Pending grading", value: "16", icon: ClipboardList, tone: "warning", helperText: "Needs review" },
  { label: "Assistant tools", value: "Ready", icon: MessageSquareText, tone: "success", helperText: "Support workflow shell" },
];

const placeholders: DashboardPlaceholder[] = [
  {
    title: "Courses",
    description: "Course health, lesson coverage, and upcoming publishing work will be summarized here.",
    icon: <BookOpen className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Students",
    description: "Class rosters, progress signals, and students needing attention will appear here.",
    icon: <Users className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Pending grading",
    description: "Assignments, essays, and manual review tasks will collect in this teacher queue.",
    icon: <ClipboardList className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Assistant teacher tools",
    description: "Delegate support tasks, review explanations, and coordinate student interventions.",
    icon: <GraduationCap className="h-5 w-5" aria-hidden="true" />,
  },
];

export function TeacherDashboardPage() {
  return (
    <RoleDashboard
      eyebrow="Teacher dashboard"
      title="Welcome back to your teaching studio."
      description="Plan courses, track students, manage pending grading, and coordinate assistant teacher support from one role-aware dashboard."
      stats={stats}
      sectionsTitle="Teacher workflow modules"
      sectionsDescription="These placeholders keep the teacher route useful while future module data stays local-only for this phase."
      placeholders={placeholders}
    />
  );
}
