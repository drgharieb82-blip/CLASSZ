import { clsx } from "clsx";

type LoadingSkeletonProps = {
  className?: string;
  lines?: number;
};

export function LoadingSkeleton({ className, lines = 4 }: LoadingSkeletonProps) {
  return (
    <div className={clsx("rounded-xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]", className)}>
      <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={clsx(
              "h-3 animate-pulse rounded-full bg-slate-200 dark:bg-white/10",
              index % 3 === 0 ? "w-full" : index % 3 === 1 ? "w-5/6" : "w-2/3",
            )}
          />
        ))}
      </div>
    </div>
  );
}
