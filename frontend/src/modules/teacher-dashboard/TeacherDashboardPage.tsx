import { BookOpen, ClipboardList, GraduationCap, MessageSquareText, Users } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { AssistantTeacherPanel } from "../assistant/components";
import { ConceptEngineOverview } from "../concept-engine/components";
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
    <PageContainer>
      <RoleDashboard
        eyebrow="Teacher dashboard"
        title="Welcome back to your teaching studio."
        description="Plan courses, track students, manage pending grading, and coordinate assistant teacher support from one role-aware dashboard."
        stats={stats}
        sectionsTitle="Teacher workflow modules"
        sectionsDescription="These areas keep the teacher route useful while current insight modules stay local to the frontend."
        placeholders={placeholders}
      />

      <Card className="p-6 sm:p-8">
        <SectionHeader
          eyebrow="Teaching Insights"
          title="Class concept signals"
          description="Use concept state, learning paths, and explainable insights to spot where lessons may need reinforcement."
        />
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Insight focus</p>
          <h3 className="mt-2 font-display text-xl font-semibold text-slate-950 dark:text-white">Concept mastery</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Review concept-level readiness before planning lesson reinforcement.
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Class support</p>
          <h3 className="mt-2 font-display text-xl font-semibold text-slate-950 dark:text-white">Revision planning</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Turn weak concepts into targeted review and practice sessions.
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Explainability</p>
          <h3 className="mt-2 font-display text-xl font-semibold text-slate-950 dark:text-white">Recommendation reasons</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Use transparent reasoning before assigning interventions.
          </p>
        </Card>
      </div>

      <Card className="p-6 sm:p-8">
        <SectionHeader
          eyebrow="Weak Concepts"
          title="Concept gaps and revision impact"
          description="Review weak concepts, downstream dependency impact, and adaptive revision steps before assigning support."
        />
      </Card>
      <ConceptEngineOverview />

      <Card className="p-6 sm:p-8">
        <SectionHeader
          eyebrow="AI Assistant"
          title="Assistant teacher tools"
          description="Mock assistant workspace for explanations, support tasks, and revision guidance."
        />
      </Card>
      <AssistantTeacherPanel />
    </PageContainer>
  );
}
