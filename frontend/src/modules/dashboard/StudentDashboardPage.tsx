import { BarChart3, BookOpenCheck, Brain, CalendarCheck, PlayCircle, Target } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { AssistantTeacherPanel } from "../assistant/components";
import { ConceptEngineOverview } from "../concept-engine/components";
import { StudentMemoryOverview } from "../student-memory/components";
import { RoleDashboard, type DashboardPlaceholder, type DashboardStat } from "./RoleDashboard";

const stats: DashboardStat[] = [
  { label: "Learning progress", value: "42%", icon: BarChart3, tone: "primary", helperText: "Mock course completion" },
  { label: "Active lessons", value: "6", icon: BookOpenCheck, tone: "secondary", helperText: "Ready to continue" },
  { label: "Weak concepts", value: "3", icon: Target, tone: "warning", helperText: "Needs revision soon" },
  { label: "Memory signals", value: "Ready", icon: Brain, tone: "success", helperText: "Student memory placeholder" },
];

const placeholders: DashboardPlaceholder[] = [
  {
    title: "Learning progress",
    description: "Progress by course, lesson completion, and recent achievement summaries will appear here.",
    icon: <BarChart3 className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Continue learning",
    description: "The next lesson, video, assignment, or quiz will be surfaced as the primary student action.",
    icon: <PlayCircle className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Weak concepts",
    description: "Concept gaps detected from quizzes and assignments will be summarized for focused practice.",
    icon: <Target className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Revision plan",
    description: "A guided study plan will organize upcoming practice and review sessions.",
    icon: <CalendarCheck className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Student memory",
    description: "Long-term strengths, weaknesses, forgetting risk, and study patterns will connect here.",
    icon: <Brain className="h-5 w-5" aria-hidden="true" />,
  },
];

export function StudentDashboardPage() {
  return (
    <PageContainer>
      <RoleDashboard
        eyebrow="Student dashboard"
        title="Welcome back to your learning portal."
        description="Your dashboard brings lessons, progress, weak concepts, revision planning, and memory insights into one student-centered view."
        stats={stats}
        sectionsTitle="Student learning modules"
        sectionsDescription="These areas map the student dashboard surface and connect current platform modules."
        placeholders={placeholders}
      />

      <Card className="p-6 sm:p-8">
        <SectionHeader
          eyebrow="Learning Progress"
          title="Concept understanding and revision path"
          description="Current concept mastery, weak concepts, dependencies, and adaptive revision planning."
        />
      </Card>
      <ConceptEngineOverview />

      <Card className="p-6 sm:p-8">
        <SectionHeader
          eyebrow="Memory & Learning Style"
          title="Student memory profile"
          description="Strengths, weaknesses, learning patterns, study style, retention risk, and long-term memory signals."
        />
      </Card>
      <StudentMemoryOverview />

      <Card className="p-6 sm:p-8">
        <SectionHeader
          eyebrow="AI Assistant"
          title="Assistant teacher support"
          description="Mock assistant support for explanations, weakness analysis, and revision suggestions."
        />
      </Card>
      <AssistantTeacherPanel />
    </PageContainer>
  );
}
