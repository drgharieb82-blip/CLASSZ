import { Bot, Sparkles } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { PageContainer } from "../../../components/ui/PageContainer";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { ChatBubble } from "./ChatBubble";
import { RevisionCard } from "./RevisionCard";
import { SuggestionCard } from "./SuggestionCard";
import { WeaknessCard } from "./WeaknessCard";

export function AssistantTeacherPanel() {
  return (
    <PageContainer className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="flex min-h-[32rem] flex-col p-5 sm:p-6">
        <SectionHeader
          eyebrow="Assistant"
          title="Assistant Teacher"
          description="A presentation-ready assistant panel foundation for future teacher-guided AI workflows."
          icon={<Bot className="h-6 w-6 text-teal-600 dark:text-teal-300" aria-hidden="true" />}
        />

        <div className="mt-6 flex flex-1 flex-col justify-end gap-3">
          <EmptyState
            title="No conversation selected"
            description="Assistant conversations and classroom support messages will appear here when connected."
          />
          <ChatBubble />
        </div>
      </Card>

      <aside className="space-y-4">
        <Card className="p-5">
          <SectionHeader
            title="Teacher support"
            description="Future suggestions, weaknesses, and revision plans will use this foundation."
            icon={<Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-300" aria-hidden="true" />}
          />
        </Card>
        <SuggestionCard />
        <WeaknessCard />
        <RevisionCard />
      </aside>
    </PageContainer>
  );
}
