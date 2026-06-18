import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-muted/60", className)}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent animate-[shimmer_1.6s_infinite]" />
    </div>
  );
}

/** Premium skeleton loading state for dashboard-style pages. */
export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Shimmer className="h-8 w-64" />
        <Shimmer className="h-4 w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Shimmer className="h-64 lg:col-span-2" />
        <Shimmer className="h-64" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Shimmer key={i} className="h-14" />
      ))}
    </div>
  );
}

export { Shimmer };
