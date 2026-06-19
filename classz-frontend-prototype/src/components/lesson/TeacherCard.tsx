import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ExternalLink } from "lucide-react";

interface TeacherCardProps {
  name: string;
  subject: string;
  initials: string;
}

export function TeacherCard({ name, subject, initials }: TeacherCardProps) {
  return (
    <div className="rounded-2xl border bg-card/70 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Instructor</p>
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11">
          <AvatarFallback className="gradient-brand text-sm font-bold text-white">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{subject}</p>
        </div>
        <button className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border bg-card/60 transition-colors hover:bg-accent">
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
