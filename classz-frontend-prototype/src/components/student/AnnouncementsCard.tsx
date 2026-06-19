import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface Announcement {
  from: string;
  course: string;
  message: string;
  time: string;
  unread: boolean;
}

interface AnnouncementsCardProps {
  announcements: Announcement[];
}

export function AnnouncementsCard({ announcements }: AnnouncementsCardProps) {
  return (
    <div className="rounded-2xl border bg-card/70 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Announcements</h3>
      </div>
      <div className="space-y-2">
        {announcements.map((a, i) => (
          <div key={i} className={cn(
            "rounded-xl border p-3 transition-colors",
            a.unread ? "border-primary/20 bg-primary/5" : "bg-background/30",
          )}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{a.from}</p>
              <div className="flex items-center gap-1.5">
                {a.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                <span className="text-[11px] text-muted-foreground">{a.time}</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{a.course}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{a.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
