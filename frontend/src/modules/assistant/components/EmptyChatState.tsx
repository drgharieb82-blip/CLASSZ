import { MessageCircle } from "lucide-react";

import { EmptyState } from "../../../components/ui/EmptyState";

export function EmptyChatState() {
  return (
    <EmptyState
      title="Assistant teacher"
      description="Start a conversation to get guided explanations, revision prompts, and learning support."
      icon={<MessageCircle className="h-5 w-5" aria-hidden="true" />}
      className="h-full"
    />
  );
}
