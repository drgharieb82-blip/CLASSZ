import { createFileRoute } from "@tanstack/react-router";
import { StickyNote } from "lucide-react";
import { FutureModulePage } from "@/components/common/FutureModulePage";

export const Route = createFileRoute("/assistant-teacher/notes")({ component: NotesPage });

function NotesPage() {
  return <FutureModulePage role="assistant" title="at.notes" subtitle="at.notesSubtitle" icon={StickyNote} />;
}
