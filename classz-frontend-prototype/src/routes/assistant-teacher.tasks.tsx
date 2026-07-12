import { createFileRoute } from "@tanstack/react-router";
import { KanbanSquare } from "lucide-react";
import { FutureModulePage } from "@/components/common/FutureModulePage";

export const Route = createFileRoute("/assistant-teacher/tasks")({ component: TasksPage });

function TasksPage() {
  return <FutureModulePage role="assistant" title="at.tasks" subtitle="at.tasksSubtitle" icon={KanbanSquare} />;
}
