import { clsx } from "clsx";
import { Bot, UserRound } from "lucide-react";

import type { ChatMessage } from "../types";

type ChatBubbleProps = {
  message: ChatMessage;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <article className={clsx("flex gap-3", isAssistant ? "justify-start" : "justify-end")}>
      {isAssistant ? (
        <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 shadow-sm dark:bg-teal-400/10 dark:text-teal-200">
          <Bot className="h-4 w-4" aria-hidden="true" />
        </span>
      ) : null}

      <div
        className={clsx(
          "max-w-[min(100%,42rem)] rounded-2xl border px-4 py-3 text-sm leading-6 shadow-sm transition duration-200",
          isAssistant
            ? "rounded-ss-md border-slate-200 bg-white text-slate-800 dark:border-white/10 dark:bg-white/[0.07] dark:text-slate-100"
            : "rounded-se-md border-teal-600 bg-teal-600 text-white shadow-[0_12px_28px_rgba(13,148,136,0.22)] dark:border-teal-400 dark:bg-teal-400 dark:text-slate-950",
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <time
          className={clsx(
            "mt-2 block text-xs font-medium",
            isAssistant ? "text-slate-400 dark:text-slate-500" : "text-teal-50/80 dark:text-slate-700",
          )}
          dateTime={message.createdAt}
        >
          {formatTime(message.createdAt)}
        </time>
      </div>

      {!isAssistant ? (
        <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950">
          <UserRound className="h-4 w-4" aria-hidden="true" />
        </span>
      ) : null}
    </article>
  );
}
