import { Lightbulb, AlertTriangle } from "lucide-react";

interface ContentBlock {
  type: "text" | "equation" | "note" | "warning" | "image";
  content: string;
  label?: string;
}

interface LessonContentProps {
  blocks: ContentBlock[];
}

export function LessonContent({ blocks }: LessonContentProps) {
  return (
    <div className="space-y-4 rounded-2xl border bg-card/70 p-5 sm:p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Lesson Content</h3>
      <div className="space-y-4">
        {blocks.map((block, i) => {
          if (block.type === "text") {
            return <p key={i} className="text-sm leading-relaxed text-muted-foreground">{block.content}</p>;
          }

          if (block.type === "equation") {
            return (
              <div key={i} className="rounded-xl border bg-background/50 p-4">
                {block.label && (
                  <p className="mb-2 text-xs font-medium text-primary">{block.label}</p>
                )}
                <p className="font-mono text-sm tracking-wide">{block.content}</p>
              </div>
            );
          }

          if (block.type === "note") {
            return (
              <div key={i} className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">{block.content}</p>
              </div>
            );
          }

          if (block.type === "warning") {
            return (
              <div key={i} className="flex gap-3 rounded-xl border border-warning/20 bg-warning/5 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <p className="text-sm text-muted-foreground">{block.content}</p>
              </div>
            );
          }

          if (block.type === "image") {
            return (
              <div key={i} className="overflow-hidden rounded-xl border bg-background/50 p-4">
                <div className="flex aspect-[16/9] max-h-48 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <span className="text-sm">{block.content}</span>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
