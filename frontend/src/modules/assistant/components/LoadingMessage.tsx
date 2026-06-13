import { Bot } from "lucide-react";

export function LoadingMessage() {
  return (
    <div className="flex justify-start gap-3">
      <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 shadow-sm dark:bg-teal-400/10 dark:text-teal-200">
        <Bot className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="rounded-2xl rounded-ss-md border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.07]">
        <div className="flex items-center gap-1.5" aria-label="Assistant is typing">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-2 w-2 animate-bounce rounded-full bg-teal-500 dark:bg-teal-300"
              style={{ animationDelay: `${dot * 120}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
