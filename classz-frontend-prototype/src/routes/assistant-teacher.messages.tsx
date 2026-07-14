import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { FutureModulePage } from "@/components/common/FutureModulePage";

export const Route = createFileRoute("/assistant-teacher/messages")({ component: MessagesPage });

function MessagesPage() {
  return <FutureModulePage role="assistant" title="at.messages" subtitle="at.messagesSubtitle" icon={MessageSquare} />;
}
