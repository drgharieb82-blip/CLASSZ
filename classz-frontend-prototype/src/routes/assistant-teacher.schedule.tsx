import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { FutureModulePage } from "@/components/common/FutureModulePage";

export const Route = createFileRoute("/assistant-teacher/schedule")({ component: SchedulePage });

function SchedulePage() {
  return <FutureModulePage role="assistant" title="at.schedule" subtitle="at.scheduleSubtitle" icon={CalendarDays} />;
}
