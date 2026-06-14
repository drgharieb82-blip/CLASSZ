import { ClipboardCheck, HelpCircle, ListChecks, MessageSquareText, Target, Users } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { AssistantTeacherPanel } from "../assistant/components";
import { RoleDashboard, type DashboardPlaceholder, type DashboardStat } from "./RoleDashboard";

const stats: DashboardStat[] = [
  { label: "Assigned students", value: "18", icon: Users, tone: "primary", helperText: "Mock support group" },
  { label: "Explanations", value: "12", icon: MessageSquareText, tone: "secondary", helperText: "Draft responses" },
  { label: "Weakness reviews", value: "5", icon: Target, tone: "warning", helperText: "Queued for review" },
  { label: "Support tasks", value: "9", icon: ClipboardCheck, tone: "success", helperText: "Ready to triage" },
];

const placeholders: DashboardPlaceholder[] = [
  {
    title: "Assigned students",
    description: "Student groups and support ownership will be listed here for assistant teachers.",
    icon: <Users className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Question explanations",
    description: "Requests for clearer question explanations and review notes will appear in this queue.",
    icon: <HelpCircle className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Weakness review",
    description: "Detected weaknesses that need human review will be organized here.",
    icon: <Target className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Support tasks",
    description: "Follow-ups, nudges, and teacher-assigned support work will collect in this section.",
    icon: <ListChecks className="h-5 w-5" aria-hidden="true" />,
  },
];

export function AssistantTeacherDashboardPage() {
  return (
    <PageContainer>
      <RoleDashboard
        eyebrow="Assistant teacher dashboard"
        title="Welcome to your support workspace."
        description="Coordinate student support, review weaknesses, prepare explanations, and keep teacher-assigned work visible."
        stats={stats}
        sectionsTitle="Assistant teacher modules"
        sectionsDescription="This local dashboard gives the assistant route real structure without adding APIs or model dependencies."
        placeholders={placeholders}
      />

      <Card className="p-6 sm:p-8">
        <SectionHeader
          eyebrow="Weakness Analysis"
          title="Student support and revision queue"
          description="Use the assistant panel to review weakness signals, question explanations, revision suggestions, and support tasks."
        />
      </Card>
      <AssistantTeacherPanel />
    </PageContainer>
  );
}
