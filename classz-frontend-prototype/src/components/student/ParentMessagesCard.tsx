import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParentMessage {
  from: string;
  message: string;
  time: string;
  unread: boolean;
}

interface ParentMessagesCardProps {
  messages: ParentMessage[];
}

export function ParentMessagesCard({ messages }: ParentMessagesCardProps) {
  if (messages.length === 0) return null;

  return (
    <div className="rounded-2xl border bg-card/70 p-5">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Family Messages</h3>
      </div>
      <div className="space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={cn(
            "rounded-xl border p-3",
            m.unread ? "border-primary/20 bg-primary/5" : "bg-background/30",
          )}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{m.from}</p>
              <span className="text-[11px] text-muted-foreground">{m.time}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
